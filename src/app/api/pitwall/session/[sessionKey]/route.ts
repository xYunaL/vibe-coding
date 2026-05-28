import { NextResponse } from "next/server";
import { fetchSessionResult } from "@/features/pitwall/openf1";

/**
 * GET /api/pitwall/session/[sessionKey]
 * Returns a completed session's result table (OpenF1 session_result joined
 * with driver info). Dynamic for the same reason as /api/pitwall; OpenF1
 * fetches are cached at the fetch layer (1h). Empty rows on failure so the
 * modal can show a graceful "결과 없음" state.
 */
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionKey: string }> }
) {
  const { sessionKey } = await params;
  const key = Number(sessionKey);
  if (!Number.isFinite(key)) {
    return NextResponse.json(
      { sessionName: "Session", sessionType: "", hasPoints: false, rows: [] },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
  try {
    const result = await fetchSessionResult(key);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { sessionName: "Session", sessionType: "", hasPoints: false, rows: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
