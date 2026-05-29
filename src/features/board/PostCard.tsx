"use client";

import { formatKstMonthDay, cn } from "@/lib/utils";
import { authorColor } from "./authorColor";
import type { Post } from "./types";

type Props = {
  post: Post;
  liked: boolean;
  onOpen: () => void;
  onToggleLike: (id: string) => void;
};

export function PostCard({ post, liked, onOpen, onToggleLike }: Props) {
  const color = authorColor(post.authorTeamId);

  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--color-charcoal-700)]">
      <button type="button" onClick={onOpen} className="w-full p-4 text-left">
        <h3 className="font-display text-base font-bold text-[var(--text)]">
          {post.title}
        </h3>
        <p
          className={cn(
            "mt-1 text-sm text-[var(--text-muted)] leading-relaxed line-clamp-2"
          )}
        >
          {post.body}
        </p>
        <div className="mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
          <span style={{ color }}>{post.authorNickname}</span>
          <span className="text-[var(--text-faint)]">·</span>
          <span className="text-[var(--text-faint)]">{formatKstMonthDay(post.createdAt)}</span>
        </div>
      </button>

      <footer className="flex items-center justify-between border-t border-[var(--border)] px-4 py-2">
        <button
          type="button"
          onClick={() => onToggleLike(post.id)}
          aria-pressed={liked}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] transition-colors",
            liked
              ? "bg-[var(--color-f1-red)]/15 text-[var(--color-f1-red)]"
              : "text-[var(--text-subtle)] hover:text-[var(--text)]"
          )}
        >
          <span aria-hidden>{liked ? "❤️" : "🤍"}</span>
          {post.likes}
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)] hover:text-[var(--text)]"
        >
          💬 {post.comments.length}
        </button>
      </footer>
    </article>
  );
}
