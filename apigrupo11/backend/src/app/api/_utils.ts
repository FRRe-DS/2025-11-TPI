import { NextResponse } from "next/server";
import { ErrorResponse } from "@/lib/types";

export function badRequest(message: string, details?: string) {
  const body: ErrorResponse = { code: "INVALID_DATA", message, details };
  return NextResponse.json(body, { status: 400 });
}

export function notFound(message: string, details?: string) {
  const body: ErrorResponse = { code: "NOT_FOUND", message, details };
  return NextResponse.json(body, { status: 404 });
}

export function conflict(message: string, details?: string) {
  const body: ErrorResponse = { code: "CONFLICT", message, details };
  return NextResponse.json(body, { status: 409 });
}
