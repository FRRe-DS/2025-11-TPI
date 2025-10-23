import { NextRequest, NextResponse } from "next/server";
import { productoDB } from "@/lib/database";
import { ProductoUpdate } from "@/lib/types";
import { badRequest, notFound } from "@/app/api/_utils";
import { requireAuth } from "@/lib/authMiddleware";

export async function GET(req: NextRequest, { params }: { params: Promise<{ productoId: string }> }) {
  const authResult = await requireAuth(req, { requiredScopes: ['productos:read'] });
  if (authResult.error) return authResult.error;

  try {
    const { productoId } = await params;
    const id = Number(productoId);
    const p = await productoDB.getById(id);
    if (!p) return notFound("Producto no encontrado");
    return NextResponse.json(p);
  } catch (error) {
    console.error('Error fetching producto:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ productoId: string }> }) {
  const authResult = await requireAuth(req, { requiredScopes: ['productos:write'] });
  if (authResult.error) return authResult.error;

  try {
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
    
    const updated = await productoDB.update(id, body);
    if (!updated) return notFound("Producto no encontrado");
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating producto:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ productoId: string }> }) {
  const authResult = await requireAuth(req, { requiredScopes: ['productos:write'] });
  if (authResult.error) return authResult.error;

  try {
    const { productoId } = await params;
    const id = Number(productoId);
    const ok = await productoDB.delete(id);
    if (!ok) return notFound("Producto no encontrado");
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting producto:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    );
  }
}
