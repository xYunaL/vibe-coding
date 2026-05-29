"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import type { F1GuideEntry } from "./types";

type Props = {
  entry: F1GuideEntry;
};

/**
 * F1 101 guide card (FR-009).
 * Only entries whose fullDesc adds meaningful detail over shortDesc get an
 * expand toggle; short entries just show the description inline.
 */
export function F1GuideCard({ entry }: Props) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  const expandable =
    entry.fullDesc.trim().length > entry.shortDesc.trim().length + 24;

  return (
    <li className="rounded-xl border border-white/8 bg-[var(--color-charcoal-700)] p-4">
      <h3 className="font-display text-base font-bold text-white">
        {entry.term}
      </h3>
      <p className="mt-1 text-sm text-white/65 leading-relaxed">
        {entry.shortDesc}
      </p>

      {expandable && expanded && (
        <p
          id={panelId}
          className="mt-3 border-t border-white/5 pt-3 text-sm leading-relaxed text-white/80"
        >
          {entry.fullDesc}
        </p>
      )}

      {expandable && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={expanded ? panelId : undefined}
          className={cn(
            "mt-3 font-mono text-[10px] uppercase tracking-wider transition-colors",
            expanded
              ? "text-[var(--color-carbon-gold)]"
              : "text-white/45 hover:text-white"
          )}
        >
          {expanded ? "접기 ▲" : "자세히 보기 ▼"}
        </button>
      )}
    </li>
  );
}
