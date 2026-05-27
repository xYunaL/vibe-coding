---
id: session-3-core-features
section: tasks
---

## Tasks

### TASK-001 — 온보딩 동작 연결 (FR-001)
**Spec:** specs/onboarding.md  
**Status:** todo

- [ ] `lib/storage.ts` `saveUserProfile` / `getUserProfile` 구현 (파일 존재, 함수 내용 연결)
- [ ] `OnboardingModal` 닉네임 입력 상태(useState) 연결
- [ ] `TeamSelectorGrid` 팀 선택 상태 연결 (선택 팀 시각적 활성화)
- [ ] 완료 버튼 disabled 조건 (닉네임 비어 있거나 팀 미선택)
- [ ] 완료 버튼 클릭 → `saveUserProfile` → 모달 닫힘 → Main Straight 탭 이동
- [ ] 앱 진입 시 `getUserProfile()` 확인 → null이면 모달 자동 표시
- [ ] 모달 포커스 트랩 (열릴 때 닉네임 input으로 포커스)
- [ ] AC-001 수동 QA 통과 확인

---

### TASK-002 — 전체 채팅 The Main Straight (FR-002, FR-004, FR-005)
**Spec:** specs/chat.md  
**Status:** todo

- [ ] `useChatMessages('global')` hook 구현
  - [ ] messages 상태 초기화 (mock-data.ts)
  - [ ] `sendMessage(text)` → 새 ChatMessage 생성 + 배열 앞 삽입
  - [ ] `setInterval(7000)` mock 메시지 자동 추가
- [ ] `ChatRoom` 컴포넌트에 hook 연결
- [ ] `ChatBubble` — 내 메시지(팀 컬러 틴트, 우측) / 상대 메시지(charcoal, 좌측) 분기
- [ ] `ChatInput` — Enter 키 전송, 빈 값 시 전송 버튼 disabled, 전송 후 입력창 초기화
- [ ] 자동 스크롤 (useRef + scrollIntoView)
- [ ] `LiveIndicator` 펄싱 점 + "● LIVE" 텍스트
- [ ] AC-002 수동 QA 통과 확인

---

### TASK-003 — 팀별 채팅 The Garage (FR-003, FR-004, FR-005)
**Spec:** specs/chat.md  
**Status:** todo

- [ ] `useChatMessages('team', teamId)` hook — teamId 기준 필터링
- [ ] `TeamChatTabs` — 10개 팀 탭 바, 기본: userProfile.selectedTeamId 팀 활성
- [ ] 탭 전환 시 해당 팀 메시지만 표시
- [ ] 메시지 전송 시 현재 선택된 teamId에 저장
- [ ] AC-003 수동 QA 통과 확인 (팀 채팅방 격리)

---

### TASK-004 — 밈 박스 Meme Box (FR-006, FR-007, FR-008)
**Spec:** specs/memes.md  
**Status:** todo

- [ ] `useMemes` hook 구현
  - [ ] memes 상태 초기화 (mock-data.ts)
  - [ ] `addMeme()` — [newMeme, ...memes]
  - [ ] `toggleLike(id)` — likes +1
  - [ ] `sortOrder` 상태 (`'latest'` | `'popular'`)
- [ ] `MemeUploadModal` 구현
  - [ ] imageUrl 입력 필드 (URL 형식 검증)
  - [ ] caption 입력 필드 (선택)
  - [ ] 게시 버튼 disabled 조건 (URL 비어 있거나 형식 오류)
  - [ ] 게시 후 모달 닫힘
- [ ] `MemeCard` 구현
  - [ ] 이미지 + 캡션 + 작성자 + 좋아요 버튼
  - [ ] `onError` → 이미지 placeholder
- [ ] `MemeFeed` 정렬 토글 버튼 + 2열 그리드
- [ ] 밈 0개 시 `EmptyState` 표시
- [ ] AC-004, AC-005 수동 QA 통과 확인

---

### TASK-005 — F1 101 가이드 (FR-009)
**Spec:** specs/f1guide.md  
**Status:** todo

- [ ] `features/f1guide/data.ts` 항목 보강 (최소 15개 — terminology/race-format/race-weekend)
- [ ] `F1101Guide` 카테고리 탭 전환 구현
- [ ] `F1GuideCard` 인라인 확장/축소 (useState expanded)
- [ ] `aria-expanded` 접근성 속성 추가
- [ ] AC-006 수동 QA 통과 확인

---

### TASK-006 — Pit Wall 순위·일정 (FR-010, FR-011)
**Spec:** specs/pitwall.md  
**Status:** todo

- [ ] `features/pitwall/data.ts` 데이터 보강
  - [ ] 2026 시즌 레이스 일정 10라운드 이상 (completed + upcoming 혼재)
  - [ ] 드라이버 순위 상위 10명 이상
  - [ ] 컨스트럭터 순위 10개 팀
- [ ] `DriverStandingsTable` 구현 (1~3위 색상 칩)
- [ ] `ConstructorStandingsGrid` 구현
- [ ] `RaceScheduleList` 구현
  - [ ] 다음 경기 "NEXT" 강조 표시 (현재 날짜 이후 첫 upcoming)
  - [ ] 완료 경기 60% opacity
  - [ ] 알림 벨 → 5초 토스트
- [ ] `PitWallPage` 드라이버/컨스트럭터 서브탭 전환
- [ ] AC-007, AC-008 수동 QA 통과 확인

---

### TASK-007 — 밈 인기순 정렬 (FR-012) [Should]
**Status:** todo

- [ ] `useMemes` sortOrder 상태 토글 ('latest' ↔ 'popular')
- [ ] MemeFeed 정렬 버튼 UI
- [ ] 정렬 변경 시 피드 즉시 갱신

---

### TASK-008 — 프로필 편집 (FR-013) [Nice]
**Status:** todo

- [ ] `ProfileWidget` 클릭 시 `ProfileEditModal` 열기
- [ ] 닉네임 + 팀 변경 입력
- [ ] 저장 → `saveUserProfile` → AppHeader 닉네임 즉시 반영

---

## 구현 순서

```
TASK-001 (온보딩)
  → TASK-002 (전체 채팅)
  → TASK-003 (팀 채팅)
  → TASK-004 (밈 박스)
  → TASK-005 (F1 101)
  → TASK-006 (Pit Wall)
  → [선택] TASK-007, TASK-008
```

온보딩이 완료되어야 채팅에서 userProfile을 사용할 수 있으므로 TASK-001 우선.

## 완료 기준

- FR-001 ~ FR-011 전부 구현
- AC-001 ~ AC-008 브라우저 수동 QA 통과
- `pnpm build` 오류 없음
- TypeScript 컴파일 오류 없음
