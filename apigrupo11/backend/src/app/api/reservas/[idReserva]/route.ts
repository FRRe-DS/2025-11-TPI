import { NextRequest, NextResponse } from "next/server";
import { reservaDB } from "@/lib/database.prisma";
import { ActualizarReservaInput, CancelacionReservaInput, EstadoReserva } from "@/lib/types";
import { badRequest, notFound } from "@/app/api/_utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ idReserva: string }> }) {
  try {
    const { idReserva } = await params;
    const id = Number(idReserva);
    const r = await reservaDB.getById(id);
    if (!r) return notFound("Reserva no encontrada");
    return NextResponse.json(r);
  } catch (error) {
    console.error('[ERROR] Error al obtener reserva:', error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ idReserva: string }> }) {
  try {
    const { idReserva } = await params;
    const id = Number(idReserva);
    const body = (await req.json().catch(() => null)) as ActualizarReservaInput | null;
    if (!body) return badRequest("Los datos proporcionados son inválidos.");
    if (!body.estado) {
      return badRequest("Los datos proporcionados son inválidos.", "estado es requerido");
    }
    const r = await reservaDB.updateStatus(id, body.estado as EstadoReserva);
    if (!r) return notFound("Reserva no encontrada");
    return NextResponse.json(r);
  } catch (error) {
    console.error('[ERROR] Error al actualizar reserva:', error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ idReserva: string }> }) {
  try {
    const { idReserva } = await params;
    const id = Number(idReserva);
    const body = (await req.json().catch(() => null)) as CancelacionReservaInput | null;
    if (!body || !body.motivo) {
      return badRequest("Los datos proporcionados son inválidos.", "motivo es requerido");
    }
    
    const result = await reservaDB.updateStatus(id, 'cancelado' as EstadoReserva, body.motivo);
    
    if (!result) {
      return notFound("Reserva no encontrada");
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ERROR] Error al cancelar reserva:', error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
