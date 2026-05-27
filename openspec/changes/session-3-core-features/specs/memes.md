---
capability: memes
fr: FR-006, FR-007, FR-008, FR-012
ac: AC-004, AC-005
---

## 기능 설명

이미지 URL + 캡션으로 밈을 게시하고, 피드에서 조회하며, 좋아요로 반응하는 공간.
채팅과 별도 탭(Meme Box)으로 운영된다.

## Meme 타입

```ts
type Meme = {
  id: string;            // crypto.randomUUID()
  imageUrl: string;      // 필수 — URL 형식
  caption?: string;      // 선택
  authorNickname: string;
  authorTeamId: string;
  likes: number;         // 초기값 0
  createdAt: string;     // ISO 8601
};
```

## useMemes Hook

```ts
useMemes()
  → { memes: Meme[], addMeme, toggleLike, sortOrder, setSortOrder }
```

- `useState`로 memes 배열 관리 (초기값: mock-data.ts)
- `addMeme`: 새 Meme을 배열 앞에 삽입 (`[newMeme, ...memes]`)
- `toggleLike(id)`: 해당 id의 likes +1 (MVP에서 중복 좋아요 제한 없음)
- `sortOrder`: `'latest'` | `'popular'` (FR-012 Should)

## MemeFeed 레이아웃

```
MemeFeed
  ├─ 상단: 정렬 버튼 ("최신순" | "인기순") + "밈 올리기" 버튼
  ├─ 피드: 2열 카드 그리드
  │    └─ MemeCard × N
  └─ 빈 상태: "아직 올라온 밈이 없습니다. 첫 밈을 올려보세요!"
```

## MemeUploadModal

열기 조건: "밈 올리기" 버튼 클릭
닫기: 게시 완료 후 자동 닫힘 / ESC / 취소 버튼

입력 필드:
- 이미지 URL (필수, `type="url"`)
- 캡션 (선택, `textarea`)

게시 버튼 조건:
- URL이 비어 있거나 `new URL()` 검증 실패 시 `disabled`

게시 플로우:
```
게시 버튼 클릭
  → new URL(imageUrl) 검증 (실패 시 인라인 오류 안내)
  → addMeme({ imageUrl, caption, authorNickname, authorTeamId, likes: 0 })
  → 모달 닫힘
  → 피드 최상단에 즉시 표시
```

## MemeCard 구성

- 이미지 (`<img>`, `onError` → placeholder)
- 캡션 (있을 경우만 표시)
- 하단: 작성자 닉네임 + 팀 로고 + 좋아요 버튼(♥) + 좋아요 수

## 좋아요

- 버튼 클릭 → `toggleLike(meme.id)` → 해당 카드 좋아요 수 즉시 +1
- 취소(토글 다시 클릭) 기능은 MVP에서 제외

## 정렬 (FR-012 — Should)

| 모드 | 정렬 기준 |
|---|---|
| 최신순 (기본) | `createdAt` 내림차순 |
| 인기순 | `likes` 내림차순 |

정렬 변경 시 피드 즉시 갱신.

## Acceptance Criteria

**AC-004 (밈 업로드)**
```
Given  사용자가 유효한 이미지 URL을 입력했을 때
When   게시 버튼을 누르면
Then   해당 밈이 Meme Box 피드 최상단에 표시된다.
```

**AC-005 (좋아요)**
```
Given  Meme Box에 밈이 하나 이상 존재할 때
When   사용자가 좋아요 버튼을 누르면
Then   해당 밈의 좋아요 수가 1 증가하여 즉시 표시된다.
```

## 엣지 케이스

| 케이스 | 처리 |
|---|---|
| 밈 0개 | EmptyState 컴포넌트 표시 |
| 이미지 로드 실패 | `onError` → 회색 placeholder 이미지 |
| URL 형식 오류 | 게시 버튼 disabled + 인라인 안내 |
