import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LiberacionInput } from "@/lib/types";
import { badRequest, notFound } from "@/app/api/_utils";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

// OPTIONS
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// POST /api/stock/liberar
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as LiberacionInput | null;

  if (!body) return badRequest("Los datos proporcionados son inválidos.");

  if (typeof body.idReserva !== "number" || typeof body.usuarioId !== "number" || !body.motivo) {
    return badRequest(
      "Los datos proporcionados son inválidos.",
      "idReserva, usuarioId y motivo son requeridos"
    );
  }

  const res = db.liberar(body);

  if (!res.ok) return notFound("Reserva no encontrada", res.error);

  return NextResponse.json(res.out, {
    status: 200,
    headers: CORS_HEADERS,
  });
}
