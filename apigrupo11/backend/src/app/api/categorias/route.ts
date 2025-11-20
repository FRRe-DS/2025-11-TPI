import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, corsHeaders } from "@/app/api/_utils";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/categorias -> lista de categorías
export async function GET() {
  const list = db.listCategorias();
  return NextResponse.json(list, { headers: corsHeaders });
}

// POST /api/categorias -> crear categoría
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { nombre?: string; descripcion?: string | null } | null;
  if (!body) return badRequest("Los datos proporcionados son inválidos.", "Cuerpo JSON requerido");
  const nombre = (body.nombre || "").trim();
  if (!nombre) return badRequest("Los datos proporcionados son inválidos.", "nombre es requerido");
  if (nombre.length > 100) return badRequest("Los datos proporcionados son inválidos.", "nombre debe tener hasta 100 caracteres");

  const created = db.createCategoria({ nombre, descripcion: body.descripcion ?? null });
  return NextResponse.json(created, { status: 201, headers: corsHeaders });
}
