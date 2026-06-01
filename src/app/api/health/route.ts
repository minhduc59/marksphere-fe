import { NextResponse } from "next/server";

// ALB health check endpoint. Kept lightweight and unauthenticated.
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({ status: "ok" });
}
