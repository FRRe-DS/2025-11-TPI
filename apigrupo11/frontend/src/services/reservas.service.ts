import type { IReserva, IApiListResponse } from '../types/api.types';

export async function listReservas(token?: string, page = 1, limit = 20): Promise<IApiListResponse<IReserva>> {
  const url = `http://localhost:3000/api/reservas?page=${page}&limit=${limit}`;

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();
    return data as IApiListResponse<IReserva>;
  } catch (error) {
    // Fallback: datos mock para desarrollo sin backend
    const mock: IReserva[] = [
      {
        id: 1,
        productoId: 101,
        productoNombre: 'Mouse Inalámbrico',
        vendedorId: 1,
        cantidad: 1,
        fechaReserva: '2025-11-15T10:35:00Z',
        fechaExpiracion: '2025-12-01T00:00:00Z',
        estado: 'activa',
        idCompra: 'C-1001',
        usuarioId: 42,
      },
      {
        id: 2,
        productoId: 202,
        productoNombre: 'Teclado Mecánico',
        vendedorId: 2,
        cantidad: 2,
        fechaReserva: '2025-11-12T14:10:00Z',
        fechaExpiracion: '2025-11-26T00:00:00Z',
        estado: 'completada',
        idCompra: 'C-1002',
        usuarioId: 7,
      },
    ];

    return {
      data: mock,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: mock.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}
