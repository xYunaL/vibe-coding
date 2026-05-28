import type {
  ConstructorStanding,
  DriverStanding,
  RaceSchedule,
} from "./types";

/**
 * OpenF1 API integration (https://openf1.org) — Pit Wall data only.
 *
 * Scope is intentionally limited to driver/constructor standings + the race
 * calendar (see TECHNICAL_DESIGN Decision Log). All requests are server-side
 * with ISR caching; the route handler falls back to static data on failure.
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
  meeting_name: string;
  country_code: string;
  date_start: string;
};

export type PitWallData = {
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
  schedule: RaceSchedule[];
};

export async function fetchPitWallData(): Promise<PitWallData> {
  // Sequential, not Promise.all: OpenF1's free tier allows 3 req/s, and four
  // concurrent calls trip a 429. ISR caching makes the extra latency moot.
  const champDrivers = await f1<RawChampDriver[]>(
    "/championship_drivers?session_key=latest"
  );
  const champTeams = await f1<RawChampTeam[]>(
    "/championship_teams?session_key=latest"
  );
  const driverInfo = await f1<RawDriver[]>("/drivers?session_key=latest");
  const meetings = await f1<RawMeeting[]>(`/meetings?year=${SEASON}`);

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
  const schedule: RaceSchedule[] = meetings
    .filter((m) => !/testing/i.test(m.meeting_name))
    .map((m, i) => ({
      round: i + 1,
      grandPrix: m.meeting_name,
      country: m.country_code,
      dateUtc: m.date_start,
      status: new Date(m.date_start).getTime() < now ? "completed" : "upcoming",
    }));

  return { drivers, constructors, schedule };
}
