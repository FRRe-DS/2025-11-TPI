import { NextRequest, NextResponse } from "next/server";
import { productoDB } from "@/lib/database";
import { ProductoInput } from "@/lib/types";
import { badRequest, corsHeaders } from "../_utils";
import { requireAuth } from "@/lib/authMiddleware";

// OPTIONS /api/productos
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/productos
export async function GET(req: NextRequest) {
  console.log('[INFO] Solicitud recibida: GET /api/productos');
  const authResult = await requireAuth(req, { requiredScopes: ['productos:read'] });
  if (authResult.error) {
    console.log('[WARN] Autenticación fallida para GET /api/productos');
    return authResult.error;
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "20");
    const q = searchParams.get("q") || undefined;
    const categoriaId = searchParams.get("categoriaId") ? Number(searchParams.get("categoriaId")) : undefined;

    console.log(`[INFO] Consultando productos en la base de datos - Página: ${page}, Límite: ${limit}, Búsqueda: ${q || 'ninguna'}, CategoríaId: ${categoriaId || 'ninguna'}`);
    const result = await productoDB.list({ page, limit, q, categoriaId });
    console.log(`[INFO] Consulta a base de datos completada exitosamente - ${result.data.length} productos obtenidos`);
    
    // Build query params for pagination links
    const buildUrl = (pageNum: number) => {
      const params = new URLSearchParams();
      params.set("page", pageNum.toString());
      params.set("limit", limit.toString());
      if (q) params.set("q", q);
      if (categoriaId) params.set("categoriaId", categoriaId.toString());
      return `http://localhost:3000/api/productos?${params.toString()}`;
    };

    const response = {
      data: result.data,
      pagination: {
        ...result.pagination,
        previous: page > 1 ? buildUrl(page - 1) : null,
        next: page < result.pagination.totalPages ? buildUrl(page + 1) : null
      }
    };
    
    console.log(`[INFO] Retornando lista de productos - Total: ${result.pagination.total}, Página: ${page}/${result.pagination.totalPages}`);
    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error('[ERROR] Error al obtener productos:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    );
  }
}

// POST /api/productos
export async function POST(req: NextRequest) {
  console.log('[INFO] Solicitud recibida: POST /api/productos');
  const authResult = await requireAuth(req, { requiredScopes: ['productos:write'] });
  if (authResult.error) {
    console.log('[WARN] Autenticación fallida para POST /api/productos');
    return authResult.error;
  }

  try {
    const body = (await req.json().catch(() => null)) as ProductoInput | null;
    if (!body) {
      console.log('[WARN] Cuerpo de solicitud inválido - Se requiere JSON');
      return badRequest("Los datos proporcionados son inválidos.", "Cuerpo JSON requerido");
    }
    if (!body.nombre || typeof body.precio !== "number" || typeof body.stockInicial !== "number") {
      console.log('[WARN] Validación fallida - Faltan campos requeridos');
      return badRequest("Los datos proporcionados son inválidos.", "nombre, precio y stockInicial son requeridos");
    }
    
    if (Array.isArray(body.imagenes)) {
      const principals = body.imagenes.filter((i) => i?.esPrincipal === true).length;
      if (principals > 1) {
        console.log('[WARN] Validación fallida - Múltiples imágenes principales');
        return badRequest("Los datos proporcionados son inválidos.", "Solo una imagen puede ser la principal");
      }
    }

    console.log(`[INFO] Creando nuevo producto en la base de datos - Nombre: ${body.nombre}`);
    const result = await productoDB.create(body);
    console.log(`[INFO] Producto creado exitosamente - ID: ${result.resp.id}`);
    return NextResponse.json(result.resp, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('[ERROR] Error al crear producto:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    );
  }
}
