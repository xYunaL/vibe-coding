---
capability: onboarding
fr: FR-001
ac: AC-001
---

## 기능 설명

사용자가 처음 앱에 진입할 때 닉네임과 응원 팀을 설정하는 온보딩 플로우.
설정 값은 localStorage에 저장되어 이후 재진입 시 온보딩을 건너뛴다.

## 요구사항

### 온보딩 진입 조건

- `localStorage`에 `paddock-user` 키가 없으면 OnboardingModal을 표시한다.
- 이미 값이 있으면 모달 없이 앱 메인 화면(전체 채팅)으로 바로 진입한다.

### 닉네임 입력

- 입력 필드: `type="text"`, 최대 15자 (`maxLength={15}`)
- 라벨: `"Nickname"` (label 또는 aria-label)
- 빈 값이거나 공백만 있으면 완료 버튼이 `disabled` 상태가 된다.

### 팀 선택

- 10개 팀(lib/teams.ts 기준)을 그리드로 표시한다.
- 팀 카드: 팀 로고(emoji) + 팀 약칭(name)
- 선택된 팀은 시각적으로 활성 상태를 표시한다 (팀 baseColor 보더 또는 배경 틴트).
- 팀이 선택되지 않은 상태에서도 완료 버튼이 `disabled`가 된다.

### 완료 조건

닉네임(1자 이상) + 팀 선택이 모두 완료된 경우에만 완료 버튼이 활성화된다.

### 저장 플로우

```
완료 버튼 클릭
  → saveUserProfile({ nickname: nickname.trim(), selectedTeamId })
  → localStorage.setItem('paddock-user', JSON.stringify(profile))
  → OnboardingModal 닫힘
  → 전체 채팅(Main Straight) 탭으로 자동 이동
```

### 모달 접근성

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` 설정
- 모달이 열릴 때 닉네임 입력 필드로 포커스 이동

## Acceptance Criteria (AC-001)

```
Given  사용자가 처음 앱에 진입하여 localStorage에 설정 정보가 없는 상태일 때
When   닉네임을 입력하고 팀을 선택한 후 완료 버튼을 누르면
Then   설정이 localStorage에 저장되고 메인 채팅 화면으로 이동한다.
```

## 엣지 케이스

| 케이스 | 처리 |
|---|---|
| 닉네임 미입력 | 완료 버튼 disabled |
| 팀 미선택 | 완료 버튼 disabled |
| 닉네임 공백만 | trim() 후 빈 문자열이므로 disabled |
| localStorage 읽기 실패 | null 반환 → 온보딩 표시 |
| 잘못된 teamId (localStorage 훼손) | teams.ts에서 fallback: 첫 번째 팀 사용 |
