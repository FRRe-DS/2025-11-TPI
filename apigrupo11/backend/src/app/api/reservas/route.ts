import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ReservaInput } from "@/lib/types";
import { badRequest, corsHeaders } from "@/app/api/_utils";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const usuarioId = Number(searchParams.get("usuarioId"));
  if (!usuarioId) return badRequest("Los datos proporcionados son inválidos.", "usuarioId es requerido");
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const estado = (searchParams.get("estado") as any) || undefined;
  const list = db.listarReservas(usuarioId, page, limit, estado);
  return NextResponse.json(list, { headers: corsHeaders });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as ReservaInput | null;
  if (!body || !body.idCompra || !body.usuarioId || !body.productos || !Array.isArray(body.productos)) {
    return badRequest("Los datos proporcionados son inválidos.", "idCompra, usuarioId y productos son requeridos");
  }
  
  const result = db.reservar(body);
  
  if (!result.ok) {
    if (result.error?.includes("Stock insuficiente")) {
      return NextResponse.json(
        { code: "INSUFFICIENT_STOCK", message: result.error },
        { status: 400, headers: corsHeaders }
      );
    }
    return NextResponse.json(
      { code: "INVALID_DATA", message: result.error || "Error al crear la reserva" },
      { status: 400, headers: corsHeaders }
    );
  }
  
  return NextResponse.json(result.reserva, { status: 201, headers: corsHeaders });
}
