---
id: session-3-core-features
section: design
---

## Architecture

```
User (Browser)
  └─ Next.js App Router (/app/page.tsx)
       ├─ OnboardingModal          → localStorage (UserProfile)
       ├─ AppHeader + TabNav       → activeTab state
       ├─ ChatRoom (global/team)   → useChatMessages hook (in-memory)
       ├─ MemeFeed                 → useMemes hook (in-memory)
       ├─ F1101Guide               → static data.ts
       └─ PitWallPage              → static data.ts
```

서버·DB·인증 없음. 모든 상태는 클라이언트에서만 관리한다.

## State 관리

| State | 저장소 | 관리 위치 |
|---|---|---|
| `userProfile` | localStorage | `lib/storage.ts` + OnboardingModal |
| `globalMessages` | 인메모리 | `useChatMessages` hook |
| `teamMessages` | 인메모리 | `useChatMessages` hook |
| `memes` | 인메모리 | `useMemes` hook |
| `activeTab` | 인메모리 | AppPage 컴포넌트 |
| `showOnboarding` | 인메모리 | AppPage 컴포넌트 |

라이브러리 없음. `useState` + `useEffect` + custom hook만 사용.

## UserProfile 저장 흐름

```
온보딩 완료 버튼 클릭
  → saveUserProfile({ nickname, selectedTeamId })
  → localStorage.setItem('paddock-user', JSON.stringify(profile))
  → AppPage state 업데이트
  → OnboardingModal 닫힘
  → 전체 채팅(Main Straight)으로 진입
```

앱 재진입 시:
```
AppPage useEffect
  → getUserProfile()
  → localStorage.getItem('paddock-user')
  → null이면 → OnboardingModal 표시
  → 값이 있으면 → 직접 진입
```

## 채팅 시뮬레이션

실시간 WebSocket 대신 `setInterval` 7초 간격으로 mock 메시지를 자동 추가한다.
탭이 채팅 이외로 이동하면 interval을 clearInterval로 중지한다.

```
useChatMessages(roomType, teamId?)
  → useState: messages[]
  → useEffect: setInterval(addMockMessage, 7000)
  → return { messages, sendMessage }
```

## Meme 업로드 흐름

```
사용자: 이미지 URL + 캡션 입력 → 게시 버튼 클릭
  → URL 유효성 검증 (new URL())
  → useMemes.addMeme({ imageUrl, caption, authorNickname, authorTeamId })
  → setMemes([newMeme, ...memes])
  → MemeUploadModal 닫힘
  → MemeFeed 최상단에 즉시 표시
```

## 검증 규칙

| 규칙 | 위치 | 조건 |
|---|---|---|
| 닉네임 필수 (1~15자) | OnboardingModal, ProfileEditModal | 미입력 시 버튼 disabled |
| 팀 선택 필수 | OnboardingModal | 미선택 시 버튼 disabled |
| 채팅 메시지 필수 | ChatInput | 빈 값 전송 불가 |
| 밈 URL 필수 + 형식 검증 | MemeUploadModal | `new URL()` 기준 |

## 컴포넌트 책임

| 컴포넌트 | 책임 |
|---|---|
| `OnboardingModal` | 닉네임 입력 + 팀 선택 + localStorage 저장 |
| `TeamSelectorGrid` | 10개 팀 카드 선택 UI |
| `ChatRoom` | 메시지 목록 + 입력창 + 전송 (global/team 공용) |
| `ChatBubble` | 개별 메시지 (내 것/상대방, 팀 컬러 틴트) |
| `MemeFeed` | 밈 그리드 + 필터 + 업로드 버튼 |
| `MemeCard` | 개별 밈 (이미지, 캡션, 좋아요) |
| `MemeUploadModal` | URL + 캡션 입력 후 게시 |
| `F1101Guide` | 카테고리 탭 + 카드 그리드 |
| `F1GuideCard` | 인라인 확장/축소 (별도 페이지 없음) |
| `PitWallPage` | 순위 + 일정 레이아웃 |

## 기술 결정 사항

| 결정 | 이유 |
|---|---|
| 인메모리 채팅 (setInterval 시뮬레이션) | WebSocket은 CLAUDE.md "실시간 협업" 경계에 해당 |
| 이미지 URL 방식 밈 | "대용량 파일 업로드" 경계 회피 |
| 정적 data.ts로 F1 101·순위·일정 제공 | "다중 외부 API 연동" 경계 회피 |
| localStorage → UserProfile만 저장 | 민감정보 미저장 원칙 |
| 상태 관리 라이브러리 미사용 | MVP 범위 내에서 useState + custom hook으로 충분 |
