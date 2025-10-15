import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ReservaInput } from "@/lib/types";
import { badRequest } from "@/app/api/_utils";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as ReservaInput | null;
  if (!body) return badRequest("Los datos proporcionados son inválidos.");
  if (!body.idCompra || typeof body.usuarioId !== "number" || !Array.isArray(body.productos)) {
    return badRequest("Los datos proporcionados son inválidos.", "idCompra, usuarioId y productos son requeridos");
  }

  const res = db.reservar(body);
  if (!res.ok) return badRequest("Stock insuficiente o datos inválidos", res.error);
  return NextResponse.json(res.reserva);
}
