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
  const authResult = await requireAuth(req, { requiredScopes: ['productos:read'] });
  if (authResult.error) return authResult.error;

  try {
    const searchParams = req.nextUrl.searchParams;
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "20");
    const q = searchParams.get("q") || undefined;
    const categoriaId = searchParams.get("categoriaId") ? Number(searchParams.get("categoriaId")) : undefined;

    const result = await productoDB.list({ page, limit, q, categoriaId });
    
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
    
    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching productos:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    );
  }
}

// POST /api/productos
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, { requiredScopes: ['productos:write'] });
  if (authResult.error) return authResult.error;

  try {
    const body = (await req.json().catch(() => null)) as ProductoInput | null;
    if (!body) return badRequest("Los datos proporcionados son inválidos.", "Cuerpo JSON requerido");
    if (!body.nombre || typeof body.precio !== "number" || typeof body.stockInicial !== "number") {
      return badRequest("Los datos proporcionados son inválidos.", "nombre, precio y stockInicial son requeridos");
    }
    
    if (Array.isArray(body.imagenes)) {
      const principals = body.imagenes.filter((i) => i?.esPrincipal === true).length;
      if (principals > 1) {
        return badRequest("Los datos proporcionados son inválidos.", "Solo una imagen puede ser la principal");
      }
    }

    const result = await productoDB.create(body);
    return NextResponse.json(result.resp, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Error creating producto:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    );
  }
}
