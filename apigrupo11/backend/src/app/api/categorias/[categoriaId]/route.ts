import { NextRequest, NextResponse } from "next/server";
import { categoriaDB } from "@/lib/database.prisma";
import { badRequest, notFound } from "@/app/api/_utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ categoriaId: string }> }) {
  try {
    const { categoriaId } = await params;
    const id = Number(categoriaId);
    const cat = await categoriaDB.getById(id);
    if (!cat) return notFound("Categoría no encontrada");
    return NextResponse.json(cat);
  } catch (error) {
    console.error('[ERROR] Error al obtener categoría:', error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ categoriaId: string }> }) {
  try {
    const { categoriaId } = await params;
    const id = Number(categoriaId);
    const body = (await req.json().catch(() => null)) as { nombre?: string; descripcion?: string | null } | null;
    if (!body) return badRequest("Los datos proporcionados son inválidos.");
    const nombre = body.nombre?.trim();
    if (nombre !== undefined && !nombre) return badRequest("Los datos proporcionados son inválidos.", "nombre no puede ser vacío");
    
    const updated = await categoriaDB.update(id, { 
      ...(nombre && { nombre }), 
      ...(body.descripcion !== undefined && { descripcion: body.descripcion || undefined }) 
    });
    if (!updated) return notFound("Categoría no encontrada");
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[ERROR] Error al actualizar categoría:', error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ categoriaId: string }> }) {
  try {
    const { categoriaId } = await params;
    const id = Number(categoriaId);
    const ok = await categoriaDB.delete(id);
    if (!ok) return notFound("Categoría no encontrada");
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ERROR] Error al eliminar categoría:', error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
