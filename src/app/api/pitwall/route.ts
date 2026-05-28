import { NextResponse } from "next/server";
import { fetchPitWallData } from "@/features/pitwall/openf1";
import {
  DRIVER_STANDINGS,
  CONSTRUCTOR_STANDINGS,
  RACE_SCHEDULE,
} from "@/features/pitwall/data";

/**
 * GET /api/pitwall
 * Server-side aggregation of OpenF1 standings + schedule with ISR caching.
 * Falls back to static data (features/pitwall/data.ts) on any failure so the
 * Pit Wall tab never breaks. `source` lets the UI label the data origin.
 */
export const revalidate = 3600;

export async function GET() {
  try {
    const data = await fetchPitWallData();
    if (data.drivers.length === 0 || data.constructors.length === 0) {
      throw new Error("OpenF1 returned empty standings");
    }
    return NextResponse.json({ ...data, source: "openf1" as const });
  } catch {
    return NextResponse.json({
      drivers: DRIVER_STANDINGS,
      constructors: CONSTRUCTOR_STANDINGS,
      schedule: RACE_SCHEDULE,
      source: "fallback" as const,
    });
  }
}
