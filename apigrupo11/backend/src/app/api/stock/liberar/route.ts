import { NextResponse } from "next/server";
import { reservaDB, productoDB } from "@/lib/database.prisma";
import { LiberacionInput, EstadoReserva } from "@/lib/types";
import { badRequest, notFound } from "@/app/api/_utils";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as LiberacionInput | null;
    if (!body) return badRequest("Los datos proporcionados son inválidos.");
    if (typeof body.idReserva !== "number" || typeof body.usuarioId !== "number" || !body.motivo) {
      return badRequest("Los datos proporcionados son inválidos.", "idReserva, usuarioId y motivo son requeridos");
    }

    // Obtener la reserva
    const reserva = await reservaDB.getById(body.idReserva);
    if (!reserva) return notFound("Reserva no encontrada");

    // Verificar que sea del usuario correcto
    if (reserva.usuarioId !== body.usuarioId) {
      return badRequest("No autorizado", "Esta reserva no pertenece al usuario");
    }

    // Devolver el stock
    for (const producto of reserva.productos) {
      await productoDB.updateStock(producto.idProducto, producto.cantidad);
    }

    // Cancelar la reserva
    const updated = await reservaDB.updateStatus(body.idReserva, 'cancelado' as EstadoReserva, body.motivo);
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('[ERROR] Error al liberar stock:', error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
