import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ReservaInput } from "@/lib/types";
import { badRequest } from "@/app/api/_utils";

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

// POST /api/stock/reservar
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as ReservaInput | null;

  if (!body) return badRequest("Los datos proporcionados son inválidos.");
  if (!body.idCompra || typeof body.usuarioId !== "number" || !Array.isArray(body.productos)) {
    return badRequest(
      "Los datos proporcionados son inválidos.",
      "idCompra, usuarioId y productos son requeridos"
    );
  }

  const res = db.reservar(body);
  if (!res.ok) return badRequest("Stock insuficiente o datos inválidos", res.error);

  return NextResponse.json(res.reserva, {
    status: 200,
    headers: CORS_HEADERS,
  });
}
