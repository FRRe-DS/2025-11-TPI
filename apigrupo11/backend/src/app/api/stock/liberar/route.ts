import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LiberacionInput } from "@/lib/types";
import { badRequest, notFound } from "@/app/api/_utils";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as LiberacionInput | null;
  if (!body) return badRequest("Los datos proporcionados son inválidos.");
  if (typeof body.idReserva !== "number" || typeof body.usuarioId !== "number" || !body.motivo) {
    return badRequest("Los datos proporcionados son inválidos.", "idReserva, usuarioId y motivo son requeridos");
  }
  const res = db.liberar(body);
  if (!res.ok) return notFound("Reserva no encontrada", res.error);
  return NextResponse.json(res.out);
}
