import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ProductoUpdate } from "@/lib/types";
import { badRequest, notFound } from "@/app/api/_utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ productoId: string }> }) {
  const { productoId } = await params;
  const id = Number(productoId);
  const p = db.getProducto(id);
  if (!p) return notFound("Producto no encontrado");
  return NextResponse.json(p);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ productoId: string }> }) {
  const { productoId } = await params;
  const id = Number(productoId);
  const body = (await req.json().catch(() => null)) as ProductoUpdate | null;
  if (!body) return badRequest("Los datos proporcionados son inválidos.");
  if (Array.isArray(body.imagenes)) {
    const principals = body.imagenes.filter((i) => i?.esPrincipal === true).length;
    if (principals > 1) {
      return badRequest("Los datos proporcionados son inválidos.", "Solo una imagen puede ser la principal");
    }
  }
  const updated = db.updateProducto(id, body);
  if (!updated) return notFound("Producto no encontrado");
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ productoId: string }> }) {
  const { productoId } = await params;
  const id = Number(productoId);
  const ok = db.deleteProducto(id);
  if (!ok) return notFound("Producto no encontrado");
  return new NextResponse(null, { status: 204 });
}
