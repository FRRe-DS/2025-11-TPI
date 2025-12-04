// Basic TypeScript types matching the OpenAPI schemas (output shapes)

export type EstadoReserva = "confirmado" | "pendiente" | "cancelado";

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

export interface Dimensiones {
  largoCm?: number;
  anchoCm?: number;
  altoCm?: number;
}

export interface UbicacionAlmacen {
  street: string;
  city: string;
  state: string;
  postal_code: string; // formato CPA: ej. "H3500ABC"
  country: string; // código ISO 3166-1 alfa-2, ej. "AR"
}

export interface ImagenProducto {
  url: string;
  esPrincipal?: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number; // float
  stockDisponible: number;
  stockReservado?: number;
  pesoKg?: number; // float
  dimensiones?: Dimensiones;
  ubicacion?: UbicacionAlmacen;
  imagenes?: ImagenProducto[];
  categorias?: Categoria[] | null;
}

export interface ProductoInput {
  nombre: string;
  descripcion?: string;
  precio: number;
  stockInicial: number;
  pesoKg?: number;
  dimensiones?: Dimensiones;
  ubicacion?: UbicacionAlmacen;
  imagenes?: ImagenProducto[];
  categoriaIds?: number[]; // for input only
}

export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stockInicial?: number; // interpreted as new stockDisponible
  pesoKg?: number;
  dimensiones?: Dimensiones;
  ubicacion?: UbicacionAlmacen;
  imagenes?: ImagenProducto[];
  categoriaIds?: number[];
}

export interface ProductoCreado {
  id: number;
  mensaje: string;
}

export interface ReservaInputItem {
  idProducto: number;
  cantidad: number; // >= 1
}

export interface ReservaInput {
  idCompra: string;
  usuarioId: number;
  productos: ReservaInputItem[];
}

export interface ReservaOutput {
  idReserva: number;
  idCompra: string;
  usuarioId: number;
  estado: EstadoReserva;
  expiresAt: string; // date-time
  fechaCreacion: string; // date-time
}

export interface ReservaProductoDetalle {
  idProducto: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface ReservaCompleta {
  idReserva: number;
  idCompra: string;
  usuarioId: number;
  estado: EstadoReserva;
  expiresAt: string; // date-time
  fechaCreacion: string; // date-time
  fechaActualizacion?: string; // date-time
  productos: ReservaProductoDetalle[];
}

export interface ActualizarReservaInput {
  usuarioId: number;
  estado: EstadoReserva;
}

export interface CancelacionReservaInput {
  motivo: string;
}

export interface LiberacionInput {
  idReserva: number;
  usuarioId: number;
  motivo: string;
}

export interface LiberacionOutput {
  mensaje: string;
  idReserva: number;
  estado: "liberado";
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: string | null;
}
