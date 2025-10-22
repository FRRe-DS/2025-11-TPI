// API Client para comunicarse con el backend Next.js
// Las llamadas a /api/* son proxy-adas automáticamente por Vite al backend en localhost:3000

const API_BASE = '/api';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function fetcher<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  const { params, ...fetchOptions } = options || {};
  
  let url = `${API_BASE}${endpoint}`;
  
  // Agregar query params si existen
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: 'Error en la solicitud' 
    }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Para respuestas 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// ==================== PRODUCTOS ====================

export interface Dimensiones {
  largoCm?: number;
  anchoCm?: number;
  altoCm?: number;
}

export interface UbicacionAlmacen {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stockDisponible: number;
  pesoKg?: number;
  dimensiones?: Dimensiones;
  ubicacion?: UbicacionAlmacen;
  imagenes?: Array<{ url: string; esPrincipal: boolean }>;
  categorias?: Array<{ id: number; nombre: string; descripcion?: string }>;
}

export interface ProductoInput {
  nombre: string;
  descripcion?: string;
  precio: number;
  stockInicial: number;
  pesoKg?: number;
  dimensiones?: Dimensiones;
  ubicacion?: UbicacionAlmacen;
  imagenes?: Array<{ url: string; esPrincipal: boolean }>;
  categoriaIds?: number[];
}

export const productosApi = {
  listar: (params?: { page?: number; limit?: number; q?: string; categoriaId?: number }) =>
    fetcher<Producto[]>('/productos', { params }),
  
  obtener: (id: number) =>
    fetcher<Producto>(`/productos/${id}`),
  
  crear: (data: ProductoInput) =>
    fetcher<{ id: number; mensaje: string }>('/productos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  actualizar: (id: number, data: Partial<ProductoInput>) =>
    fetcher<Producto>(`/productos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  eliminar: (id: number) =>
    fetcher<null>(`/productos/${id}`, { method: 'DELETE' }),
};

// ==================== CATEGORÍAS ====================

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

export interface CategoriaInput {
  nombre: string;
  descripcion?: string | null;
}

export const categoriasApi = {
  listar: () =>
    fetcher<Categoria[]>('/categorias'),
  
  obtener: (id: number) =>
    fetcher<Categoria>(`/categorias/${id}`),
  
  crear: (data: CategoriaInput) =>
    fetcher<Categoria>('/categorias', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  actualizar: (id: number, data: CategoriaInput) =>
    fetcher<Categoria>(`/categorias/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  eliminar: (id: number) =>
    fetcher<null>(`/categorias/${id}`, { method: 'DELETE' }),
};

// ==================== RESERVAS ====================

export type EstadoReserva = 'confirmado' | 'pendiente' | 'cancelado';

export interface ReservaInput {
  idCompra: string;
  usuarioId: number;
  productos: Array<{ idProducto: number; cantidad: number }>;
}

export interface ReservaOutput {
  idReserva: number;
  idCompra: string;
  usuarioId: number;
  estado: EstadoReserva;
  expiresAt: string;
  fechaCreacion: string;
}

export interface ReservaCompleta extends ReservaOutput {
  fechaActualizacion?: string;
  productos: Array<{
    idProducto: number;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
  }>;
}

export const reservasApi = {
  listar: (params: { usuarioId: number; page?: number; limit?: number; estado?: EstadoReserva }) =>
    fetcher<ReservaCompleta[]>('/reservas', { params }),
  
  obtener: (idReserva: number, usuarioId: number) =>
    fetcher<ReservaCompleta>(`/reservas/${idReserva}`, { params: { usuarioId } }),
  
  crear: (data: ReservaInput) =>
    fetcher<ReservaOutput>('/reservas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  actualizar: (idReserva: number, data: { usuarioId: number; estado: EstadoReserva }) =>
    fetcher<ReservaCompleta>(`/reservas/${idReserva}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  cancelar: (idReserva: number, motivo: string) =>
    fetcher<null>(`/reservas/${idReserva}`, {
      method: 'DELETE',
      body: JSON.stringify({ motivo }),
    }),
};

// ==================== STOCK ====================

export const stockApi = {
  reservar: (data: ReservaInput) =>
    fetcher<ReservaOutput>('/stock/reservar', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  liberar: (data: { idReserva: number; usuarioId: number; motivo: string }) =>
    fetcher<{ mensaje: string; idReserva: number; estado: 'liberado' }>('/stock/liberar', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
