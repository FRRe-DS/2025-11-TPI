import { NextRequest, NextResponse } from "next/server";
<<<<<<< HEAD
import { query } from "@/lib/database";
=======
import { categoriaDB } from "@/lib/database.prisma";
>>>>>>> main
import { badRequest, corsHeaders } from "@/app/api/_utils";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/categorias -> lista de categorías
export async function GET() {
  try {
<<<<<<< HEAD
    const rows = await query(`SELECT id, nombre, descripcion FROM categorias ORDER BY id`);
    return NextResponse.json(rows, { headers: corsHeaders });
  } catch (err) {
    console.error('Error leyendo categorías desde la BD:', err);
    return NextResponse.json([], { headers: corsHeaders });
=======
    const list = await categoriaDB.list();
    return NextResponse.json(list, { headers: corsHeaders });
  } catch (error) {
    console.error('[ERROR] Error al obtener categorías:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    );
>>>>>>> main
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

<<<<<<< HEAD
  try {
    const rows = await query(`INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING id, nombre, descripcion`, [nombre, body.descripcion ?? null]);
    return NextResponse.json(rows[0], { status: 201, headers: corsHeaders });
  } catch (err) {
    console.error('Error creando categoría en la BD:', err);
    return NextResponse.json({ error: 'Error interno al crear categoría' }, { status: 500, headers: corsHeaders });
=======
    const created = await categoriaDB.create({ nombre, descripcion: body.descripcion || undefined });
    return NextResponse.json(created, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('[ERROR] Error al crear categoría:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    );
>>>>>>> main
  }
}
