import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest, notFound } from "@/app/api/_utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ categoriaId: string }> }) {
  const { categoriaId } = await params;
  const id = Number(categoriaId);
  const cat = db.getCategoria(id);
  if (!cat) return notFound("Categoría no encontrada");
  return NextResponse.json(cat);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ categoriaId: string }> }) {
  const { categoriaId } = await params;
  const id = Number(categoriaId);
  const body = (await req.json().catch(() => null)) as { nombre?: string; descripcion?: string | null } | null;
  if (!body) return badRequest("Los datos proporcionados son inválidos.");
  const nombre = body.nombre?.trim();
  if (nombre !== undefined && !nombre) return badRequest("Los datos proporcionados son inválidos.", "nombre no puede ser vacío");
  const current = db.getCategoria(id);
  const updated = db.updateCategoria(id, { nombre: nombre ?? (current?.nombre || ""), descripcion: body.descripcion ?? null });
  if (!updated) return notFound("Categoría no encontrada");
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ categoriaId: string }> }) {
  const { categoriaId } = await params;
  const id = Number(categoriaId);
  const ok = db.deleteCategoria(id);
  if (!ok) return notFound("Categoría no encontrada");
  return new NextResponse(null, { status: 204 });
}
