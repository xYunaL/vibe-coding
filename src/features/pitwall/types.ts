export type RaceStatus = "upcoming" | "completed";

/** A single session within a Grand Prix weekend (Practice/Qualifying/Sprint/Race). */
export type RaceSession = {
  sessionKey: number;
  name: string; // "Practice 1", "Qualifying", "Sprint", "Race"
  type: string; // "Practice" | "Qualifying" | "Race"
  startUtc: string;
  endUtc: string;
  /** date_end < now */
  completed: boolean;
};

export type RaceSchedule = {
  round: number;
  grandPrix: string;
  country: string;
  /** ISO datetime in UTC; convert to KST at render time */
  dateUtc: string;
  status: RaceStatus;
  meetingKey: number;
  /** GP weekend span: first session start / last session end (ISO UTC). */
  startUtc: string;
  endUtc: string;
  sessions: RaceSession[];
};

export type DriverStanding = {
  rank: number;
  name: string;
  code: string;
  teamId: string;
  points: number;
  /** Driver headshot URL (from OpenF1); absent for static fallback data. */
  headshotUrl?: string;
};

export type ConstructorStanding = {
  rank: number;
  teamId: string;
  name: string;
  points: number;
};

/** One row of a completed session's result table. */
export type SessionResultRow = {
  position: number;
  driverNumber: number;
  name: string;
  code: string;
  teamId: string;
  headshotUrl?: string;
  /** Race/Sprint only. */
  points?: number;
  dnf?: boolean;
  dns?: boolean;
  dsq?: boolean;
};

export type SessionResult = {
  sessionName: string;
  sessionType: string;
  /** True for Race/Sprint (points awarded). */
  hasPoints: boolean;
  rows: SessionResultRow[];
};
