"use client";

import { useEffect, useState } from "react";
import { getTeam } from "@/lib/teams";
import { formatKstDateTime, cn } from "@/lib/utils";
import type {
  ConstructorStanding,
  DriverStanding,
  RaceSchedule,
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
  return (
    <ul className="grid gap-2">
      {rows.map((race) => {
        const isNext = race === nextRace;
        return (
          <li
            key={race.round}
            className={cn(
              "flex items-center justify-between rounded-xl border p-4",
              isNext
                ? "border-[var(--color-f1-red)] bg-[var(--color-f1-red)]/8"
                : "border-white/8 bg-[var(--color-charcoal-700)]"
            )}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-white/45 w-8">
                R{race.round}
              </span>
              <div>
                <p className="text-sm font-bold text-white">{race.grandPrix}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/45">
                  {race.country} · {formatKstDateTime(race.dateUtc)}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-wider",
                race.status === "completed"
                  ? "text-white/40"
                  : "text-[var(--color-carbon-gold)]"
              )}
            >
              {race.status === "completed" ? "완료" : isNext ? "다음 경기" : "예정"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
