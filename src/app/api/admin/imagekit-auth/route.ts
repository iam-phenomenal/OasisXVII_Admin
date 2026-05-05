import { NextResponse } from "next/server";

import { getAdminToken } from "@/lib/auth";

export async function GET() {
  const token = await getAdminToken();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${process.env.API_URL}/admin/imagekit/auth`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to generate upload token" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
