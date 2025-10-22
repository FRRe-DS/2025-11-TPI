// In-memory pseudo database for demo purposes only.
// NOTE: This resets on server restart. Replace with a real DB for production.

import { Producto, ProductoInput, ProductoUpdate, Categoria, ReservaInput, ReservaOutput, ReservaCompleta, EstadoReserva, ActualizarReservaInput, LiberacionInput, LiberacionOutput } from "./types";

let nextProductId = 1;
let nextCategoriaId = 1;
let nextReservaId = 1;

const categorias = new Map<number, Categoria>();
const productos = new Map<number, Producto & { categoriaIds?: number[] }>();

// reservas: store basic header + items
interface ReservaRow {
  idReserva: number;
  idCompra: string;
  usuarioId: number;
  estado: EstadoReserva;
  expiresAt: string;
  fechaCreacion: string;
  fechaActualizacion?: string;
  items: { idProducto: number; cantidad: number }[];
}
const reservas = new Map<number, ReservaRow>();

function nowISO() {
  return new Date().toISOString();
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60000);
}

export const db = {
  // Categorias
  listCategorias(): Categoria[] {
    return Array.from(categorias.values());
  },
  getCategoria(id: number): Categoria | undefined {
    return categorias.get(id);
  },
  createCategoria(data: Omit<Categoria, "id">): Categoria {
    const cat: Categoria = { id: nextCategoriaId++, ...data };
    categorias.set(cat.id, cat);
    return cat;
  },
  updateCategoria(id: number, data: Omit<Categoria, "id">): Categoria | undefined {
    const existing = categorias.get(id);
    if (!existing) return undefined;
    const updated: Categoria = { ...existing, ...data, id };
    categorias.set(id, updated);
    // also update denormalized names on producto.categorias
    productos.forEach((p) => {
      if (p.categoriaIds?.includes(id)) {
        p.categorias = p.categoriaIds
          ?.map((cid) => categorias.get(cid))
          .filter(Boolean) as Categoria[];
      }
    });
    return updated;
  },
  deleteCategoria(id: number): boolean {
    const ok = categorias.delete(id);
    // remove references
    productos.forEach((p) => {
      if (p.categoriaIds) {
        p.categoriaIds = p.categoriaIds.filter((cid) => cid !== id);
        p.categorias = p.categoriaIds.map((cid) => categorias.get(cid)!).filter(Boolean);
      }
    });
    return ok;
  },

  // Productos
  listProductos(filter?: { categoriaId?: number; q?: string; page?: number; limit?: number }): Producto[] {
    let arr = Array.from(productos.values());
    if (filter?.categoriaId) {
      arr = arr.filter((p) => p.categoriaIds?.includes(filter.categoriaId!));
    }
    if (filter?.q) {
      const q = filter.q.toLowerCase();
      arr = arr.filter((p) => p.nombre.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q));
    }
    // simple pagination
    const page = Math.max(1, filter?.page || 1);
    const limit = Math.min(100, Math.max(1, filter?.limit || 20));
    const start = (page - 1) * limit;
    return arr.slice(start, start + limit);
  },
  getProducto(id: number): Producto | undefined {
    return productos.get(id);
  },
  createProducto(data: ProductoInput): { creado: Producto; resp: { id: number; mensaje: string } } {
    const id = nextProductId++;
    const prod: Producto & { categoriaIds?: number[] } = {
      id,
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: data.precio,
      stockDisponible: data.stockInicial,
      pesoKg: data.pesoKg,
      imagenes: data.imagenes,
      categoriaIds: data.categoriaIds,
      categorias: data.categoriaIds?.map((cid) => categorias.get(cid)!).filter(Boolean) || [],
    };
    productos.set(id, prod);
    return { creado: prod, resp: { id, mensaje: "Producto creado exitosamente." } };
  },
  updateProducto(id: number, data: ProductoUpdate): Producto | undefined {
    const existing = productos.get(id);
    if (!existing) return undefined;
    const merged: Producto & { categoriaIds?: number[] } = {
      ...existing,
      ...data,
    } as any;
    if (typeof data.stockInicial === "number") {
      merged.stockDisponible = data.stockInicial;
    }
    if (data.categoriaIds) {
      merged.categoriaIds = data.categoriaIds;
      merged.categorias = data.categoriaIds.map((cid) => categorias.get(cid)!).filter(Boolean);
    }
    productos.set(id, merged);
    return merged;
  },
  deleteProducto(id: number): boolean {
    return productos.delete(id);
  },

  // Reservas y stock
  reservar(input: ReservaInput): { ok: boolean; error?: string; reserva?: ReservaOutput } {
    // check products and stock
    for (const item of input.productos) {
      const p = productos.get(item.idProducto);
      if (!p) return { ok: false, error: `Producto ${item.idProducto} no existe` };
      if (item.cantidad < 1) return { ok: false, error: `Cantidad inválida para producto ${item.idProducto}` };
      if (p.stockDisponible < item.cantidad) return { ok: false, error: `Stock insuficiente para producto ${p.id}` };
    }
    // reserve: reduce stock
    input.productos.forEach((item) => {
      const p = productos.get(item.idProducto)!;
      p.stockDisponible -= item.cantidad;
      productos.set(p.id, p);
    });

    const idReserva = nextReservaId++;
    const ahora = new Date();
    const expiresAt = addMinutes(ahora, 30).toISOString();
    const header: ReservaRow = {
      idReserva,
      idCompra: input.idCompra,
      usuarioId: input.usuarioId,
      estado: "confirmado",
      expiresAt,
      fechaCreacion: ahora.toISOString(),
      items: input.productos.map((i) => ({ idProducto: i.idProducto, cantidad: i.cantidad })),
    };
    reservas.set(idReserva, header);

    const reservaOut: ReservaOutput = {
      idReserva,
      idCompra: input.idCompra,
      usuarioId: input.usuarioId,
      estado: header.estado,
      expiresAt,
      fechaCreacion: header.fechaCreacion,
    };
    return { ok: true, reserva: reservaOut };
  },

  liberar(input: LiberacionInput): { ok: boolean; error?: string; out?: LiberacionOutput } {
    const row = reservas.get(input.idReserva);
    if (!row) return { ok: false, error: "Reserva no encontrada" };
    if (row.usuarioId !== input.usuarioId) return { ok: false, error: "Usuario no autorizado para liberar esta reserva" };
    // restore stock
    row.items.forEach((i) => {
      const p = productos.get(i.idProducto);
      if (p) {
        p.stockDisponible += i.cantidad;
        productos.set(p.id, p);
      }
    });
    reservas.delete(input.idReserva);
    return { ok: true, out: { mensaje: "Stock liberado correctamente.", idReserva: input.idReserva, estado: "liberado" } };
  },

  listarReservas(usuarioId: number, page?: number, limit?: number, estado?: EstadoReserva): ReservaCompleta[] {
    let arr = Array.from(reservas.values()).filter((r) => r.usuarioId === usuarioId);
    if (estado) arr = arr.filter((r) => r.estado === estado);
    const p = Math.max(1, page || 1);
    const l = Math.min(100, Math.max(1, limit || 20));
    const start = (p - 1) * l;
    return arr.slice(start, start + l).map(toReservaCompleta);
  },

  getReserva(idReserva: number, usuarioId: number): ReservaCompleta | undefined {
    const r = reservas.get(idReserva);
    if (!r || r.usuarioId !== usuarioId) return undefined;
    return toReservaCompleta(r);
  },

  actualizarReserva(idReserva: number, input: ActualizarReservaInput): ReservaCompleta | undefined {
    const r = reservas.get(idReserva);
    if (!r) return undefined;
    if (r.usuarioId !== input.usuarioId) return undefined;
    r.estado = input.estado;
    r.fechaActualizacion = nowISO();
    reservas.set(idReserva, r);
    return toReservaCompleta(r);
  },
};

function toReservaCompleta(row: ReservaRow): ReservaCompleta {
  const productosDetalle = row.items.map((i) => {
    const p = productos.get(i.idProducto);
    return {
      idProducto: i.idProducto,
      nombre: p?.nombre || "Producto",
      cantidad: i.cantidad,
      precioUnitario: p?.precio ?? 0,
    };
  });
  return {
    idReserva: row.idReserva,
    idCompra: row.idCompra,
    usuarioId: row.usuarioId,
    estado: row.estado,
    expiresAt: row.expiresAt,
    fechaCreacion: row.fechaCreacion,
    fechaActualizacion: row.fechaActualizacion,
    productos: productosDetalle,
  };
}
