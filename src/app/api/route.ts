import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    message: "ResFood Internal API Router is active",
    version: "1.0.0",
    endpoints: [
      { path: "/api/auth", description: "Authentication endpoints" },
      { path: "/api/surplus", description: "Food surplus listings database" },
      { path: "/api/donations", description: "Charity donor requests" },
    ],
  });
}
