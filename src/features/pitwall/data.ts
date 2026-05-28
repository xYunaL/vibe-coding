import type {
  RaceSchedule,
  DriverStanding,
  ConstructorStanding,
} from "./types";

type FallbackRace = Pick<
  RaceSchedule,
  "round" | "grandPrix" | "country" | "dateUtc" | "status"
>;

const FALLBACK_RACES: FallbackRace[] = [
  {
    round: 1,
    grandPrix: "바레인 그랑프리",
    country: "BHR",
    dateUtc: "2026-03-07T15:00:00Z",
    status: "completed",
  },
  {
    round: 2,
    grandPrix: "사우디아라비아 그랑프리",
    country: "SAU",
    dateUtc: "2026-03-21T17:00:00Z",
    status: "completed",
  },
  {
    round: 3,
    grandPrix: "호주 그랑프리",
    country: "AUS",
    dateUtc: "2026-04-05T05:00:00Z",
    status: "completed",
  },
  {
    round: 4,
    grandPrix: "일본 그랑프리",
    country: "JPN",
    dateUtc: "2026-04-19T05:00:00Z",
    status: "completed",
  },
  {
    round: 5,
    grandPrix: "모나코 그랑프리",
    country: "MON",
    dateUtc: "2026-05-24T13:00:00Z",
    status: "completed",
  },
  {
    round: 6,
    grandPrix: "캐나다 그랑프리",
    country: "CAN",
    dateUtc: "2026-06-14T18:00:00Z",
    status: "upcoming",
  },
  {
    round: 7,
    grandPrix: "스페인 그랑프리",
    country: "ESP",
    dateUtc: "2026-06-28T13:00:00Z",
    status: "upcoming",
  },
  {
    round: 8,
    grandPrix: "영국 그랑프리",
    country: "GBR",
    dateUtc: "2026-07-12T14:00:00Z",
    status: "upcoming",
  },
  {
    round: 9,
    grandPrix: "벨기에 그랑프리",
    country: "BEL",
    dateUtc: "2026-08-02T13:00:00Z",
    status: "upcoming",
  },
  {
    round: 10,
    grandPrix: "이탈리아 그랑프리",
    country: "ITA",
    dateUtc: "2026-09-06T13:00:00Z",
    status: "upcoming",
  },
];

/** Fallback schedule has no per-session detail (sessions: []). */
export const RACE_SCHEDULE: RaceSchedule[] = FALLBACK_RACES.map((r) => ({
  ...r,
  meetingKey: 0,
  startUtc: r.dateUtc,
  endUtc: r.dateUtc,
  sessions: [],
}));

export const DRIVER_STANDINGS: DriverStanding[] = [
  { rank: 1, name: "Max Verstappen", code: "VER", teamId: "redbull", points: 412 },
  { rank: 2, name: "Lando Norris", code: "NOR", teamId: "mclaren", points: 345 },
  { rank: 3, name: "Charles Leclerc", code: "LEC", teamId: "ferrari", points: 320 },
  { rank: 4, name: "Oscar Piastri", code: "PIA", teamId: "mclaren", points: 282 },
  { rank: 5, name: "Lewis Hamilton", code: "HAM", teamId: "ferrari", points: 220 },
  { rank: 6, name: "Carlos Sainz", code: "SAI", teamId: "williams", points: 198 },
  { rank: 7, name: "George Russell", code: "RUS", teamId: "mercedes", points: 190 },
  { rank: 8, name: "Kimi Antonelli", code: "ANT", teamId: "mercedes", points: 151 },
  { rank: 9, name: "Fernando Alonso", code: "ALO", teamId: "astonmartin", points: 72 },
  { rank: 10, name: "Yuki Tsunoda", code: "TSU", teamId: "rb", points: 32 },
];

export const CONSTRUCTOR_STANDINGS: ConstructorStanding[] = [
  { rank: 1, teamId: "mclaren", name: "McLaren Formula 1 Team", points: 627 },
  { rank: 2, teamId: "redbull", name: "Oracle Red Bull Racing", points: 563 },
  { rank: 3, teamId: "ferrari", name: "Scuderia Ferrari HP", points: 540 },
  { rank: 4, teamId: "mercedes", name: "Mercedes-AMG Petronas F1 Team", points: 341 },
  { rank: 5, teamId: "astonmartin", name: "Aston Martin Aramco F1 Team", points: 86 },
  { rank: 6, teamId: "williams", name: "Williams Racing", points: 78 },
  { rank: 7, teamId: "rb", name: "Visa Cash App RB F1 Team", points: 44 },
  { rank: 8, teamId: "haas", name: "MoneyGram Haas F1 Team", points: 38 },
  { rank: 9, teamId: "alpine", name: "BWT Alpine F1 Team", points: 29 },
  { rank: 10, teamId: "sauber", name: "Stake F1 Team Kick Sauber", points: 4 },
];
