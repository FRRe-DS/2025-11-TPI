import { NextRequest, NextResponse } from "next/server";
import { productoDB } from "@/lib/database.prisma";
import { ProductoUpdate } from "@/lib/types";
import { badRequest, notFound, corsHeaders } from "@/app/api/_utils";
import { requireAuth } from "@/lib/authMiddleware";

export async function GET(req: NextRequest, { params }: { params: Promise<{ productoId: string }> }) {
  console.log('[INFO] Solicitud recibida: GET /api/productos/[productoId]');
  const authResult = await requireAuth(req, { requiredScopes: ['productos:read'] });
  if (authResult.error) {
    console.log('[WARN] Autenticación fallida para GET /api/productos/[productoId]');
    return authResult.error;
  }

  try {
    const { productoId } = await params;
    const id = Number(productoId);
    console.log(`[INFO] Consultando producto en la base de datos - ID: ${id}`);
    const p = await productoDB.getById(id);
    if (!p) {
      console.log(`[WARN] Producto no encontrado - ID: ${id}`);
      return notFound("Producto no encontrado");
    }
    console.log(`[INFO] Producto encontrado - ID: ${id}, Nombre: ${p.nombre}`);
    console.log('[INFO] Retornando datos del producto');
    return NextResponse.json(p);
  } catch (error) {
    console.error('[ERROR] Error al obtener producto:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ productoId: string }> }) {
  console.log('[INFO] Solicitud recibida: PATCH /api/productos/[productoId]');
  const authResult = await requireAuth(req, { requiredScopes: ['productos:write'] });
  if (authResult.error) {
    console.log('[WARN] Autenticación fallida para PATCH /api/productos/[productoId]');
    return authResult.error;
  }

  try {
    const { productoId } = await params;
    const id = Number(productoId);
    const body = (await req.json().catch(() => null)) as ProductoUpdate | null;
    if (!body) {
      console.log('[WARN] Cuerpo de solicitud inválido - Se requiere JSON');
      return badRequest("Los datos proporcionados son inválidos.");
    }
    
    console.log(`[INFO] Actualizando producto en la base de datos - ID: ${id}`);
    const updated = await productoDB.update(id, body);
    if (!updated) {
      console.log(`[WARN] Producto no encontrado para actualizar - ID: ${id}`);
      return notFound("Producto no encontrado");
    }
    console.log(`[INFO] Producto actualizado exitosamente - ID: ${id}`);
    console.log('[INFO] Retornando producto actualizado');
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[ERROR] Error al actualizar producto:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ productoId: string }> }) {
  console.log('[INFO] Solicitud recibida: DELETE /api/productos/[productoId]');
  const authResult = await requireAuth(req, { requiredScopes: ['productos:write'] });
  if (authResult.error) {
    console.log('[WARN] Autenticación fallida para DELETE /api/productos/[productoId]');
    return authResult.error;
  }

  try {
    const { productoId } = await params;
    const id = Number(productoId);
    console.log(`[INFO] Eliminando producto de la base de datos - ID: ${id}`);
    const ok = await productoDB.delete(id);
    if (!ok) {
      console.log(`[WARN] Producto no encontrado para eliminar - ID: ${id}`);
      return notFound("Producto no encontrado");
    }
    console.log(`[INFO] Producto eliminado exitosamente - ID: ${id}`);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ERROR] Error al eliminar producto:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    );
  }
}
