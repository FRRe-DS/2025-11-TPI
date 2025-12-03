import { NextRequest, NextResponse } from "next/server";
import { categoriaDB } from "@/lib/database.prisma";
import { badRequest, corsHeaders } from "@/app/api/_utils";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/categorias -> lista de categorías
export async function GET() {
  try {
    const list = await categoriaDB.list();
    return NextResponse.json(list, { headers: corsHeaders });
  } catch (error) {
    console.error('[ERROR] Error al obtener categorías:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    );
  }
}

// POST /api/categorias -> crear categoría
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as { nombre?: string; descripcion?: string | null } | null;
    if (!body) return badRequest("Los datos proporcionados son inválidos.", "Cuerpo JSON requerido");
    const nombre = (body.nombre || "").trim();
    if (!nombre) return badRequest("Los datos proporcionados son inválidos.", "nombre es requerido");
    if (nombre.length > 100) return badRequest("Los datos proporcionados son inválidos.", "nombre debe tener hasta 100 caracteres");

    const created = await categoriaDB.create({ nombre, descripcion: body.descripcion || undefined });
    return NextResponse.json(created, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('[ERROR] Error al crear categoría:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    );
  }
}
