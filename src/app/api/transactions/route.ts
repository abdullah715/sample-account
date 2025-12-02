import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  const transactions = await prisma.transaction.findMany();
  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { partyId, date, amount, kind, description } = body;
  if (!partyId || !date || amount == null || !kind) return NextResponse.json({ error: "missing fields" }, { status: 400 });
  const tx = await prisma.transaction.create({ data: { partyId, date, amount: Number(amount), kind, description } });
  return NextResponse.json(tx);
}

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const body = await request.json();
  const updated = await prisma.transaction.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
