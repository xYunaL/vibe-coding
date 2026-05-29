"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import {
  canPostInTeamChat,
  defaultGarageTeamId,
  getRealTeamIds,
  getTeam,
} from "@/lib/teams";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@/lib/types";
import { BoardTeamTabs } from "./BoardTeamTabs";
import { PostCard } from "./PostCard";
import { PostComposer } from "./PostComposer";
import type { BoardApi } from "./hooks/useBoard";
import type { BoardScope } from "./types";

type SortOrder = "latest" | "popular";

type Props = {
  profile: UserProfile | null;
  board: BoardApi;
  onOpenPost: (postId: string) => void;
};

const SORTS: { id: SortOrder; label: string }[] = [
  { id: "latest", label: "최신순" },
  { id: "popular", label: "인기순" },
];

/**
 * 게시판 — 전체/팀별 서브탭. 글쓰기/댓글 권한은 채팅과 동일(canPostInTeamChat).
 */
export function BoardView({ profile, board, onOpenPost }: Props) {
  const [scope, setScope] = useState<BoardScope>("global");
  const [activeTeamId, setActiveTeamId] = useState<string>(() =>
    defaultGarageTeamId(profile)
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");
  const [composerOpen, setComposerOpen] = useState(false);

  const myTeamIds = getRealTeamIds(profile);

  const visible = useMemo(() => {
    const list = board.posts.filter((p) =>
      scope === "global"
        ? p.scope === "global"
        : p.scope === "team" && p.teamId === activeTeamId
    );
    return [...list].sort((a, b) =>
      sortOrder === "popular"
        ? b.likes - a.likes
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [board.posts, scope, activeTeamId, sortOrder]);

  const canWrite =
    scope === "global"
      ? Boolean(profile)
      : canPostInTeamChat(profile ?? null, activeTeamId);

  const activeTeam = scope === "team" ? getTeam(activeTeamId) : undefined;
  const scopeLabel = scope === "global" ? "전체" : activeTeam?.name ?? "팀";

  const lockReason = !profile
    ? "온보딩을 완료하면 글을 쓸 수 있어요"
    : scope === "team" && !canWrite
      ? `읽기 전용 — ${activeTeam?.name ?? "이 팀"} 팬만 글을 쓸 수 있어요`
      : null;

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--color-charcoal-800)] p-6">
      <header className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="font-display text-xl font-black tracking-tight">
            게시판
          </h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-subtle)]">
            전체·팀별 커뮤니티
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setComposerOpen(true)}
          disabled={!canWrite}
        >
          + 글쓰기
        </Button>
      </header>

      {/* Scope toggle */}
      <div className="mt-4 flex gap-1 rounded-full bg-[var(--color-charcoal-700)] p-1 w-fit">
        {(["global", "team"] as BoardScope[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setScope(s)}
            aria-pressed={scope === s}
            className={cn(
              "rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
              scope === s
                ? "bg-[var(--color-f1-red)] text-[var(--text)]"
                : "text-[var(--text-subtle)] hover:text-[var(--text)]"
            )}
          >
            {s === "global" ? "전체" : "팀별"}
          </button>
        ))}
      </div>

      {scope === "team" && (
        <div className="mt-3">
          <BoardTeamTabs
            activeTeamId={activeTeamId}
            onSelect={setActiveTeamId}
            myTeamIds={myTeamIds}
          />
        </div>
      )}

      {lockReason && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-[var(--color-carbon-gold)]/30 bg-[var(--color-carbon-gold)]/10 px-3 py-2">
          <span aria-hidden>🔒</span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-carbon-gold)]">
            {lockReason}
          </span>
        </div>
      )}

      {/* Sort */}
      <div className="mt-4 flex gap-2" role="group" aria-label="정렬">
        {SORTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSortOrder(s.id)}
            aria-pressed={s.id === sortOrder}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors",
              s.id === sortOrder
                ? "bg-[var(--color-f1-red)] text-[var(--text)]"
                : "border border-[var(--border)] bg-[var(--color-charcoal-700)] text-[var(--text-subtle)] hover:text-[var(--text)]"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon="📝"
          title="아직 글이 없어요"
          description={canWrite ? "첫 글을 작성해보세요." : "이 게시판에 아직 글이 없습니다."}
        />
      ) : (
        <div className="mt-5 grid gap-3">
          {visible.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              liked={board.likedIds.has(post.id)}
              onOpen={() => onOpenPost(post.id)}
              onToggleLike={board.toggleLike}
            />
          ))}
        </div>
      )}

      {composerOpen && (
        <PostComposer
          scopeLabel={scopeLabel}
          onClose={() => setComposerOpen(false)}
          onSubmit={({ title, body }) => {
            if (!profile) return;
            board.addPost({
              scope,
              teamId: scope === "team" ? activeTeamId : undefined,
              title,
              body,
              profile,
            });
            setSortOrder("latest");
          }}
        />
      )}
    </section>
  );
}
