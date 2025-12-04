import type { IReserva, IApiListResponse } from '../types/api.types';

function resolveBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
}

export async function listReservas(
  token?: string,
  usuarioId?: number,
  page = 1,
  limit = 50
): Promise<IApiListResponse<IReserva>> {
  const baseUrl = resolveBaseUrl();
  const url = `${baseUrl}/api/reservas`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(url, { headers });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const reservas: IReserva[] = await res.json();

    return {
      data: reservas,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: reservas.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  } catch (err: any) {
    // Network or other error: do not throw to avoid breaking the UI overlay.
    console.warn(`Failed fetching reservas from ${url}:`, err);
    console.warn('⚠️ Backend no disponible. Mostrando datos de ejemplo. Para ver datos reales, inicia el backend en puerto 3000.');
    
    // Datos mock de ejemplo para desarrollo sin backend
    const mockReservas: IReserva[] = [
      {
        id: 1,
        productoId: 1,
        productoNombre: 'Laptop HP',
        vendedorId: 1,
        usuarioId: 1,
        cantidad: 2,
        fechaReserva: new Date(Date.now() - 86400000).toISOString(), // hace 1 día
        fechaExpiracion: new Date(Date.now() + 86400000 * 6).toISOString(), // en 6 días
        estado: 'activa',
        idCompra: 'COMP-001',
      },
      {
        id: 2,
        productoId: 3,
        productoNombre: 'Teclado Mecánico',
        vendedorId: 1,
        usuarioId: 1,
        cantidad: 1,
        fechaReserva: new Date(Date.now() - 172800000).toISOString(), // hace 2 días
        fechaExpiracion: new Date(Date.now() - 86400000).toISOString(), // hace 1 día (expirada)
        estado: 'completada',
        idCompra: 'COMP-002',
      },
      {
        id: 3,
        productoId: 2,
        productoNombre: 'Mouse Logitech',
        vendedorId: 2,
        usuarioId: 2,
        cantidad: 3,
        fechaReserva: new Date(Date.now() - 3600000).toISOString(), // hace 1 hora
        fechaExpiracion: new Date(Date.now() + 86400000 * 7).toISOString(), // en 7 días
        estado: 'activa',
        idCompra: 'COMP-003',
      },
    ];
    
    return {
      data: mockReservas,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: mockReservas.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}
