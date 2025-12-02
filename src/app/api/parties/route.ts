import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  const parties = await prisma.party.findMany();
  return NextResponse.json(parties);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name } = body;
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const party = await prisma.party.create({ data: { name } });
  return NextResponse.json(party);
}

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const body = await request.json();
  const { name } = body;
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const updated = await prisma.party.update({ where: { id }, data: { name } });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // delete related transactions then party
  await prisma.transaction.deleteMany({ where: { partyId: id } });
  await prisma.party.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
