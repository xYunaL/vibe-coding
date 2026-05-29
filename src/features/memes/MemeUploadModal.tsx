"use client";

import { useState } from "react";
import { isValidUrl } from "@/lib/utils";

type Props = {
  onClose: () => void;
  onSubmit: (input: { imageUrl: string; caption?: string }) => void;
};

/**
 * Meme upload modal (FR-006). Image URL is required and must be a valid
 * http(s) URL; caption is optional. (Avoids large file upload boundary.)
 *
 * Rendered conditionally by the parent, so each open is a fresh mount.
 */
export function MemeUploadModal({ onClose, onSubmit }: Props) {
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");

  const urlOk = isValidUrl(imageUrl);
  const showError = imageUrl.length > 0 && !urlOk;

  function handleSubmit() {
    if (!urlOk) return;
    onSubmit({ imageUrl, caption: caption.trim() || undefined });
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="meme-upload-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--color-charcoal-800)] p-6">
        <h2
          id="meme-upload-title"
          className="font-display text-xl font-black tracking-tight"
        >
          밈 올리기
        </h2>
        <p className="mt-1 text-sm text-[var(--text-subtle)]">
          이미지 URL을 붙여넣고 캡션을 더해보세요.
        </p>

        <label className="mt-5 block">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-subtle)]">
            Image URL *
          </span>
          <input
            autoFocus
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/meme.jpg"
            aria-label="이미지 URL"
            aria-invalid={showError}
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--color-charcoal-700)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--color-f1-red)] focus:outline-none"
          />
          {showError && (
            <span className="mt-1 block font-mono text-[10px] text-[var(--color-f1-red)]">
              유효한 http(s) URL을 입력해주세요
            </span>
          )}
        </label>

        {urlOk && (
          <div className="mt-3 overflow-hidden rounded-lg border border-[var(--border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="미리보기"
              className="max-h-40 w-full object-cover"
            />
          </div>
        )}

        <label className="mt-4 block">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-subtle)]">
            Caption
          </span>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.key === "Process" || e.keyCode === 229)
                return;
              if (e.key === "Enter" && urlOk) handleSubmit();
            }}
            placeholder="(선택) 한 줄 캡션"
            aria-label="캡션"
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--color-charcoal-700)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] focus:border-[var(--color-f1-red)] focus:outline-none"
          />
        </label>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-subtle)] hover:text-[var(--text)]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!urlOk}
            className="rounded-full bg-[var(--color-f1-red)] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--text)] transition-colors hover:bg-[var(--color-f1-red-pressed)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            게시
          </button>
        </div>
      </div>
    </div>
  );
}
