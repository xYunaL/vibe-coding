import type {
  ConstructorStanding,
  DriverStanding,
  RaceSchedule,
  RaceSession,
  RaceStatus,
  SessionResult,
  SessionResultRow,
} from "./types";

/**
 * OpenF1 API integration (https://openf1.org) — Pit Wall data only.
 *
 * Scope is intentionally limited to driver/constructor standings, the race
 * calendar (with sessions), and per-session results (see TECHNICAL_DESIGN
 * Decision Log). All requests are server-side with ISR caching; the route
 * handlers fall back to static data on failure.
 */

const BASE = "https://api.openf1.org/v1";
const SEASON = 2026;
const REVALIDATE_SECONDS = 3600; // standings change at most once per race

/** OpenF1 team_name → our internal teamId (lib/teams.ts). */
const TEAM_NAME_TO_ID: Record<string, string> = {
  McLaren: "mclaren",
  Mercedes: "mercedes",
  "Red Bull Racing": "redbull",
  Ferrari: "ferrari",
  Williams: "williams",
  "Racing Bulls": "racingbulls",
  "Aston Martin": "astonmartin",
  "Haas F1 Team": "haas",
  Audi: "audi",
  Alpine: "alpine",
  Cadillac: "cadillac",
};

function teamIdFromName(name: string): string {
  return TEAM_NAME_TO_ID[name] ?? name.toLowerCase().replace(/\s+/g, "");
}

async function f1<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`OpenF1 ${path} → ${res.status}`);
  return (await res.json()) as T;
}

type RawChampDriver = {
  driver_number: number;
  position_current: number;
  points_current: number;
};
type RawChampTeam = {
  team_name: string;
  position_current: number;
  points_current: number;
};
type RawDriver = {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  headshot_url: string | null;
};
type RawMeeting = {
  meeting_key: number;
  meeting_name: string;
  country_code: string;
  date_start: string;
};
type RawSession = {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  meeting_key: number;
};
type RawResult = {
  position: number | null;
  driver_number: number;
  points?: number;
  dnf?: boolean;
  dns?: boolean;
  dsq?: boolean;
};

export type PitWallData = {
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
  schedule: RaceSchedule[];
};

export async function fetchPitWallData(): Promise<PitWallData> {
  // Sequential, not Promise.all: OpenF1's free tier allows 3 req/s, and
  // concurrent calls trip a 429. ISR caching makes the extra latency moot.
  const champDrivers = await f1<RawChampDriver[]>(
    "/championship_drivers?session_key=latest"
  );
  const champTeams = await f1<RawChampTeam[]>(
    "/championship_teams?session_key=latest"
  );
  const driverInfo = await f1<RawDriver[]>("/drivers?session_key=latest");
  const meetings = await f1<RawMeeting[]>(`/meetings?year=${SEASON}`);
  const sessions = await f1<RawSession[]>(`/sessions?year=${SEASON}`);

  const infoByNumber = new Map(driverInfo.map((d) => [d.driver_number, d]));

  const drivers: DriverStanding[] = [...champDrivers]
    .sort((a, b) => a.position_current - b.position_current)
    .map((c) => {
      const info = infoByNumber.get(c.driver_number);
      return {
        rank: c.position_current,
        name: info?.full_name ?? `#${c.driver_number}`,
        code: info?.name_acronym ?? "",
        teamId: info ? teamIdFromName(info.team_name) : "",
        points: c.points_current,
        headshotUrl: info?.headshot_url ?? undefined,
      };
    });

  const constructors: ConstructorStanding[] = [...champTeams]
    .sort((a, b) => a.position_current - b.position_current)
    .map((c) => ({
      rank: c.position_current,
      teamId: teamIdFromName(c.team_name),
      name: c.team_name,
      points: c.points_current,
    }));

  const now = Date.now();
  const gpMeetings = meetings.filter((m) => !/testing/i.test(m.meeting_name));
  const schedule: RaceSchedule[] = gpMeetings.map((m, i) => {
    const gpSessions: RaceSession[] = sessions
      .filter((s) => s.meeting_key === m.meeting_key)
      .sort(
        (a, b) =>
          new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
      )
      .map((s) => ({
        sessionKey: s.session_key,
        name: s.session_name,
        type: s.session_type,
        startUtc: s.date_start,
        endUtc: s.date_end,
        completed: new Date(s.date_end).getTime() < now,
      }));

    const startUtc = gpSessions[0]?.startUtc ?? m.date_start;
    const endUtc = gpSessions[gpSessions.length - 1]?.endUtc ?? m.date_start;
    const status: RaceStatus =
      new Date(endUtc).getTime() < now ? "completed" : "upcoming";

    return {
      round: i + 1,
      grandPrix: m.meeting_name,
      country: m.country_code,
      dateUtc: startUtc,
      status,
      meetingKey: m.meeting_key,
      startUtc,
      endUtc,
      sessions: gpSessions,
    };
  });

  return { drivers, constructors, schedule };
}

/**
 * Result table for a single session (FR-011 extension).
 * Joins session_result with driver info (name/team/headshot).
 */
export async function fetchSessionResult(
  sessionKey: number
): Promise<SessionResult> {
  // Two calls only (the caller already knows the session name/type), which
  // keeps us comfortably under OpenF1's rate limit when opening results.
  const results = await f1<RawResult[]>(
    `/session_result?session_key=${sessionKey}`
  );
  const drivers = await f1<RawDriver[]>(`/drivers?session_key=${sessionKey}`);

  const infoByNumber = new Map(drivers.map((d) => [d.driver_number, d]));
  const hasPoints = results.some((r) => typeof r.points === "number");

  const rows: SessionResultRow[] = [...results]
    .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
    .map((r) => {
      const info = infoByNumber.get(r.driver_number);
      return {
        position: r.position ?? 0,
        driverNumber: r.driver_number,
        name: info?.full_name ?? `#${r.driver_number}`,
        code: info?.name_acronym ?? "",
        teamId: info ? teamIdFromName(info.team_name) : "",
        headshotUrl: info?.headshot_url ?? undefined,
        points: typeof r.points === "number" ? r.points : undefined,
        dnf: r.dnf,
        dns: r.dns,
        dsq: r.dsq,
      };
    });

  // sessionName/Type are filled by the caller (it knows the clicked session).
  return { sessionName: "", sessionType: "", hasPoints, rows };
}
