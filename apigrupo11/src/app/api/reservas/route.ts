import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { badRequest } from "@/app/api/_utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const usuarioId = Number(searchParams.get("usuarioId"));
  if (!usuarioId) return badRequest("Los datos proporcionados son inválidos.", "usuarioId es requerido");
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const estado = (searchParams.get("estado") as any) || undefined;
  const list = db.listarReservas(usuarioId, page, limit, estado);
  return NextResponse.json(list);
}
