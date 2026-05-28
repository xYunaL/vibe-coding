# Technical Design — 패독 코리아 (Paddock Korea)

## 1. 문서 목적

이 문서는 패독 코리아 서비스의 기술 구현 방향을 정리한다.  
제품의 가치나 사용자 문제는 PRODUCT_BRIEF.md에서 다루고, 이 문서에서는 실제 개발자가 구현할 구조를 정의한다.

---

## 2. Architecture Overview

### 전체 구조

```text
User (Browser)
→ Next.js App (App Router)
→ Pages / Routes  (/  |  /app)
→ UI Components   (ui / layout / onboarding)
→ Feature Modules (chat / memes / f1guide / pitwall)
→ Custom Hooks    (useChatMessages / useMemes)
→ Client State    (React useState / Context)
→ Storage         (localStorage — UserProfile only)
→ Static Data     (data.ts — Teams / F1 101 / Pit Wall 폴백)
→ Route Handler   (/api/pitwall → OpenF1, ISR + 폴백)
→ Future Backend  (Server Actions / DB — 4회차 이후)
```

### 이번 MVP의 구현 범위

- 단일 사용자 기준 (로그인 없음)
- 프론트엔드 중심 구현 (Next.js + React)
- 서버 DB 없이 localStorage + 인메모리 State + 정적 데이터 사용
- 인증, 결제, WebSocket 실시간 기능 제외

---

## 3. Tech Stack

| Area | Technology | Reason |
|---|---|---|
| Framework | Next.js (App Router) | 파일 기반 라우팅, 향후 Server Actions 확장 가능 |
| UI Library | React 18 | 컴포넌트 기반 UI 구성 |
| Language | TypeScript | 데이터 구조와 컴포넌트 props 타입 안전성 확보 |
| Styling | Tailwind CSS | DESIGN.md 토큰과 일치하는 빠른 스타일링 |
| Font | Inter / Space Grotesk / JetBrains Mono | DESIGN.md 3폰트 시스템 |
| Icon | lucide-react | 가볍고 Next.js 호환성 우수 |
| AI Coding | Claude Code | 코드 생성, 수정, 리뷰 |
| Version Control | GitHub | 커밋, 브랜치, 실험 비교 |
| Test | Playwright | 4회차 E2E 테스트 자동화 예정 |

---

## 4. Route Design

| Route | File Path | Purpose | Notes |
|---|---|---|---|
| `/` | `src/app/page.tsx` | Landing Page | 서비스 소개, 문제 제시, 기능 소개, CTA |
| `/app` | `src/app/app/page.tsx` | Main App Page | 온보딩 + 탭 기반 전체 기능 화면 |

---

## 5. Source Structure

```text
src/
  app/
    layout.tsx                    ← 전역 레이아웃 (폰트, 메타데이터)
    page.tsx                      ← Landing Page
    app/
      page.tsx                    ← App Shell (탭 네비게이션 + 기능 라우팅)

  components/
    ui/
      Button.tsx                  ← Primary / Secondary / Ghost 버튼
      Input.tsx                   ← 텍스트 입력 필드
      Card.tsx                    ← 기본 카드 컨테이너
      Modal.tsx                   ← 모달 오버레이 + 카드
      Badge.tsx                   ← Monospace 배지 태그
      EmptyState.tsx              ← 콘텐츠 없음 안내
    layout/
      AppHeader.tsx               ← 상단 고정 내비게이션
      ProfileWidget.tsx           ← 팀 로고 + 닉네임 프로필 위젯
      ProfileEditModal.tsx        ← 닉네임·팀 변경 모달
    onboarding/
      OnboardingModal.tsx         ← 첫 진입 온보딩 오버레이
      TeamSelectorGrid.tsx        ← 11개 팀 + 가상 옵션("none"·"all") 선택 그리드

  features/
    chat/
      types.ts                    ← ChatMessage 타입 정의
      mock-data.ts                ← 초기 시뮬레이션 메시지 데이터
      hooks/
        useChatMessages.ts        ← 채팅 상태 + setInterval 시뮬레이터
      components/
        ChatRoom.tsx              ← 채팅 메시지 목록 + 입력 폼
        ChatBubble.tsx            ← 개별 메시지 버블 (내 것 / 상대방)
        ChatInput.tsx             ← 메시지 입력창 + 전송 버튼
        LiveIndicator.tsx         ← 펄싱 레드 점 + LIVE 상태 표시
        TeamChatTabs.tsx          ← The Garage 팀 선택 탭 바 (11개 팀, 내 팀 표시 + 타팀 열람)

    memes/
      types.ts                    ← Meme 타입 정의
      mock-data.ts                ← 초기 밈 샘플 데이터
      hooks/
        useMemes.ts               ← 밈 목록 상태 + 좋아요 로직
      components/
        MemeFeed.tsx              ← 밈 그리드 + 카테고리 필터
        MemeCard.tsx              ← 개별 밈 카드
        MemeUploadModal.tsx       ← 밈 업로드 입력 모달
        MemeFilterBar.tsx         ← 카테고리 필터 칩 바

    f1guide/
      types.ts                    ← F1GuideEntry 타입 정의
      data.ts                     ← F1 101 정적 데이터 (용어·경기방식·위켄드)
      components/
        F1101Guide.tsx            ← 카테고리 탭 + 카드 그리드 컨테이너
        F1GuideCard.tsx           ← 개별 가이드 카드 (인라인 확장)

    pitwall/
      types.ts                    ← DriverStanding, ConstructorStanding, RaceSchedule 타입
      data.ts                     ← Pit Wall 정적 폴백 (순위·일정), OpenF1 실패 시 사용
      openf1.ts                   ← OpenF1 fetch·정규화 (서버 전용)
      components/
        PitWallPage.tsx           ← 순위 + 일정 레이아웃 컨테이너
        DriverStandingsTable.tsx  ← 드라이버 챔피언십 테이블
        ConstructorStandingsGrid.tsx ← 컨스트럭터 카드 그리드
        RaceScheduleList.tsx      ← KST 경기 일정 목록

  lib/
    storage.ts                    ← localStorage 헬퍼 (getUserProfile, saveUserProfile)
    utils.ts                      ← KST 시간 변환, UUID 생성 등 공용 유틸
    teams.ts                      ← 11개 팀 정적 데이터 (id, name, fullName, baseColor, logo, drivers) + 권한 헬퍼
```

### 폴더 역할

| Folder | Role |
|---|---|
| `src/app` | Next.js App Router route와 page 관리 |
| `src/components/ui` | 재사용 가능한 기본 UI 컴포넌트 (디자인 시스템 구현체) |
| `src/components/layout` | 헤더·프로필 등 레이아웃 컴포넌트 |
| `src/components/onboarding` | 온보딩 플로우 전용 컴포넌트 |
| `src/features/*` | 기능별 독립 모듈 (타입·데이터·훅·컴포넌트 일괄 관리) |
| `src/lib` | 공용 유틸리티, localStorage 헬퍼, 정적 팀 데이터 |

---

## 6. Feature Module Design

### 핵심 Feature

| Feature | Description | FR | Priority |
|---|---|---|---|
| 온보딩 (닉네임 + 팀 선택) | 첫 진입 시 닉네임·팀 설정 | FR-001 | Must |
| 전체 채팅 (The Main Straight) | 모든 팬 실시간 채팅 | FR-002, FR-004, FR-005 | Must |
| 팀별 채팅 (The Garage) | 선택 팀 전용 채팅방 | FR-003, FR-004, FR-005 | Must |
| 밈 업로드 (Meme Box) | 이미지 URL + 캡션으로 밈 게시 | FR-006 | Must |
| 밈 피드 조회 | 최신순 밈 목록 표시 | FR-007 | Must |
| 밈 좋아요 | 밈에 좋아요 반응 | FR-008 | Must |
| F1 입문 가이드 (F1 101) | 용어·경기방식 카드 조회 | FR-009 | Must |
| 경기 일정 (KST) | KST 기준 레이스 위켄드 목록 | FR-010 | Must |
| 챔피언십 순위 (Pit Wall) | 드라이버·컨스트럭터 순위 | FR-011 | Must |
| 밈 인기순 정렬 | 좋아요 수 기준 정렬 | FR-012 | Should |
| 닉네임·팀 변경 | 설정에서 프로필 수정 | FR-013 | Nice |

### 이번 회차(2~3회차)에서 구현할 Feature

- 프로젝트 구조 + 타입 정의 + 정적 데이터
- Landing Page 초안
- 온보딩 모달
- App Shell + 탭 네비게이션
- The Main Straight (전체 채팅)
- The Garage (팀별 채팅)
- Meme Box (업로드 + 피드 + 좋아요)
- F1 101 가이드
- Pit Wall (순위표 + 경기 일정)

### 다음 회차(4회차)로 넘길 Feature

- Playwright E2E 테스트 (AC-001~AC-008)
- 배포 준비 (Vercel)
- FR-012 밈 인기순 정렬 (Should)
- FR-013 닉네임·팀 변경 (Nice)

---

## 7. Data Model

### 기본 타입

```ts
// lib/types.ts
// 응원 팀을 정하지 않은("none") / 모든 팀을 응원하는("all") 가상 식별자
export type SpecialTeamId = 'none' | 'all';

export type UserProfile = {
  nickname: string;                          // 1–15자, localStorage 저장
  selectedTeamId: Team['id'] | SpecialTeamId; // 11개 팀 ID 중 하나, 또는 가상 옵션
};

// features/chat/types.ts
export type RoomType = 'global' | 'team';

export type ChatMessage = {
  id: string;
  roomType: RoomType;
  teamId?: string;        // roomType === 'team' 일 때만 존재
  nickname: string;
  teamColor: string;      // Team.baseColor (hex)
  text: string;
  timestamp: string;      // HH:MM:SS
};

// features/memes/types.ts
export type Meme = {
  id: string;
  imageUrl: string;       // 필수 — URL 형식
  caption?: string;       // 선택
  authorNickname: string;
  authorTeamId: string;
  likes: number;
  createdAt: string;      // ISO 8601
};

// lib/teams.ts  — 2026 시즌 11개 팀
export type Team = {
  id: string;
  name: string;                        // e.g. "Ferrari"
  fullName: string;                    // e.g. "Scuderia Ferrari HP"
  baseColor: string;                   // hex, e.g. "#DC0000"
  logo: string;                        // emoji
  drivers: readonly [string, string];  // 드라이버 2명 "한글 (English)"
};

// 작성 권한 헬퍼 (lib/teams.ts)
//   canPostInTeamChat(profile, teamId):
//     selectedTeamId === teamId  → true (자기 팀)
//     selectedTeamId === 'all'   → true (올팬, 모든 팀)
//     selectedTeamId === 'none'  → false (열람만)
//   isRealTeam(id) / SPECIAL_TEAM_IDS / defaultGarageTeamId(profile)

// features/f1guide/types.ts
export type GuideCategory = 'terminology' | 'race-format' | 'race-weekend';

export type F1GuideEntry = {
  id: string;
  category: GuideCategory;
  term: string;
  shortDesc: string;
  fullDesc: string;
};

// features/pitwall/types.ts
export type RaceSchedule = {
  round: number;
  grandPrix: string;
  dateKST: string;        // 'YYYY-MM-DD HH:MM KST'
  status: 'upcoming' | 'completed';
};

export type DriverStanding = {
  rank: number;
  name: string;
  code: string;           // e.g. "VER"
  teamId: string;
  points: number;
};

export type ConstructorStanding = {
  rank: number;
  teamId: string;
  name: string;
  points: number;
};
```

### UserProfile 필드

| Field | Type | Required | Description |
|---|---|---|---|
| `nickname` | `string` | Yes | 화면에 표시되는 닉네임 (1–15자) |
| `selectedTeamId` | `Team['id'] \| SpecialTeamId` | Yes | 11개 팀 ID 중 하나, 또는 `'none'`(응원 팀 없음)·`'all'`(올팬) |

### ChatMessage 추가 필드

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | 고유 ID (crypto.randomUUID 또는 Date.now()) |
| `roomType` | `'global' \| 'team'` | Yes | 전체 채팅 또는 팀 채팅 구분 |
| `teamId` | `string` | 팀 채팅 시 Yes | 팀 채팅방 필터링 기준 |
| `teamColor` | `string` | Yes | 채팅 버블 팀 컬러 틴트용 hex |
| `timestamp` | `string` | Yes | HH:MM:SS 형식 |

### Meme 추가 필드

| Field | Type | Required | Description |
|---|---|---|---|
| `imageUrl` | `string` | Yes | 이미지 URL (URL 형식 검증) |
| `caption` | `string` | No | 밈 캡션 텍스트 |
| `likes` | `number` | Yes | 좋아요 수 (초기값 0) |
| `createdAt` | `string` | Yes | 정렬 기준 시각 |

---

## 8. State Design

| State | Type | 저장소 | 관리 위치 |
|---|---|---|---|
| `userProfile` | `UserProfile \| null` | localStorage | `lib/storage.ts` + OnboardingModal |
| `globalMessages` | `ChatMessage[]` | 인메모리 | `useChatMessages` hook |
| `teamMessages` | `Record<string, ChatMessage[]>` | 인메모리 | `useChatMessages` hook |
| `memes` | `Meme[]` | 인메모리 | `useMemes` hook |
| `memeFilter` | `string` | 인메모리 | `MemeFeed` 컴포넌트 |
| `activeTab` | `string` | 인메모리 | `AppPage` 컴포넌트 |
| `showOnboarding` | `boolean` | 인메모리 | `AppPage` 컴포넌트 |
| `showProfileEdit` | `boolean` | 인메모리 | `AppHeader` / `ProfileWidget` |
| `showMemeUpload` | `boolean` | 인메모리 | `MemeFeed` 컴포넌트 |

### 상태 관리 방식

이번 MVP에서는 별도 상태 관리 라이브러리를 사용하지 않는다.

- React `useState` — 컴포넌트 로컬 상태
- React `useEffect` — 채팅 시뮬레이터 setInterval, 자동 스크롤
- React `useRef` — 채팅 스크롤 하단 참조
- `useChatMessages` / `useMemes` — 기능별 커스텀 훅으로 로직 분리
- `lib/storage.ts` — localStorage 헬퍼 함수 (getUserProfile, saveUserProfile)

---

## 9. Storage Strategy

### 1차 MVP

| Option | Decision |
|---|---|
| DB | 사용하지 않음 |
| API Server | 사용하지 않음 |
| localStorage | UserProfile 전용 저장소 (nickname + selectedTeamId) |
| 인메모리 State | 채팅 메시지, 밈 피드 (새로고침 시 초기화) |
| 정적 data.ts | F1 101 가이드, 팀/드라이버 라인업 + Pit Wall 폴백 데이터 |
| 외부 API (OpenF1) | Pit Wall 드라이버·컨스트럭터 순위 + 경기 일정 (`/api/pitwall` Route Handler, ISR + 폴백) |

### 저장 흐름

```text
[온보딩 완료]
User Action (닉네임 + 팀 선택)
→ saveUserProfile(profile) — lib/storage.ts
→ localStorage.setItem('paddock-user', JSON.stringify(profile))
→ React State 업데이트 → UI 반영

[채팅 메시지]
User Action (메시지 전송)
→ useChatMessages hook → setState 업데이트 → ChatRoom 리렌더

[밈 게시]
User Action (밈 업로드 완료)
→ useMemes hook → setMemes([newMeme, ...memes]) → MemeFeed 리렌더
```

### 향후 확장 가능성

- Supabase 또는 Firebase Realtime Database 연동으로 채팅 영속성 확보
- 사용자 인증 (Supabase Auth 또는 NextAuth)
- Next.js Server Actions로 밈 데이터 영속 저장
- API Route 도입 후 백엔드 분리

---

## 10. API Design

### 구현된 Route Handler

| Route | Method | Purpose |
|---|---|---|
| `/api/pitwall` | `GET` | OpenF1(https://openf1.org)에서 드라이버·컨스트럭터 순위 + 2026 경기 일정을 서버에서 집계해 반환. ISR(`revalidate=3600`)로 캐싱하며, OpenF1 호출 실패 시 정적 `features/pitwall/data.ts`로 폴백한다. 응답에 `source: "openf1" \| "fallback"` 포함. |

> OpenF1 호출은 free tier rate limit(3 req/s)를 피하기 위해 **순차** 호출한다. 드라이버 헤드샷(`headshot_url`)·`team_name`은 `championship_*` 응답과 `drivers` 엔드포인트를 `driver_number`로 조인해 정규화하며, `team_name`은 `TEAM_NAME_TO_ID`로 내부 teamId에 매핑한다.

채팅·밈·프로필·F1 101은 여전히 서버 API 없이 클라이언트 State + localStorage + 정적 data.ts로 동작한다.

### 향후 확장 시 API 후보

| API | Method | Purpose |
|---|---|---|
| `/api/chat/global` | `GET` | 전체 채팅 메시지 목록 |
| `/api/chat/team/:teamId` | `GET` | 팀별 채팅 메시지 목록 |
| `/api/chat` | `POST` | 메시지 전송 |
| `/api/memes` | `GET` | 밈 피드 목록 |
| `/api/memes` | `POST` | 밈 게시 |
| `/api/memes/:id/like` | `PATCH` | 좋아요 토글 |
| `/api/profile` | `PUT` | 닉네임·팀 업데이트 |

### 이번 회차 결정

- Pit Wall 순위·일정만 단일 외부 API(OpenF1) 도입 — Route Handler + ISR + 정적 폴백
- 서버 DB 없음
- 채팅·밈·프로필·F1 101은 클라이언트 State + localStorage + 정적 data.ts 중심

---

## 11. Validation Rules

| Rule | Description | 적용 위치 |
|---|---|---|
| 닉네임 필수 | 비어 있으면 완료 버튼 비활성화 | OnboardingModal, ProfileEditModal |
| 닉네임 길이 | 1–15자 이내 | OnboardingModal, ProfileEditModal |
| 팀 선택 필수 | 실제 팀 또는 가상 옵션("none"·"all") 중 하나 선택 전 완료 버튼 비활성화 | OnboardingModal |
| 팀 채팅 작성 권한 | `canPostInTeamChat(profile, teamId)` false면 입력창 잠금 + 읽기 전용 배지 | ChatRoom (The Garage) |
| 채팅 메시지 필수 | 빈 메시지 전송 불가 (전송 버튼 비활성화) | ChatInput |
| 밈 이미지 URL 필수 | URL 비어 있으면 게시 버튼 비활성화 | MemeUploadModal |
| 밈 URL 형식 | URL 형식 검증 (`new URL()` 또는 정규식) | MemeUploadModal |
| 유효 팀 ID | 11개 팀 또는 가상 옵션이어야 함. 알 수 없는 값이면 `getUserProfile`이 null 반환 → 온보딩 재실행 | TeamSelectorGrid, storage.ts |
| 민감 정보 미저장 | localStorage에 민감 개인정보 저장 금지 | lib/storage.ts |

---

## 12. Error Handling

| Situation | Handling |
|---|---|
| 닉네임 미입력 | 완료/저장 버튼 비활성화 |
| 팀 미선택 | 완료 버튼 비활성화 |
| 채팅 메시지 빈 값 | 전송 버튼 비활성화 |
| 밈 URL 빈 값 또는 형식 오류 | 게시 버튼 비활성화 또는 인라인 오류 안내 |
| localStorage 읽기 실패 | null 반환 → OnboardingModal 표시 |
| 채팅 메시지 없음 | 초기 시뮬레이션 메시지로 채움 |
| 밈 피드 없음 | `EmptyState` 컴포넌트 표시 |
| 이미지 로드 실패 | `<img onError>` → placeholder 표시 |
| 잘못된 팀 ID | teams.ts에서 fallback 팀(첫 번째) 사용 |

---

## 13. Accessibility Considerations

- 모든 입력 필드에는 `<label htmlFor>` 또는 `aria-label`이 있어야 한다.
- 버튼 텍스트는 기능을 설명해야 한다 (예: "전송", "밈 게시", "팀 선택 완료").
- 팀 구분은 색상과 팀명 텍스트를 함께 표기한다. 색상만으로 구분하지 않는다.
- 라이브 상태는 `animate-ping` 점 외에 "● LIVE" 텍스트를 병행 표기한다.
- 채팅 버블에는 발신자 닉네임과 팀명이 텍스트로 포함되어야 한다.
- 주요 영역은 `<h1>`–`<h3>` heading 구조를 가진다.
- 모달은 열릴 때 내부로 포커스가 이동하고, 닫힐 때 트리거 버튼으로 복귀한다.
- 필터 칩의 활성 상태는 색상 외에 `aria-pressed` 또는 `aria-selected`로도 표현한다.
- 키보드 `Enter`로 메시지 전송이 가능해야 한다.

---

## 14. Security Considerations

이번 MVP에서 지킬 보안 원칙:

- API key 및 시크릿을 코드에 넣지 않는다.
- `.env` 파일을 `.gitignore`에 등록하고 GitHub에 올리지 않는다.
- localStorage에는 닉네임과 팀 ID만 저장한다 (비밀번호·개인정보 저장 금지).
- 인증이 필요한 기능은 이번 MVP에서 제외한다.
- 외부 이미지 URL은 Next.js `next.config.js`의 `images.remotePatterns`로 도메인을 제한한다.
- XSS 방지를 위해 채팅 메시지와 밈 캡션은 React의 기본 이스케이핑에 의존하며, `dangerouslySetInnerHTML`을 사용하지 않는다.

---

## 15. Decision Log

| Decision | Reason | Consequence |
|---|---|---|
| Next.js App Router 사용 | 수업 방향 및 향후 Server Actions 확장 적합 | `src/app` 기준 파일 라우팅 |
| TypeScript 사용 | 데이터 구조와 컴포넌트 props 명확화 | 초기 타입 작성 비용 발생 |
| 인메모리 채팅 (setInterval 시뮬레이션) | WebSocket은 CLAUDE.md "실시간 협업" 경계에 해당 | 새로고침 시 채팅 초기화 |
| 이미지 URL 방식 밈 | "대용량 파일 업로드" 경계 회피 | 사용자가 이미지 URL을 직접 입력해야 함 |
| 정적 data.ts로 F1 101 제공 | 교육 콘텐츠라 외부 API 불필요 | 수동 작성·갱신 |
| Pit Wall 순위·일정만 OpenF1 단일 API 도입 (개정) | 실제 2026 시즌 순위·일정·드라이버 사진 제공. **단일** API라 "다중 외부 API 연동" 경계에 해당하지 않음. 서버 Route Handler + ISR 캐싱 + 정적 폴백으로 위험 최소화 | 외부 의존성 추가(폴백으로 완화), team_name·driver_number 매핑 유지보수 |
| localStorage → UserProfile만 저장 | 단일 사용자 MVP, 민감정보 미저장 원칙 | 다중 사용자·기기 간 동기화 없음 |
| 상태 관리 라이브러리 미사용 | useState + 커스텀 훅으로 MVP 범위 충분 | 기능 확장 시 Context API 또는 Zustand 도입 검토 |
| lucide-react 아이콘 | 참조 구현체와 동일, Tree-shaking 우수 | 별도 아이콘 시스템 추가 금지 |

---

## 16. Implementation Notes

Claude Code는 각 회차에서 아래 순서를 따른다.

**2회차 — 프로젝트 셋업 + Landing Page**

1. `src/` 폴더 구조 생성 (빈 파일 placeholder 포함)
2. `lib/teams.ts` 정적 팀 데이터 작성
3. `tailwind.config.ts`에 DESIGN.md 컬러 토큰 등록
4. `src/app/layout.tsx` 폰트(Inter, Space Grotesk, JetBrains Mono) 설정
5. Landing Page 구현 (Hero, Problem, Core Features, CTA)
6. `npm run build`로 빌드 검증

**3회차 — App Shell + 핵심 기능**

1. 타입 정의 파일 작성 (features/*/types.ts)
2. 정적 데이터 작성 (f1guide/data.ts, pitwall/data.ts)
3. `lib/storage.ts` localStorage 헬퍼 구현
4. `OnboardingModal` + `TeamSelectorGrid` 구현
5. `AppHeader` + 탭 네비게이션 구현
6. `useChatMessages` hook → ChatRoom 구현 (전체 + 팀)
7. `useMemes` hook → MemeFeed + MemeUploadModal 구현
8. `F1101Guide` + `F1GuideCard` 구현
9. `PitWallPage` (DriverStandingsTable + ConstructorStandingsGrid + RaceScheduleList) 구현
10. 브라우저에서 전체 흐름 수동 확인

**4회차 — 테스트 + 배포**

1. Playwright 설치 및 설정
2. AC-001~AC-008 기준 E2E 테스트 작성
3. `npm run test:e2e`로 검증
4. Vercel 배포 설정 및 `vercel deploy`

---

## 17. Open Questions

| Question | Decision Needed By | 현재 가정 |
|---|---|---|
| 채팅 메시지를 새로고침 후에도 유지할 것인가? | 3회차 시작 전 | 인메모리 (새로고침 시 초기화) |
| 밈 URL 유효성 검증 수준은? | 3회차 중 | `new URL()` 기본 형식 검증만 |
| setInterval 시뮬레이터 주기는? | 3회차 중 | 7초 간격 (참조 구현체 기준) |
| Pit Wall 데이터 출처는? | ✅ 확정 | OpenF1 API(2026 시즌) `/api/pitwall` 경유, 실패 시 정적 폴백 |
| 팀 수는 몇 개인가? | ✅ 확정 (change: expand-team-roster-and-cross-team-chat) | 2026 시즌 11개 팀 (Audi·Cadillac 진입, Sauber·VCARB 대체) |
| 배포 플랫폼은 Vercel인가? | 4회차 시작 전 | Vercel (Next.js 공식 플랫폼) |
