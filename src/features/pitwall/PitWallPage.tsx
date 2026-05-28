"use client";

import { useEffect, useState } from "react";
import { getTeam } from "@/lib/teams";
import { formatKstClock, formatKstMonthDay, cn } from "@/lib/utils";
import type {
  ConstructorStanding,
  DriverStanding,
  RaceSchedule,
  RaceSession,
  SessionResult,
} from "./types";

type SubTab = "drivers" | "constructors" | "schedule";

const SUBTABS: { id: SubTab; label: string }[] = [
  { id: "drivers", label: "Drivers" },
  { id: "constructors", label: "Constructors" },
  { id: "schedule", label: "Schedule" },
];

type PitWallResponse = {
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
  schedule: RaceSchedule[];
  source: "openf1" | "fallback";
};

/**
 * Pit Wall (FR-010, FR-011). Standings + schedule come from /api/pitwall,
 * which aggregates OpenF1 with ISR caching and a static fallback.
 */
export function PitWallPage() {
  const [tab, setTab] = useState<SubTab>("drivers");
  const [data, setData] = useState<PitWallResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/pitwall")
      .then((r) => r.json())
      .then((d: PitWallResponse) => {
        if (alive) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-white/8 bg-[var(--color-charcoal-800)] p-6">
      <header className="flex items-start justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="font-display text-xl font-black tracking-tight">
            Pit Wall
          </h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/45">
            순위 · 일정 (KST)
          </p>
        </div>
        {data && <SourceBadge source={data.source} />}
      </header>

      <nav
        aria-label="피트월 하위 탭"
        className="mt-4 flex gap-1 rounded-full bg-[var(--color-charcoal-700)] p-1 w-fit"
      >
        {SUBTABS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setTab(s.id)}
            aria-pressed={s.id === tab}
            className={cn(
              "rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
              s.id === tab
                ? "bg-[var(--color-f1-red)] text-white"
                : "text-white/55 hover:text-white"
            )}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="mt-5">
        {loading || !data ? (
          <LoadingState />
        ) : (
          <>
            {tab === "drivers" && <DriversTable rows={data.drivers} />}
            {tab === "constructors" && (
              <ConstructorsGrid rows={data.constructors} />
            )}
            {tab === "schedule" && <ScheduleList rows={data.schedule} />}
          </>
        )}
      </div>
    </section>
  );
}

function SourceBadge({ source }: { source: PitWallResponse["source"] }) {
  const live = source === "openf1";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider",
        live
          ? "bg-[var(--color-carbon-gold)]/10 text-[var(--color-carbon-gold)]"
          : "bg-[var(--color-charcoal-700)] text-white/45"
      )}
      title={live ? "OpenF1 실시간 데이터" : "오프라인 캐시 데이터"}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          live ? "bg-[var(--color-carbon-gold)]" : "bg-white/30"
        )}
        aria-hidden
      />
      {live ? "OpenF1 Live" : "Cached"}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="space-y-2" aria-busy="true" aria-live="polite">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-12 animate-pulse rounded-xl bg-[var(--color-charcoal-700)]"
        />
      ))}
    </div>
  );
}

function DriverAvatar({
  url,
  code,
  teamColor,
}: {
  url?: string;
  code: string;
  teamColor?: string;
}) {
  const [broken, setBroken] = useState(false);
  const ring = { boxShadow: `0 0 0 2px ${teamColor ?? "rgba(255,255,255,0.2)"}` };

  if (!url || broken) {
    return (
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-charcoal-600)] font-mono text-[9px] text-white/70"
        style={ring}
        aria-hidden
      >
        {code || "—"}
      </span>
    );
  }
  return (
    // F1 headshot URLs are external; <img> avoids next/image domain config.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      onError={() => setBroken(true)}
      loading="lazy"
      className="h-9 w-9 shrink-0 rounded-full bg-[var(--color-charcoal-700)] object-cover object-top"
      style={ring}
    />
  );
}

function DriversTable({ rows }: { rows: DriverStanding[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/8">
      <table className="w-full text-sm">
        <thead className="bg-[var(--color-charcoal-700)] text-white/55">
          <tr className="font-mono text-[10px] uppercase tracking-wider">
            <th className="px-3 py-2 text-left">Pos</th>
            <th className="px-3 py-2 text-left">Driver</th>
            <th className="px-3 py-2 text-left">Team</th>
            <th className="px-3 py-2 text-right">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => {
            const team = getTeam(d.teamId);
            return (
              <tr
                key={`${d.rank}-${d.code}`}
                className="border-t border-white/5 hover:bg-white/[0.02]"
              >
                <td className="px-3 py-2 font-mono text-white/70">{d.rank}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2.5">
                    <DriverAvatar
                      url={d.headshotUrl}
                      code={d.code}
                      teamColor={team?.baseColor}
                    />
                    <span>
                      <span className="font-mono text-white/40">{d.code}</span>{" "}
                      <span className="text-white">{d.name}</span>
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span
                    className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
                    style={{ background: team?.baseColor }}
                    aria-hidden
                  />
                  <span className="align-middle text-white/70">
                    {team?.name ?? d.teamId}
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-mono text-white">
                  {d.points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ConstructorsGrid({ rows }: { rows: ConstructorStanding[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {rows.map((c) => {
        const team = getTeam(c.teamId);
        return (
          <li
            key={`${c.rank}-${c.teamId}`}
            className="flex items-center justify-between rounded-xl border border-white/8 bg-[var(--color-charcoal-700)] p-4"
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-block h-8 w-1 rounded-sm"
                style={{ background: team?.baseColor }}
                aria-hidden
              />
              <div>
                <p className="font-display text-sm font-bold">
                  {c.rank}. {team?.name ?? c.name}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/45">
                  {c.name}
                </p>
              </div>
            </div>
            <span className="font-mono text-lg text-white">{c.points}</span>
          </li>
        );
      })}
    </ul>
  );
}

function ScheduleList({ rows }: { rows: RaceSchedule[] }) {
  const nextRace = rows.find((r) => r.status === "upcoming");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeSession, setActiveSession] = useState<RaceSession | null>(null);

  return (
    <>
      <ul className="grid gap-2">
        {rows.map((race) => {
          const isNext = race === nextRace;
          const open = expanded === race.round;
          const period =
            formatKstMonthDay(race.startUtc) === formatKstMonthDay(race.endUtc)
              ? formatKstMonthDay(race.startUtc)
              : `${formatKstMonthDay(race.startUtc)} – ${formatKstMonthDay(
                  race.endUtc
                )}`;
          return (
            <li
              key={race.round}
              className={cn(
                "overflow-hidden rounded-xl border",
                isNext
                  ? "border-[var(--color-f1-red)] bg-[var(--color-f1-red)]/8"
                  : "border-white/8 bg-[var(--color-charcoal-700)]"
              )}
            >
              <button
                type="button"
                onClick={() => setExpanded(open ? null : race.round)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 font-mono text-xs text-white/45">
                    R{race.round}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {race.grandPrix}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-white/45">
                      {race.country}
                    </p>
                    <p className="mt-1 font-display text-lg font-black tracking-tight text-white">
                      {period}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-wider",
                      race.status === "completed"
                        ? "text-white/40"
                        : "text-[var(--color-carbon-gold)]"
                    )}
                  >
                    {race.status === "completed"
                      ? "완료"
                      : isNext
                        ? "다음 경기"
                        : "예정"}
                  </span>
                  <span
                    className="font-mono text-white/35"
                    aria-hidden
                  >
                    {open ? "▲" : "▼"}
                  </span>
                </div>
              </button>

              {open && (
                <div className="border-t border-white/8 p-2">
                  {race.sessions.length === 0 ? (
                    <p className="px-2 py-3 font-mono text-[11px] uppercase tracking-wider text-white/40">
                      세션 정보 없음
                    </p>
                  ) : (
                    <ul className="grid gap-1">
                      {race.sessions.map((s) => (
                        <li key={s.sessionKey}>
                          <button
                            type="button"
                            disabled={!s.completed}
                            onClick={() => setActiveSession(s)}
                            className={cn(
                              "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors",
                              s.completed
                                ? "cursor-pointer hover:bg-white/[0.04]"
                                : "cursor-not-allowed opacity-45"
                            )}
                          >
                            <span className="font-mono text-[11px] uppercase tracking-wider text-white/75">
                              {formatKstMonthDay(s.startUtc)}
                              <span className="mx-1.5 text-white/25">/</span>
                              {s.name}
                              <span className="mx-1.5 text-white/25">/</span>
                              {formatKstClock(s.startUtc)} -{" "}
                              {formatKstClock(s.endUtc)}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-wider text-white/35">
                              {s.completed ? "결과 보기" : "예정"}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {activeSession && (
        <SessionResultModal
          session={activeSession}
          onClose={() => setActiveSession(null)}
        />
      )}
    </>
  );
}

function SessionResultModal({
  session,
  onClose,
}: {
  session: RaceSession;
  onClose: () => void;
}) {
  const [result, setResult] = useState<SessionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch(`/api/pitwall/session/${session.sessionKey}`)
      .then((r) => r.json())
      .then((d: SessionResult) => {
        if (alive) {
          setResult(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [session.sessionKey]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-result-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-white/8 bg-[var(--color-charcoal-800)]"
      >
        <header className="flex items-center justify-between border-b border-white/5 p-5">
          <div>
            <h3
              id="session-result-title"
              className="font-display text-lg font-black tracking-tight"
            >
              {session.name}
            </h3>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/45">
              {formatKstMonthDay(session.startUtc)} 결과
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-full px-3 py-1 font-mono text-xs text-white/55 hover:text-white"
          >
            ✕
          </button>
        </header>

        <div className="overflow-y-auto p-3">
          {loading ? (
            <div className="space-y-2" aria-busy="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-lg bg-[var(--color-charcoal-700)]"
                />
              ))}
            </div>
          ) : !result || result.rows.length === 0 ? (
            <p className="py-10 text-center font-mono text-[11px] uppercase tracking-wider text-white/40">
              결과를 불러올 수 없습니다
            </p>
          ) : (
            <ul className="grid gap-1">
              {result.rows.map((row) => {
                const team = getTeam(row.teamId);
                return (
                  <li
                    key={row.driverNumber}
                    className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-white/[0.02]"
                  >
                    <span className="w-6 text-center font-mono text-sm text-white/70">
                      {row.position || "—"}
                    </span>
                    <DriverAvatar
                      url={row.headshotUrl}
                      code={row.code}
                      teamColor={team?.baseColor}
                    />
                    <span className="flex-1 text-sm">
                      <span className="font-mono text-white/40">{row.code}</span>{" "}
                      <span className="text-white">{row.name}</span>
                    </span>
                    <span className="font-mono text-[11px] text-white/55">
                      {team?.name ?? row.teamId}
                    </span>
                    {result.hasPoints && (
                      <span className="w-10 text-right font-mono text-sm text-white">
                        {row.points ?? 0}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
