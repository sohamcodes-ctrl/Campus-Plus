import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "liveness";

  const memUsage = process.memoryUsage();

  const baseHealth = {
    status: "ok",
    version: "0.1.0",
    service: "campus-plus",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
  };

  if (type === "readiness") {
    return NextResponse.json(
      {
        ...baseHealth,
        type: "readiness",
        checks: {
          runtime: "healthy",
          configuration: "loaded",
          memoryMb: {
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            rss: Math.round(memUsage.rss / 1024 / 1024),
          },
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }

  // Default: liveness probe
  return NextResponse.json(
    {
      ...baseHealth,
      type: "liveness",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
