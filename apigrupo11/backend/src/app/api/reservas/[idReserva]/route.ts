import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ActualizarReservaInput, CancelacionReservaInput } from "@/lib/types";
import { badRequest, notFound } from "@/app/api/_utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ idReserva: string }> }) {
  const { idReserva } = await params;
  const { searchParams } = new URL(req.url);
  const usuarioId = Number(searchParams.get("usuarioId"));
  if (!usuarioId) return badRequest("Los datos proporcionados son inválidos.", "usuarioId es requerido");
  const id = Number(idReserva);
  const r = db.getReserva(id, usuarioId);
  if (!r) return notFound("Reserva no encontrada");
  return NextResponse.json(r);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ idReserva: string }> }) {
  const { idReserva } = await params;
  const id = Number(idReserva);
  const body = (await req.json().catch(() => null)) as ActualizarReservaInput | null;
  if (!body) return badRequest("Los datos proporcionados son inválidos.");
  if (typeof body.usuarioId !== "number" || !body.estado) {
    return badRequest("Los datos proporcionados son inválidos.", "usuarioId y estado son requeridos");
  }
  const r = db.actualizarReserva(id, body);
  if (!r) return notFound("Reserva no encontrada");
  return NextResponse.json(r);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ idReserva: string }> }) {
  const { idReserva } = await params;
  const id = Number(idReserva);
  const body = (await req.json().catch(() => null)) as CancelacionReservaInput | null;
  if (!body || !body.motivo) {
    return badRequest("Los datos proporcionados son inválidos.", "motivo es requerido");
  }
  
  const result = db.cancelarReserva(id, body.motivo);
  
  if (!result.ok) {
    return notFound(result.error || "Reserva no encontrada");
  }
  
  return new NextResponse(null, { status: 204 });
}
