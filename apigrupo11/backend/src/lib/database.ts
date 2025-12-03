import { Pool, PoolClient } from 'pg';
import { 
  Producto, 
  ProductoInput, 
  ProductoUpdate, 
  Categoria, 
  Dimensiones, 
  UbicacionAlmacen, 
  ImagenProducto,
  ReservaCompleta,
  ReservaProductoDetalle,
  EstadoReserva
} from './types';

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'stock_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20, // maximum number of clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helper function to execute queries
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// Helper function for transactions
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Database operations for Productos
export const productoDB = {
  // List products with optional filters
  async list(filter?: { 
    categoriaId?: number; 
    q?: string; 
    page?: number; 
    limit?: number; 
  }): Promise<{ data: Producto[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    let baseQuery = `
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock_disponible as "stockDisponible",
        p.peso_kg as "pesoKg",
        p.dimensiones,
        p.ubicacion,
        COALESCE(
          json_agg(
            CASE WHEN c.id IS NOT NULL 
            THEN json_build_object('id', c.id, 'nombre', c.nombre, 'descripcion', c.descripcion)
            ELSE NULL END
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'::json
        ) as categorias
      FROM productos p
      LEFT JOIN producto_categorias pc ON p.id = pc.producto_id
      LEFT JOIN categorias c ON pc.categoria_id = c.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filter?.categoriaId) {
      conditions.push(`pc.categoria_id = $${paramIndex}`);
      params.push(filter.categoriaId);
      paramIndex++;
    }

    if (filter?.q) {
      conditions.push(`(p.nombre ILIKE $${paramIndex} OR p.descripcion ILIKE $${paramIndex})`);
      params.push(`%${filter.q}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    baseQuery += ' GROUP BY p.id, p.nombre, p.descripcion, p.precio, p.stock_disponible, p.peso_kg, p.dimensiones, p.ubicacion';
    baseQuery += ' ORDER BY p.id';

    // Get total count before pagination
    const countQuery = `SELECT COUNT(DISTINCT p.id) as total FROM productos p
      LEFT JOIN producto_categorias pc ON p.id = pc.producto_id
      ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}`;
    const countResult = await query<{ total: string }>(countQuery, params.slice(0, paramIndex - 1));
    const total = parseInt(countResult[0]?.total || '0');

    // Pagination
    const page = Math.max(1, filter?.page || 1);
    const limit = Math.min(100, Math.max(1, filter?.limit || 20));
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const rows = await query<Producto>(baseQuery, params);
    
    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },

  // Get a single product by ID
  async getById(id: number): Promise<Producto | null> {
    const queryText = `
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock_disponible as "stockDisponible",
        p.peso_kg as "pesoKg",
        p.dimensiones,
        p.ubicacion,
        COALESCE(
          json_agg(
            CASE WHEN c.id IS NOT NULL 
            THEN json_build_object('id', c.id, 'nombre', c.nombre, 'descripcion', c.descripcion)
            ELSE NULL END
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'::json
        ) as categorias
      FROM productos p
      LEFT JOIN producto_categorias pc ON p.id = pc.producto_id
      LEFT JOIN categorias c ON pc.categoria_id = c.id
      WHERE p.id = $1
      GROUP BY p.id, p.nombre, p.descripcion, p.precio, p.stock_disponible, p.peso_kg, p.dimensiones, p.ubicacion
    `;

    const rows = await query<Producto>(queryText, [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  // Create a new product
  async create(data: ProductoInput): Promise<{ creado: Producto; resp: { id: number; mensaje: string } }> {
    return await withTransaction(async (client) => {
      // Insert the product
      const insertQuery = `
        INSERT INTO productos (
          nombre, descripcion, precio, stock_disponible, peso_kg, dimensiones, ubicacion
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, nombre, descripcion, precio, stock_disponible as "stockDisponible", 
                  peso_kg as "pesoKg", dimensiones, ubicacion
      `;

      const productValues = [
        data.nombre,
        data.descripcion || null,
        data.precio,
        data.stockInicial,
        data.pesoKg || null,
        data.dimensiones ? JSON.stringify(data.dimensiones) : null,
        data.ubicacion ? JSON.stringify(data.ubicacion) : null
      ];

      const productResult = await client.query(insertQuery, productValues);
      const newProduct = productResult.rows[0];

      // Handle categories if provided
      if (data.categoriaIds && data.categoriaIds.length > 0) {
        for (const categoriaId of data.categoriaIds) {
          await client.query(
            'INSERT INTO producto_categorias (producto_id, categoria_id) VALUES ($1, $2)',
            [newProduct.id, categoriaId]
          );
        }

        // Fetch categories for the response
        const categoriesQuery = `
          SELECT c.id, c.nombre, c.descripcion
          FROM categorias c
          JOIN producto_categorias pc ON c.id = pc.categoria_id
          WHERE pc.producto_id = $1
        `;
        const categoriesResult = await client.query(categoriesQuery, [newProduct.id]);
        newProduct.categorias = categoriesResult.rows;
      } else {
        newProduct.categorias = [];
      }

      return {
        creado: newProduct,
        resp: {
          id: newProduct.id,
          mensaje: "Producto creado correctamente"
        }
      };
    });
  },

  // Update an existing product
  async update(id: number, data: ProductoUpdate): Promise<Producto | null> {
    return await withTransaction(async (client) => {
      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.nombre !== undefined) {
        updates.push(`nombre = $${paramIndex}`);
        values.push(data.nombre);
        paramIndex++;
      }

      if (data.descripcion !== undefined) {
        updates.push(`descripcion = $${paramIndex}`);
        values.push(data.descripcion);
        paramIndex++;
      }

      if (data.precio !== undefined) {
        updates.push(`precio = $${paramIndex}`);
        values.push(data.precio);
        paramIndex++;
      }

      if (data.stockInicial !== undefined) {
        updates.push(`stock_disponible = $${paramIndex}`);
        values.push(data.stockInicial);
        paramIndex++;
      }

      if (data.pesoKg !== undefined) {
        updates.push(`peso_kg = $${paramIndex}`);
        values.push(data.pesoKg);
        paramIndex++;
      }

      if (data.dimensiones !== undefined) {
        updates.push(`dimensiones = $${paramIndex}`);
        values.push(data.dimensiones ? JSON.stringify(data.dimensiones) : null);
        paramIndex++;
      }

      if (data.ubicacion !== undefined) {
        updates.push(`ubicacion = $${paramIndex}`);
        values.push(data.ubicacion ? JSON.stringify(data.ubicacion) : null);
        paramIndex++;
      }

      if (updates.length === 0) return null;

      const updateQuery = `
        UPDATE productos 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, nombre, descripcion, precio, stock_disponible as "stockDisponible",
            peso_kg as "pesoKg", dimensiones, ubicacion
      `;
      values.push(id);

      const result = await client.query(updateQuery, values);
      if (result.rows.length === 0) return null;

      const updatedProduct = result.rows[0];

      // Handle category updates if provided
      if (data.categoriaIds !== undefined) {
        // Remove existing categories
        await client.query('DELETE FROM producto_categorias WHERE producto_id = $1', [id]);

        // Add new categories
        if (data.categoriaIds.length > 0) {
          for (const categoriaId of data.categoriaIds) {
            await client.query(
              'INSERT INTO producto_categorias (producto_id, categoria_id) VALUES ($1, $2)',
              [id, categoriaId]
            );
          }
        }
      }

      // Fetch categories for the response
      const categoriesQuery = `
        SELECT c.id, c.nombre, c.descripcion
        FROM categorias c
        JOIN producto_categorias pc ON c.id = pc.categoria_id
        WHERE pc.producto_id = $1
      `;
      const categoriesResult = await client.query(categoriesQuery, [id]);
      updatedProduct.categorias = categoriesResult.rows;

      return updatedProduct;
    });
  },

  // Delete a product
  async delete(id: number): Promise<boolean> {
    return await withTransaction(async (client) => {
      // Delete category associations first
      await client.query('DELETE FROM producto_categorias WHERE producto_id = $1', [id]);
      
      // Delete the product
      const result = await client.query('DELETE FROM productos WHERE id = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    });
  },

  // Update stock (for reservations)
  async updateStock(productoId: number, cantidad: number): Promise<void> {
    const queryText = `
      UPDATE productos 
      SET stock_disponible = stock_disponible + $1
      WHERE id = $2
    `;
    await query(queryText, [cantidad, productoId]);
  }
};

// Database operations for Reservas
export const reservasDB = {
  // Create a new reservation
  async create(data: { 
    idCompra: string; 
    usuarioId: number; 
    productos: Array<{ idProducto: number; cantidad: number; nombre: string; precioUnitario: number }> 
  }): Promise<ReservaCompleta> {
    return await withTransaction(async (client) => {
      // Calculate expiration time (30 minutes from now)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      // Insert reservation header
      const insertReservaQuery = `
        INSERT INTO reservas (id_compra, usuario_id, estado, expires_at)
        VALUES ($1, $2, $3, $4)
        RETURNING id, id_compra as "idCompra", usuario_id as "usuarioId", 
                  estado, expires_at as "expiresAt", 
                  created_at as "fechaCreacion", updated_at as "fechaActualizacion"
      `;
      const reservaResult = await client.query(insertReservaQuery, [
        data.idCompra,
        data.usuarioId,
        'confirmado',
        expiresAt
      ]);
      const reserva = reservaResult.rows[0];

      // Insert reservation items
      const productosDetalle: ReservaProductoDetalle[] = [];
      for (const item of data.productos) {
        const insertItemQuery = `
          INSERT INTO reserva_productos (reserva_id, producto_id, producto_nombre, cantidad, precio_unitario)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING producto_id as "idProducto", producto_nombre as nombre, cantidad, precio_unitario as "precioUnitario"
        `;
        const itemResult = await client.query(insertItemQuery, [
          reserva.id,
          item.idProducto,
          item.nombre,
          item.cantidad,
          item.precioUnitario
        ]);
        productosDetalle.push(itemResult.rows[0]);
      }

      return {
        idReserva: reserva.id,
        idCompra: reserva.idCompra,
        usuarioId: reserva.usuarioId,
        estado: reserva.estado,
        expiresAt: reserva.expiresAt,
        fechaCreacion: reserva.fechaCreacion,
        fechaActualizacion: reserva.fechaActualizacion,
        productos: productosDetalle
      };
    });
  },

  // List reservations with optional filters
  async list(filter?: {
    usuarioId?: number;
    estado?: EstadoReserva;
    page?: number;
    limit?: number;
  }): Promise<ReservaCompleta[]> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filter?.usuarioId !== undefined) {
      conditions.push(`r.usuario_id = $${paramIndex}`);
      params.push(filter.usuarioId);
      paramIndex++;
    }

    if (filter?.estado) {
      conditions.push(`r.estado = $${paramIndex}`);
      params.push(filter.estado);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Pagination
    const page = Math.max(1, filter?.page || 1);
    const limit = Math.min(100, Math.max(1, filter?.limit || 20));
    const offset = (page - 1) * limit;

    const queryText = `
      SELECT 
        r.id as "idReserva",
        r.id_compra as "idCompra",
        r.usuario_id as "usuarioId",
        r.estado,
        r.expires_at as "expiresAt",
        r.created_at as "fechaCreacion",
        r.updated_at as "fechaActualizacion",
        json_agg(
          json_build_object(
            'idProducto', rp.producto_id,
            'nombre', rp.producto_nombre,
            'cantidad', rp.cantidad,
            'precioUnitario', rp.precio_unitario
          ) ORDER BY rp.id
        ) as productos
      FROM reservas r
      LEFT JOIN reserva_productos rp ON r.id = rp.reserva_id
      ${whereClause}
      GROUP BY r.id, r.id_compra, r.usuario_id, r.estado, r.expires_at, r.created_at, r.updated_at
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const rows = await query<ReservaCompleta>(queryText, params);
    return rows;
  },

  // Get a single reservation by ID
  async getById(idReserva: number, usuarioId?: number): Promise<ReservaCompleta | null> {
    const conditions = ['r.id = $1'];
    const params: any[] = [idReserva];
    
    if (usuarioId !== undefined) {
      conditions.push('r.usuario_id = $2');
      params.push(usuarioId);
    }

    const queryText = `
      SELECT 
        r.id as "idReserva",
        r.id_compra as "idCompra",
        r.usuario_id as "usuarioId",
        r.estado,
        r.expires_at as "expiresAt",
        r.created_at as "fechaCreacion",
        r.updated_at as "fechaActualizacion",
        json_agg(
          json_build_object(
            'idProducto', rp.producto_id,
            'nombre', rp.producto_nombre,
            'cantidad', rp.cantidad,
            'precioUnitario', rp.precio_unitario
          ) ORDER BY rp.id
        ) as productos
      FROM reservas r
      LEFT JOIN reserva_productos rp ON r.id = rp.reserva_id
      WHERE ${conditions.join(' AND ')}
      GROUP BY r.id, r.id_compra, r.usuario_id, r.estado, r.expires_at, r.created_at, r.updated_at
    `;

    const rows = await query<ReservaCompleta>(queryText, params);
    return rows.length > 0 ? rows[0] : null;
  },

  // Update reservation status
  async updateStatus(idReserva: number, estado: EstadoReserva, usuarioId?: number): Promise<ReservaCompleta | null> {
    return await withTransaction(async (client) => {
      const conditions = ['id = $1'];
      const params: any[] = [idReserva];
      let paramIndex = 2;

      if (usuarioId !== undefined) {
        conditions.push(`usuario_id = $${paramIndex}`);
        params.push(usuarioId);
        paramIndex++;
      }

      const updateQuery = `
        UPDATE reservas
        SET estado = $${paramIndex}, updated_at = NOW()
        WHERE ${conditions.join(' AND ')}
        RETURNING id
      `;
      params.push(estado);

      const result = await client.query(updateQuery, params);
      if (result.rows.length === 0) return null;

      return await this.getById(idReserva, usuarioId);
    });
  },

  // Cancel reservation and restore stock
  async cancel(idReserva: number, motivo?: string): Promise<boolean> {
    return await withTransaction(async (client) => {
      // Get reservation items to restore stock
      const itemsQuery = `
        SELECT producto_id, cantidad
        FROM reserva_productos
        WHERE reserva_id = $1
      `;
      const itemsResult = await client.query(itemsQuery, [idReserva]);

      // Restore stock for each product
      for (const item of itemsResult.rows) {
        await client.query(
          'UPDATE productos SET stock_disponible = stock_disponible + $1 WHERE id = $2',
          [item.cantidad, item.producto_id]
        );
      }

      // Update reservation status
      const updateQuery = `
        UPDATE reservas
        SET estado = 'cancelado', updated_at = NOW()
        WHERE id = $1
      `;
      const result = await client.query(updateQuery, [idReserva]);

      return (result.rowCount ?? 0) > 0;
    });
  },

  // Delete a reservation (admin only)
  async delete(idReserva: number): Promise<boolean> {
    return await withTransaction(async (client) => {
      // Delete reservation items first (CASCADE should handle this, but being explicit)
      await client.query('DELETE FROM reserva_productos WHERE reserva_id = $1', [idReserva]);
      
      // Delete the reservation
      const result = await client.query('DELETE FROM reservas WHERE id = $1', [idReserva]);
      return (result.rowCount ?? 0) > 0;
    });
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});
