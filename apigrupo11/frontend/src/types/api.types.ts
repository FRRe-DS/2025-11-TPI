// src/types/api.types.ts

// ESTRUCTURAS DE DATOS PRINCIPALES

/**
 * Define la estructura de una imagen asociada a un producto.
 */
export interface IImagen {
  url: string;
  esPrincipal: boolean;
}

/**
 * Define las dimensiones de un producto.
 */
export interface IDimensiones {
  largo: number; // en cm
  ancho: number; // en cm
  alto: number; // en cm
}

/**
 * Define la ubicación de un producto en el almacén.
 */
export interface IUbicacion {
  almacen: string;
  pasillo?: string;
  estante?: string;
  nivel?: string;
}

/**
 * Define la estructura completa de un Producto, tal como lo devuelve la API.
 * Combina información del producto y del stock.
 */
export interface IProducto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stockDisponible: number;
  stockReservado: number;
  stockTotal: number;
  vendedorId: number;
  categoriaId: number;
  categoria: string;
  pesoKg: number;
  fechaCreacion: string; // Formato ISO 8601
  fechaActualizacion: string; // Formato ISO 8601
  imagenes: IImagen[];
  dimensiones?: IDimensiones; // Added dimensions
  ubicacion?: IUbicacion; // Added location
}

/**
 * Define los posibles estados de una reserva.
 * Usar un 'union type' nos da autocompletado y previene errores.
 */
export type TEstadoReserva = 'activa' | 'completada' | 'expirada' | 'cancelada';

/**
 * Define la estructura de una Reserva.
 */
export interface IReserva {
  id: number;
  productoId: number;
  productoNombre: string;
  vendedorId: number;
  cantidad: number;
  fechaReserva: string; // Formato ISO 8601
  fechaExpiracion: string; // Formato ISO 8601
  estado: TEstadoReserva;
  idCompra: string;
  usuarioId: number;
}

/**
 * Define la estructura de un Vendedor.
 * El teléfono es opcional porque no aparece en todos los endpoints.
 */
export interface IVendedor {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
}

// ESTRUCTURAS DE RESPUESTAS DE LA API

/**
 * Define la estructura del objeto de paginación que la API devuelve
 * en los listados.
 */
export interface IPaginacion {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Define una respuesta genérica para los endpoints que devuelven una lista paginada.
 * Usamos un genérico `<T>` para que pueda contener cualquier tipo de dato (productos, reservas, etc.).
 */
export interface IApiListResponse<T> {
  data: T[];
  pagination: IPaginacion;
}
