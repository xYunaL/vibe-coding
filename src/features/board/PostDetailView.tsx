"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { canPostInTeamChat, getTeam } from "@/lib/teams";
import { formatKstMonthDay, isValidUrl, cn } from "@/lib/utils";
import type { UserProfile } from "@/lib/types";
import { authorColor } from "./authorColor";
import type { BoardApi } from "./hooks/useBoard";
import type { Comment } from "./types";

type Props = {
  profile: UserProfile | null;
  board: BoardApi;
  postId: string;
  onBack: () => void;
};

/** User-supplied comment image with a graceful load-failure placeholder. */
function CommentImage({ src }: { src: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--color-charcoal-750)] px-3 py-2 text-[var(--text-faint)]">
        <span aria-hidden>🖼️</span>
        <span className="font-mono text-[10px] uppercase tracking-wider">
          이미지를 불러올 수 없습니다
        </span>
      </div>
    );
  }
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-[var(--border)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="댓글 이미지"
        onError={() => setBroken(true)}
        loading="lazy"
        className="max-h-80 w-full object-cover"
      />
    </div>
  );
}

function CommentRow({ comment }: { comment: Comment }) {
  return (
    <li className="rounded-lg bg-[var(--color-charcoal-650)] px-3 py-2.5">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
        <span style={{ color: authorColor(comment.authorTeamId) }}>
          {comment.authorNickname}
        </span>
        <span className="text-[var(--text-faint)]">·</span>
        <span className="text-[var(--text-faint)]">
          {formatKstMonthDay(comment.createdAt)}
        </span>
      </div>
      {comment.text && (
        <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--text-muted)]">
          {comment.text}
        </p>
      )}
      {comment.imageUrl && <CommentImage src={comment.imageUrl} />}
    </li>
  );
}

/**
 * Post detail view (X/Reddit style): full post + comment thread + composer.
 * Replaces the board list in-tab when a post is selected.
 */
export function PostDetailView({ profile, board, postId, onBack }: Props) {
  const [draft, setDraft] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const post = board.posts.find((p) => p.id === postId);

  const backButton = (
    <button
      type="button"
      onClick={onBack}
      className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-subtle)] hover:text-[var(--text)]"
    >
      ← 목록
    </button>
  );

  if (!post) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--color-charcoal-800)] p-6">
        {backButton}
        <EmptyState
          icon="🔍"
          title="글을 찾을 수 없어요"
          description="새로고침 시 게시글이 초기화됩니다. 목록으로 돌아가 주세요."
        />
      </section>
    );
  }

  const team = post.scope === "team" && post.teamId ? getTeam(post.teamId) : undefined;
  const liked = board.likedIds.has(post.id);
  const canComment =
    post.scope === "global"
      ? Boolean(profile)
      : canPostInTeamChat(profile ?? null, post.teamId ?? "");

  const urlOk = isValidUrl(imageUrl);
  const showUrlError = imageUrl.length > 0 && !urlOk;
  const canSubmit = canComment && (draft.trim().length > 0 || urlOk);

  function submit() {
    if (!canComment || !profile) return;
    const text = draft.trim();
    const url = urlOk ? imageUrl.trim() : undefined;
    if (!text && !url) return;
    board.addComment(post!.id, text, profile, url);
    setDraft("");
    setImageUrl("");
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--color-charcoal-800)] p-6">
      {backButton}

      {/* Post block */}
      <article className="mt-4">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
          <span style={{ color: authorColor(post.authorTeamId) }}>
            {post.authorNickname}
          </span>
          <span className="text-[var(--text-faint)]">·</span>
          <span className="text-[var(--text-faint)]">
            {formatKstMonthDay(post.createdAt)}
          </span>
          {team && (
            <>
              <span className="text-[var(--text-faint)]">·</span>
              <span className="text-[var(--color-f1-red)]">{team.name}</span>
            </>
          )}
        </div>
        <h1 className="mt-2 font-display text-2xl font-black tracking-tight text-[var(--text)]">
          {post.title}
        </h1>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-muted)]">
          {post.body}
        </p>

        {/* Action row */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => board.toggleLike(post.id)}
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
          <span className="font-mono text-[11px] text-[var(--text-subtle)]">
            💬 {post.comments.length}
          </span>
        </div>
      </article>

      {/* Comment thread */}
      <div className="mt-5 border-t border-[var(--border)] pt-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
          댓글 {post.comments.length}
        </p>

        {post.comments.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--text-faint)]">
            첫 댓글을 남겨보세요.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {post.comments.map((c) => (
              <CommentRow key={c.id} comment={c} />
            ))}
          </ul>
        )}

        {/* Composer */}
        {canComment ? (
          <div className="mt-4 grid gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.nativeEvent.isComposing ||
                    e.key === "Process" ||
                    e.keyCode === 229
                  )
                    return;
                  if (e.key === "Enter") submit();
                }}
                placeholder="댓글 달기…"
                aria-label="댓글 입력"
                className="flex-1 rounded-full border border-[var(--border)] bg-[var(--color-charcoal-800)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--color-f1-red)] focus:outline-none"
              />
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className="rounded-full bg-[var(--color-f1-red)] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--text)] transition-colors hover:bg-[var(--color-f1-red-pressed)] disabled:opacity-50"
              >
                등록
              </button>
            </div>

            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="사진 첨부 — https://example.com/image.jpg (선택)"
              aria-label="댓글 이미지 URL"
              aria-invalid={showUrlError}
              className="w-full rounded-full border border-[var(--border)] bg-[var(--color-charcoal-800)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--color-f1-red)] focus:outline-none"
            />
            {showUrlError && (
              <span className="font-mono text-[10px] text-[var(--color-f1-red)]">
                유효한 http(s) URL을 입력해주세요
              </span>
            )}
            {urlOk && <CommentImage src={imageUrl} />}
          </div>
        ) : (
          <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
            {profile ? "읽기 전용 게시판입니다" : "온보딩을 완료하면 댓글을 쓸 수 있어요"}
          </p>
        )}
      </div>
    </section>
  );
}
