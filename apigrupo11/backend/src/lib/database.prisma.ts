/**
 * Database operations using Prisma ORM
 * This file replaces the SQL queries in database.ts with Prisma
 */

import { prisma } from './prisma';
import { Prisma } from '@prisma/client';
import { 
  Producto, 
  ProductoInput, 
  ProductoUpdate, 
  Categoria,
  ReservaCompleta,
  EstadoReserva
} from './types';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Transform Prisma product to app Product type
 * Converts Decimal to number for precio and pesoKg
 */
function transformProducto(producto: any): Producto {
  // Calculate reserved stock if relationship is loaded
  const stockReservado = producto.reservaProductos
    ? producto.reservaProductos.reduce((acc: number, item: any) => acc + item.cantidad, 0)
    : 0;

  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: Number(producto.precio),
    stockDisponible: producto.stockDisponible,
    stockReservado,
    pesoKg: producto.pesoKg ? Number(producto.pesoKg) : undefined,
    dimensiones: producto.dimensiones,
    ubicacion: producto.ubicacion,
    imagenes: producto.imagenes,
    categorias: producto.categorias?.map((pc: any) => pc.categoria) || []
  };
}

/**
 * Transform Prisma reservation to app ReservaCompleta type
 * Converts field names and Decimal to number
 */
function transformReserva(reserva: any): ReservaCompleta {
  return {
    idReserva: reserva.id,
    idCompra: reserva.idCompra,
    usuarioId: reserva.usuarioId,
    estado: reserva.estado as EstadoReserva,
    expiresAt: reserva.expiresAt.toISOString(),
    fechaCreacion: reserva.createdAt.toISOString(),
    fechaActualizacion: reserva.updatedAt.toISOString(),
    productos: reserva.productos?.map((p: any) => ({
      id: p.id,
      idProducto: p.productoId,
      nombreProducto: p.productoNombre,
      cantidad: p.cantidad,
      precioUnitario: Number(p.precioUnitario)
    })) || []
  };
}

// ============================================
// PRODUCTOS
// ============================================

export const productoDB = {
  /**
   * List products with optional filters
   */
  async list(filter?: { 
    categoriaId?: number; 
    q?: string; 
    page?: number; 
    limit?: number; 
  }): Promise<{ 
    data: Producto[]; 
    pagination: { page: number; limit: number; total: number; totalPages: number } 
  }> {
    // Build where clause
    const where: Prisma.ProductoWhereInput = {};

    if (filter?.categoriaId) {
      where.categorias = {
        some: {
          categoriaId: filter.categoriaId
        }
      };
    }

    if (filter?.q) {
      where.OR = [
        { nombre: { contains: filter.q, mode: 'insensitive' } },
        { descripcion: { contains: filter.q, mode: 'insensitive' } }
      ];
    }

    // Pagination
    const page = Math.max(1, filter?.page || 1);
    const limit = Math.min(100, Math.max(1, filter?.limit || 20));
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.producto.count({ where });
    const totalPages = Math.ceil(total / limit);

    // Get products with categories and active reservations
    const productos = await prisma.producto.findMany({
      where,
      include: {
        categorias: {
          include: {
            categoria: {
              select: {
                id: true,
                nombre: true,
                descripcion: true
              }
            }
          }
        },
        reservaProductos: {
          where: {
            reserva: {
              estado: { in: ['pendiente', 'confirmado'] }
            }
          },
          select: {
            cantidad: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { id: 'asc' }
    });

    // Transform to match the expected format
    const data = productos.map(transformProducto) as Producto[];

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },

  /**
   * Get a single product by ID
   */
  async getById(id: number): Promise<Producto | null> {
    const producto = await prisma.producto.findUnique({
      where: { id },
      include: {
        categorias: {
          include: {
            categoria: {
              select: {
                id: true,
                nombre: true,
                descripcion: true
              }
            }
          }
        },
        reservaProductos: {
          where: {
            reserva: {
              estado: { in: ['pendiente', 'confirmado'] }
            }
          },
          select: {
            cantidad: true
          }
        }
      }
    });

    if (!producto) return null;

    return transformProducto(producto) as Producto;
  },

  /**
   * Create a new product
   */
  async create(data: ProductoInput): Promise<{ 
    creado: Producto; 
    resp: { id: number; mensaje: string } 
  }> {
    const producto = await prisma.producto.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || undefined,
        precio: data.precio,
        stockDisponible: data.stockInicial,
        pesoKg: data.pesoKg || undefined,
        dimensiones: data.dimensiones as any || undefined,
        ubicacion: data.ubicacion as any || undefined,
        imagenes: data.imagenes as any || undefined,
        categorias: data.categoriaIds ? {
          create: data.categoriaIds.map(categoriaId => ({
            categoriaId
          }))
        } : undefined
      },
      include: {
        categorias: {
          include: {
            categoria: {
              select: {
                id: true,
                nombre: true,
                descripcion: true
              }
            }
          }
        }
      }
    });

    const creado = transformProducto(producto) as Producto;

    return {
      creado,
      resp: {
        id: producto.id,
        mensaje: "Producto creado correctamente"
      }
    };
  },

  /**
   * Update an existing product
   */
  async update(id: number, data: ProductoUpdate): Promise<Producto | null> {
    // Check if product exists
    const existingProduct = await prisma.producto.findUnique({ where: { id } });
    if (!existingProduct) return null;

    // Prepare update data
    const updateData: Prisma.ProductoUpdateInput = {};

    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.precio !== undefined) updateData.precio = data.precio;
    if (data.stockInicial !== undefined) updateData.stockDisponible = data.stockInicial;
    if (data.pesoKg !== undefined) updateData.pesoKg = data.pesoKg;
    if (data.dimensiones !== undefined) updateData.dimensiones = data.dimensiones as any;
    if (data.ubicacion !== undefined) updateData.ubicacion = data.ubicacion as any;
    if (data.imagenes !== undefined) updateData.imagenes = data.imagenes as any;

    // Handle category updates
    if (data.categoriaIds !== undefined) {
      // Delete existing categories and create new ones
      await prisma.productoCategoria.deleteMany({
        where: { productoId: id }
      });

      if (data.categoriaIds.length > 0) {
        updateData.categorias = {
          create: data.categoriaIds.map(categoriaId => ({
            categoriaId
          }))
        };
      }
    }

    const producto = await prisma.producto.update({
      where: { id },
      data: updateData,
      include: {
        categorias: {
          include: {
            categoria: {
              select: {
                id: true,
                nombre: true,
                descripcion: true
              }
            }
          }
        }
      }
    });

    return transformProducto(producto) as Producto;
  },

  /**
   * Delete a product
   */
  async delete(id: number): Promise<boolean> {
    try {
      await prisma.producto.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Update stock for a product
   */
  async updateStock(id: number, cantidad: number): Promise<Producto | null> {
    try {
      const producto = await prisma.producto.update({
        where: { id },
        data: {
          stockDisponible: {
            increment: cantidad
          }
        },
        include: {
          categorias: {
            include: {
              categoria: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true
                }
              }
            }
          }
        }
      });

      return transformProducto(producto) as Producto;
    } catch (error) {
      return null;
    }
  }
};

// ============================================
// CATEGORIAS
// ============================================

export const categoriaDB = {
  /**
   * List all categories
   */
  async list(): Promise<Categoria[]> {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nombre: 'asc' }
    });

    return categorias as Categoria[];
  },

  /**
   * Get a single category by ID
   */
  async getById(id: number): Promise<Categoria | null> {
    const categoria = await prisma.categoria.findUnique({
      where: { id }
    });

    return categoria as Categoria | null;
  },

  /**
   * Create a new category
   */
  async create(data: { nombre: string; descripcion?: string }): Promise<Categoria> {
    const categoria = await prisma.categoria.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null
      }
    });

    return categoria as Categoria;
  },

  /**
   * Update a category
   */
  async update(id: number, data: { nombre?: string; descripcion?: string }): Promise<Categoria | null> {
    try {
      const categoria = await prisma.categoria.update({
        where: { id },
        data: {
          ...(data.nombre !== undefined && { nombre: data.nombre }),
          ...(data.descripcion !== undefined && { descripcion: data.descripcion })
        }
      });

      return categoria as Categoria;
    } catch (error) {
      return null;
    }
  },

  /**
   * Delete a category
   */
  async delete(id: number): Promise<boolean> {
    try {
      await prisma.categoria.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }
};

// ============================================
// RESERVAS
// ============================================

export const reservaDB = {
  /**
   * Create a new reservation
   */
  async create(data: {
    idCompra: string;
    usuarioId: number;
    productos: Array<{
      productoId: number;
      productoNombre: string;
      cantidad: number;
      precioUnitario: number;
    }>;
    expiresAt: Date;
  }): Promise<ReservaCompleta> {
    const reserva = await prisma.reserva.create({
      data: {
        idCompra: data.idCompra,
        usuarioId: data.usuarioId,
        estado: 'pendiente',
        expiresAt: data.expiresAt,
        productos: {
          create: data.productos.map(p => ({
            productoId: p.productoId,
            productoNombre: p.productoNombre,
            cantidad: p.cantidad,
            precioUnitario: p.precioUnitario
          }))
        }
      },
      include: {
        productos: {
          include: {
            producto: true
          }
        }
      }
    });

    return transformReserva(reserva);
  },

  /**
   * Get a reservation by ID
   */
  async getById(id: number): Promise<ReservaCompleta | null> {
    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        productos: {
          include: {
            producto: true
          }
        }
      }
    });

    if (!reserva) return null;

    return transformReserva(reserva);
  },

  /**
   * Get a reservation by purchase ID
   */
  async getByIdCompra(idCompra: string): Promise<ReservaCompleta | null> {
    const reserva = await prisma.reserva.findUnique({
      where: { idCompra },
      include: {
        productos: {
          include: {
            producto: true
          }
        }
      }
    });

    if (!reserva) return null;

    return transformReserva(reserva);
  },

  /**
   * Update reservation status
   */
  async updateStatus(
    id: number, 
    estado: EstadoReserva, 
    motivoCancelacion?: string
  ): Promise<ReservaCompleta | null> {
    try {
      const reserva = await prisma.reserva.update({
        where: { id },
        data: {
          estado,
          ...(motivoCancelacion && { motivoCancelacion })
        },
        include: {
          productos: {
            include: {
              producto: true
            }
          }
        }
      });

      return transformReserva(reserva);
    } catch (error) {
      return null;
    }
  },

  /**
   * Get expired pending reservations
   */
  async getExpiredPending(): Promise<ReservaCompleta[]> {
    const reservas = await prisma.reserva.findMany({
      where: {
        estado: 'pendiente',
        expiresAt: {
          lt: new Date()
        }
      },
      include: {
        productos: {
          include: {
            producto: true
          }
        }
      }
    });

    return reservas.map(transformReserva);
  },

  /**
   * List reservations by user
   */
  async listByUser(usuarioId: number): Promise<ReservaCompleta[]> {
    const reservas = await prisma.reserva.findMany({
      where: { usuarioId },
      include: {
        productos: {
          include: {
            producto: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reservas.map(transformReserva);
  },

  /**
   * List all reservations (no filter)
   */
  async listAll(): Promise<ReservaCompleta[]> {
    const reservas = await prisma.reserva.findMany({
      include: {
        productos: {
          include: {
            producto: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reservas.map(transformReserva);
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check database connection
 */
export async function checkConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

/**
 * Disconnect from database
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}
