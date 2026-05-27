---
capability: chat
fr: FR-002, FR-003, FR-004, FR-005
ac: AC-002, AC-003
---

## 기능 설명

전체 채팅(The Main Straight)과 팀별 채팅(The Garage) 두 채팅방.
공통 ChatRoom 컴포넌트를 `roomType` prop으로 구분하여 재사용한다.

## 공통 채팅 구조

```
ChatRoom
  ├─ 상단: LiveIndicator (펄싱 레드 점 + "● LIVE" 텍스트)
  ├─ 중앙: 메시지 스크롤 영역
  │    ├─ ChatBubble (내 메시지 — 팀 컬러 틴트, 우측 정렬)
  │    └─ ChatBubble (상대 메시지 — charcoal, 좌측 정렬)
  └─ 하단: ChatInput (입력창 + 전송 버튼)
```

## useChatMessages Hook

```ts
useChatMessages(roomType: 'global' | 'team', teamId?: string)
  → { messages: ChatMessage[], sendMessage: (text: string) => void }
```

- `useState`로 messages 배열 관리
- `useEffect`로 setInterval(7초) 자동 mock 메시지 추가
- 채팅 탭 이외로 이동하면 clearInterval (탭 변경 시 roomType prop 변경으로 자연스럽게 해결)
- `teamId`가 있으면 해당 팀 메시지만 필터링

## ChatMessage 타입

```ts
type ChatMessage = {
  id: string;            // crypto.randomUUID()
  roomType: 'global' | 'team';
  teamId?: string;       // team 채팅방만
  nickname: string;
  teamColor: string;     // hex (Team.baseColor)
  text: string;
  timestamp: string;     // 'HH:MM'
};
```

## 메시지 전송 (sendMessage)

```
사용자가 입력창에 텍스트 입력 후 전송 버튼 클릭 (또는 Enter 키)
  → 입력값 trim() → 빈 문자열이면 아무 동작 없음
  → 새 ChatMessage 생성 (userProfile.nickname, 팀 컬러, 현재 시각)
  → messages 배열 앞에 추가 (최신 메시지가 하단에 표시되도록)
  → 입력창 초기화
  → 스크롤 최하단으로 자동 이동 (useRef + scrollIntoView)
```

## ChatBubble 표시 규칙

| 조건 | 스타일 |
|---|---|
| `nickname === userProfile.nickname` | 팀 baseColor 틴트 배경, 우측 정렬 |
| 그 외 | charcoal-700 배경, 좌측 정렬 + 팀 로고 아바타 |

모든 버블에 닉네임 + 팀명 텍스트가 표시된다 (색상만으로 구분하지 않음 — NFR-002).

## The Garage 추가 사항

- 상단에 팀 선택 탭 바(`TeamChatTabs`)를 추가한다.
- 기본: `userProfile.selectedTeamId` 팀 채팅방이 활성화된다.
- 다른 팀 탭을 선택하면 해당 팀 채팅방 메시지로 전환된다.
- 메시지 전송은 현재 선택된 팀 채팅방에만 저장된다.

## 입력 규칙

- 빈 메시지 전송 불가: 입력창이 비어 있으면 전송 버튼 `disabled`
- `Enter` 키로 전송 가능 (`onKeyDown` 핸들러)
- 전송 후 입력창 초기화

## 자동 스크롤

- `useRef`로 스크롤 컨테이너 하단 참조
- 새 메시지 추가 시 `useEffect`로 `scrollIntoView({ behavior: 'smooth' })`

## 빈 상태

메시지가 없으면 mock-data.ts의 초기 메시지로 채운다 (빈 화면 방지).
실제 빈 상태는 "아직 대화가 없습니다. 첫 메시지를 보내보세요!" 안내.

## Acceptance Criteria

**AC-002 (전체 채팅)**
```
Given  온보딩이 완료된 사용자가 The Main Straight 탭에 있을 때
When   메시지를 입력하고 전송 버튼을 누르면
Then   해당 메시지가 닉네임·팀 색상과 함께 채팅창에 즉시 표시된다.
```

**AC-003 (팀 채팅)**
```
Given  온보딩이 완료된 사용자가 The Garage 탭에 있을 때
When   메시지를 입력하고 전송 버튼을 누르면
Then   해당 메시지가 팀 전용 채팅방에만 표시된다.
```
