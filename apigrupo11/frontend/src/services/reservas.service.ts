import type { IReserva, IApiListResponse } from '../types/api.types';

export async function listReservas(
  token?: string,
  usuarioId?: number,
  page = 1,
  limit = 50
): Promise<IApiListResponse<IReserva>> {

  const url = `http://localhost:3000/api/reservas?usuarioId=${usuarioId}&page=${page}&limit=${limit}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

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
}
