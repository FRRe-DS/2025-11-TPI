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
    return {
      data: [],
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}
