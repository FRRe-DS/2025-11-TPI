import type { IProducto, IApiListResponse } from '../types/api.types';

export async function getProducts(token?: string, page = 1, limit = 20, q?: string, categoriaId?: number): Promise<IApiListResponse<IProducto>> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (q) params.set('q', q);
  if (categoriaId) params.set('categoriaId', String(categoriaId));

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/productos?${params.toString()}`;

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    // Log de diagnóstico para identificar base URL y query
    if (typeof window !== 'undefined') {
      console.debug('[stock.service] GET', url);
    }

    // Control de timeout para evitar esperas indefinidas y clarificar fallos de red
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, { headers, method: 'GET', signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();
    return data as IApiListResponse<IProducto>;
  } catch (error) {
    // Fallback a datos mock para desarrollo offline
    console.error('Error fetching products from API, falling back to empty mock.', error);
    // Si es un fallo de red (TypeError/AbortError), añadir mensaje aclaratorio
    if (typeof window !== 'undefined') {
      console.error('[stock.service] URL usada:', url);
      console.error('Sugerencia: verifica que el backend esté corriendo y que NEXT_PUBLIC_API_BASE_URL apunte al puerto correcto.');
    }
    const mock: IProducto[] = [];
    return {
      data: mock,
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
