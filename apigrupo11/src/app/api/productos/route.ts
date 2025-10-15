import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ProductoInput } from "@/lib/types";
import { badRequest } from "../_utils";

// GET /api/productos
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const q = searchParams.get("q") || undefined;
  const categoriaId = searchParams.get("categoriaId") ? Number(searchParams.get("categoriaId")) : undefined;

  const list = db.listProductos({ page, limit, q, categoriaId });
  return NextResponse.json(list);
}

// POST /api/productos
export async function POST(req: Request) {
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
  const { resp } = db.createProducto(body);
  return NextResponse.json(resp, { status: 201 });
}
