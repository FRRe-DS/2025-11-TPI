import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, message: "pong" });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ received: body });
}