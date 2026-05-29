"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { F1_GUIDE, GUIDE_CATEGORIES } from "./data";
import { F1GuideCard } from "./F1GuideCard";
import { cn } from "@/lib/utils";

/**
 * F1 101 guide (FR-009). Category tabs + keyword search + inline-expandable cards.
 * When a keyword is present it searches across ALL categories
 * (term/shortDesc/fullDesc); otherwise the category tab filters.
 */
export function F1101Guide() {
  const [category, setCategory] = useState(GUIDE_CATEGORIES[0]);
  const [keyword, setKeyword] = useState("");

  const trimmed = keyword.trim().toLowerCase();
  const searching = trimmed.length > 0;

  const entries = useMemo(() => {
    if (searching) {
      return F1_GUIDE.filter((e) =>
        `${e.term} ${e.shortDesc} ${e.fullDesc}`.toLowerCase().includes(trimmed)
      );
    }
    return F1_GUIDE.filter((e) => e.category === category);
  }, [searching, trimmed, category]);

  return (
    <section className="rounded-2xl border border-white/8 bg-[var(--color-charcoal-800)] p-6">
      <header className="border-b border-white/5 pb-4">
        <h2 className="font-display text-xl font-black tracking-tight">F1 101</h2>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/45">
          입문자를 위한 용어·전략 가이드
        </p>
      </header>

      {/* Keyword search */}
      <div className="mt-4 relative">
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="용어·전략 검색 (예: DRS, 언더컷)"
          aria-label="가이드 검색"
          className="w-full rounded-full border border-white/10 bg-[var(--color-charcoal-700)] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[var(--color-f1-red)] focus:outline-none"
        />
      </div>

      {/* Category tabs (hidden meaning while searching) */}
      <nav
        aria-label="가이드 카테고리"
        className={cn("mt-3 flex flex-wrap gap-2", searching && "opacity-40")}
      >
        {GUIDE_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setKeyword("");
              setCategory(c);
            }}
            aria-pressed={!searching && c === category}
            className={cn(
              "rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
              !searching && c === category
                ? "bg-[var(--color-f1-red)] text-white"
                : "border border-white/10 bg-[var(--color-charcoal-700)] text-white/65 hover:text-white"
            )}
          >
            {c}
          </button>
        ))}
      </nav>

      {entries.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="검색 결과가 없어요"
          description={`"${keyword.trim()}"에 해당하는 용어를 찾지 못했습니다.`}
        />
      ) : (
        <ul className="mt-5 grid items-start gap-3 sm:grid-cols-2">
          {entries.map((entry) => (
            <F1GuideCard key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </section>
  );
}
