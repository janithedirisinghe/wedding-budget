import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  // TODO: implement registration logic
  return NextResponse.json({ message: "Registered", body }, { status: 201 });
}
