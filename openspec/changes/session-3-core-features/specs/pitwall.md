---
capability: pitwall
fr: FR-010, FR-011
ac: AC-007, AC-008
---

## 기능 설명

2026 시즌 드라이버·컨스트럭터 챔피언십 순위와 KST 기준 레이스 위켄드 일정을
정적 데이터로 표시하는 화면. 서버 없이 `features/pitwall/data.ts`만 사용한다.

## 데이터 타입

```ts
type RaceSchedule = {
  round: number;
  grandPrix: string;       // 예: "일본 그랑프리"
  circuit: string;         // 예: "스즈카 서킷"
  dateKST: string;         // 'YYYY-MM-DD HH:mm KST'
  status: 'upcoming' | 'completed';
};

type DriverStanding = {
  rank: number;
  name: string;
  code: string;            // 예: "NOR"
  teamId: string;
  points: number;
};

type ConstructorStanding = {
  rank: number;
  teamId: string;
  name: string;
  points: number;
};
```

## PitWallPage 레이아웃

```
PitWallPage
  ├─ 좌(데스크톱) / 상단(모바일): 순위표 영역
  │    ├─ 서브탭: 드라이버 순위 | 컨스트럭터 순위
  │    ├─ DriverStandingsTable  (드라이버 탭 선택 시)
  │    └─ ConstructorStandingsGrid (컨스트럭터 탭 선택 시)
  └─ 우(데스크톱) / 하단(모바일): 경기 일정
       └─ RaceScheduleList
```

## 드라이버 순위 테이블 (DriverStandingsTable)

| 열 | 내용 |
|---|---|
| 순위 | 숫자 칩 (1~3위 → Gold/Silver/Bronze 색상) |
| 코드 | 3자 드라이버 코드 (예: NOR) |
| 이름 | 드라이버 전체 이름 |
| 팀 | 팀 baseColor 점 + 팀명 |
| 포인트 | 숫자 |

## 컨스트럭터 순위 그리드 (ConstructorStandingsGrid)

- 2열 카드 그리드
- 각 카드: 팀 baseColor 상단 라인 + 순위 + 팀명 + 포인트

## 경기 일정 (RaceScheduleList)

- 전체 시즌 일정 목록 (정렬: round 오름차순)
- `status === 'completed'` 항목: 60% opacity (지나간 경기)
- `status === 'upcoming'` 항목: 풀 opacity
- **다음 경기 강조**: 현재 날짜 이후 첫 번째 `upcoming` 항목에 F1 Red 배경 뱃지 + "NEXT" 라벨
- 알림 벨 버튼: 클릭 시 "알림 설정 완료" 토스트를 5초 표시 후 사라짐 (localStorage 연동 없음)

## 날짜 표시 규칙

- `dateKST` 문자열을 파싱하여 화면에 `MM월 DD일 (요일) HH:mm KST` 형식으로 표시
- `lib/utils.ts`의 `formatKST()` 유틸 함수 사용 (이미 존재)

## 데이터 요건

`features/pitwall/data.ts`에:
- 2026 시즌 레이스 일정 최소 10라운드 이상
- 현재 날짜(2026-05-27) 기준 일부는 `completed`, 일부는 `upcoming`
- 드라이버 순위: 상위 10명 이상
- 컨스트럭터 순위: 10개 팀 전부

## Acceptance Criteria

**AC-007 (경기 일정)**
```
Given  사용자가 경기 일정 화면에 진입했을 때
When   화면이 로드되면
Then   다가오는 레이스 위켄드 일정이 KST 기준 날짜·시간과 함께 표시되며,
       가장 가까운 일정이 상단에 "NEXT" 강조 표시된다.
```

**AC-008 (챔피언십 순위)**
```
Given  사용자가 Pit Wall 탭에 진입했을 때
When   드라이버 또는 컨스트럭터 탭을 선택하면
Then   현재 시즌 순위, 이름, 포인트가 정렬된 목록으로 표시된다.
```
