import type { IProducto, IApiListResponse, IProductoInput, IProductoUpdate, ICategoria } from '../types/api.types';

function resolveBaseUrl() {
  // Prefer explicit env var `NEXT_PUBLIC_API_BASE_URL`, then `NEXT_PUBLIC_API_URL` for backwards compatibility.
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
}

export async function getProducts(token?: string, page = 1, limit = 20, q?: string, categoriaId?: number): Promise<IApiListResponse<IProducto>> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (q) params.set('q', q);
  if (categoriaId) params.set('categoriaId', String(categoriaId));

  const baseUrl = resolveBaseUrl();
  const url = `${baseUrl}/api/productos?${params.toString()}`;

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    // Log de diagnóstico para identificar base URL y query
    if (typeof window !== 'undefined') console.debug('[stock.service] GET', url);

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
    const parsed = data as IApiListResponse<any>;
    return {
      data: Array.isArray(parsed.data) ? parsed.data.map(mapBackendProductoToFrontend) : [],
      pagination: parsed.pagination,
    };
  } catch (error) {
    // Fallback a datos mock para desarrollo offline
    console.warn('Error fetching products from API, usando datos de ejemplo.', error);
    if (typeof window !== 'undefined') {
      console.warn('[stock.service] URL usada:', url);
      console.warn('⚠️ Backend no disponible. Mostrando datos de ejemplo. Para ver datos reales, inicia el backend en puerto 3000.');
    }
    // Datos mock de ejemplo para desarrollo sin backend
    const mock: IProducto[] = [
      {
        id: 1,
        nombre: 'Laptop HP',
        descripcion: 'Laptop HP 15.6" Intel Core i5',
        precio: 850.00,
        stockDisponible: 10,
        stockReservado: 2,
        stockTotal: 12,
        vendedorId: 1,
        categoriaId: 1,
        categoria: 'Electrónica',
        categorias: [{ id: 1, nombre: 'Electrónica', descripcion: null }],
        pesoKg: 2.5,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 2,
        nombre: 'Mouse Logitech',
        descripcion: 'Mouse inalámbrico Logitech MX Master',
        precio: 99.99,
        stockDisponible: 25,
        stockReservado: 0,
        stockTotal: 25,
        vendedorId: 1,
        categoriaId: 1,
        categoria: 'Electrónica',
        categorias: [{ id: 1, nombre: 'Electrónica', descripcion: null }],
        pesoKg: 0.2,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
      },
      {
        id: 3,
        nombre: 'Teclado Mecánico',
        descripcion: 'Teclado mecánico RGB retroiluminado',
        precio: 129.99,
        stockDisponible: 15,
        stockReservado: 3,
        stockTotal: 18,
        vendedorId: 1,
        categoriaId: 1,
        categoria: 'Electrónica',
        categorias: [{ id: 1, nombre: 'Electrónica', descripcion: null }],
        pesoKg: 1.0,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
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

export function mapBackendProductoToFrontend(p: any): IProducto {
  const categorias = Array.isArray(p?.categorias)
    ? p.categorias.filter(Boolean).map((c: any) => ({
        id: Number(c.id),
        nombre: String(c.nombre ?? ''),
        descripcion: c.descripcion ?? null,
      }))
    : [];
  const categoria = categorias.length > 0 ? categorias[0].nombre : '';
  const categoriaId = categorias.length > 0 ? categorias[0].id : 0;
  const dimensiones = p?.dimensiones
    ? {
        largo: Number(p.dimensiones.largoCm ?? 0),
        ancho: Number(p.dimensiones.anchoCm ?? 0),
        alto: Number(p.dimensiones.altoCm ?? 0),
      }
    : undefined;
  const ubicacion = p?.ubicacion
    ? {
        street: String(p.ubicacion.street ?? ''),
        city: p.ubicacion.city ?? undefined,
        state: p.ubicacion.state ?? undefined,
        postal_code: p.ubicacion.postal_code ?? undefined,
        country: p.ubicacion.country ?? undefined,
      }
    : undefined;
  const stockDisponible = Number(p.stockDisponible ?? p.stock_disponible ?? 0);
  const stockReservado = Number(p.stockReservado ?? p.stock_reservado ?? 0);
  return {
    id: Number(p.id),
    nombre: String(p.nombre ?? ''),
    descripcion: String(p.descripcion ?? ''),
    precio: Number(p.precio ?? 0),
    stockDisponible,
    stockReservado,
    stockTotal: stockDisponible + stockReservado,
    vendedorId: 0,
    categoriaId,
    categoria,
    categorias,
    pesoKg: Number(p.pesoKg ?? p.peso_kg ?? 0),
    fechaCreacion: p.fechaCreacion ?? p.created_at ?? new Date().toISOString(),
    fechaActualizacion: p.fechaActualizacion ?? p.updated_at ?? new Date().toISOString(),
    dimensiones,
    ubicacion,
  };
}

export async function createProduct(token: string, input: IProductoInput): Promise<IProducto> {
  const baseUrl = resolveBaseUrl();
  const url = `${baseUrl}/api/productos`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    // POST para crear
    if (typeof window !== 'undefined') console.debug('[stock.service] POST', url);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} al crear producto: ${text}`);
    }
    const createResp = await res.json(); // { id, mensaje }
    const newId = Number(createResp?.id ?? 0);
    // Intentamos obtener el producto completo; si falla, devolvemos una representación razonable
    if (newId > 0) {
      try {
        if (typeof window !== 'undefined') console.debug('[stock.service] GET recien creado', `${baseUrl}/api/productos/${newId}`);
        const getController = new AbortController();
        const getTimer = setTimeout(() => getController.abort(), 15000);
        const getRes = await fetch(`${baseUrl}/api/productos/${newId}`, { headers, method: 'GET', signal: getController.signal });
        clearTimeout(getTimer);
        if (!getRes.ok) {
          const text = await getRes.text();
          console.warn(`HTTP ${getRes.status} al leer producto creado: ${text}`);
          // Fall through to build a best-effort product below
        } else {
          const backendProducto = await getRes.json();
          return mapBackendProductoToFrontend(backendProducto);
        }
      } catch (errGet) {
        console.warn('Error leyendo producto recien creado, usando fallback parcial.', errGet);
      }
    }

    // Si llegamos aquí es porque no pudimos leer el producto completo desde la API.
    // Construimos un objeto IProducto mínimo usando lo que devolvió el POST (si hay datos)
    // o usando el `input` provisto.
    const fallbackProducto: any = {
      id: newId || undefined,
      nombre: (createResp && createResp.nombre) || input.nombre || 'Producto creado',
      descripcion: (createResp && createResp.descripcion) || input.descripcion || '',
      precio: typeof input.precio === 'number' ? input.precio : Number(input.precio ?? 0),
      stockDisponible: typeof input.stockInicial === 'number' ? input.stockInicial : Number(input.stockInicial ?? 0),
      stockReservado: 0,
      categorias: input.categoriaIds ? input.categoriaIds.map((id: any) => ({ id })) : [],
      pesoKg: input.pesoKg ?? 0,
      dimensiones: input.dimensiones ? { largoCm: input.dimensiones.largoCm, anchoCm: input.dimensiones.anchoCm, altoCm: input.dimensiones.altoCm } : undefined,
      ubicacion: input.ubicacion ?? undefined,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    };

    return mapBackendProductoToFrontend(fallbackProducto);
  } catch (err: any) {
    const isAbort = err?.name === 'AbortError';
    const tip = `URL: ${url}. Verifica que el backend esté corriendo y que NEXT_PUBLIC_API_BASE_URL apunte al puerto correcto.`;
    const msg = isAbort ? `Tiempo de espera agotado. ${tip}` : `${err?.message || 'Fallo de red'}. ${tip}`;
    throw new Error(msg);
  }
}

export async function updateProduct(token: string, id: number, input: IProductoUpdate): Promise<IProducto> {
  const baseUrl = resolveBaseUrl();
  const url = `${baseUrl}/api/productos/${id}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(input),
    signal: controller.signal,
  });
  clearTimeout(timer);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`No se pudo actualizar el producto (HTTP ${res.status}): ${text}`);
  }
  const backendProducto = await res.json();
  return mapBackendProductoToFrontend(backendProducto);
}

export async function deleteProduct(token: string, id: number): Promise<void> {
  const baseUrl = resolveBaseUrl();
  const url = `${baseUrl}/api/productos/${id}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  console.log('[stock.service] DELETE producto:', { id, url, hasToken: !!token });
  
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    if (typeof window !== 'undefined') console.debug('[stock.service] DELETE headers:', headers);
    const res = await fetch(url, {
      method: 'DELETE',
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);
    
    console.log('[stock.service] DELETE response:', { status: res.status, ok: res.ok });
    
    if (!res.ok && res.status !== 204) {
      const text = await res.text();
      console.error('[stock.service] DELETE error response:', text);
      throw new Error(`No se pudo eliminar el producto (HTTP ${res.status}): ${text}`);
    }
    console.log('[stock.service] DELETE exitoso');
    return;
  } catch (err: any) {
    const isAbort = err?.name === 'AbortError';
    const tip = `URL: ${url}. Verifica que el backend esté corriendo y que NEXT_PUBLIC_API_BASE_URL apunte al puerto correcto.`;
    const msg = isAbort ? `Tiempo de espera agotado. ${tip}` : `${err?.message || 'Fallo de red'}. ${tip}`;
    console.error('[stock.service] DELETE exception:', err);
    throw new Error(msg);
  }
}

export async function getProductById(token: string, id: number): Promise<IProducto> {
  const baseUrl = resolveBaseUrl();
  const url = `${baseUrl}/api/productos/${id}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  const res = await fetch(url, { method: 'GET', headers, signal: controller.signal });
  clearTimeout(timer);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`No se pudo obtener el producto (HTTP ${res.status}): ${text}`);
  }
  const backendProducto = await res.json();
  return mapBackendProductoToFrontend(backendProducto);
}

export async function listCategories(token?: string): Promise<ICategoria[]> {
  const baseUrl = resolveBaseUrl();
  const url = `${baseUrl}/api/categorias`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  const res = await fetch(url, { method: 'GET', headers, signal: controller.signal });
  clearTimeout(timer);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`No se pudieron cargar las categorías (HTTP ${res.status}): ${text}`);
  }

  const data = await res.json();
  return Array.isArray(data)
    ? data.map((c) => ({ id: Number(c.id), nombre: String(c.nombre ?? ''), descripcion: c.descripcion ?? null }))
    : [];
}
