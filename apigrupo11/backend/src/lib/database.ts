import { Pool, PoolClient } from 'pg';
import { 
  Producto, 
  ProductoInput, 
  ProductoUpdate, 
  Categoria, 
  Dimensiones, 
  UbicacionAlmacen, 
  ImagenProducto 
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
  }): Promise<Producto[]> {
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
        p.imagenes,
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

    baseQuery += ' GROUP BY p.id, p.nombre, p.descripcion, p.precio, p.stock_disponible, p.peso_kg, p.dimensiones, p.ubicacion, p.imagenes';
    baseQuery += ' ORDER BY p.id';

    // Pagination
    const page = Math.max(1, filter?.page || 1);
    const limit = Math.min(100, Math.max(1, filter?.limit || 20));
    const offset = (page - 1) * limit;

    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const rows = await query<Producto>(baseQuery, params);
    return rows;
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
        p.imagenes,
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
      GROUP BY p.id, p.nombre, p.descripcion, p.precio, p.stock_disponible, p.peso_kg, p.dimensiones, p.ubicacion, p.imagenes
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
          nombre, descripcion, precio, stock_disponible, peso_kg, dimensiones, ubicacion, imagenes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, nombre, descripcion, precio, stock_disponible as "stockDisponible", 
                  peso_kg as "pesoKg", dimensiones, ubicacion, imagenes
      `;

      const productValues = [
        data.nombre,
        data.descripcion || null,
        data.precio,
        data.stockInicial,
        data.pesoKg || null,
        data.dimensiones ? JSON.stringify(data.dimensiones) : null,
        data.ubicacion ? JSON.stringify(data.ubicacion) : null,
        data.imagenes ? JSON.stringify(data.imagenes) : null
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

      if (data.imagenes !== undefined) {
        updates.push(`imagenes = $${paramIndex}`);
        values.push(data.imagenes ? JSON.stringify(data.imagenes) : null);
        paramIndex++;
      }

      if (updates.length === 0) return null;

      const updateQuery = `
        UPDATE productos 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, nombre, descripcion, precio, stock_disponible as "stockDisponible",
                  peso_kg as "pesoKg", dimensiones, ubicacion, imagenes
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
