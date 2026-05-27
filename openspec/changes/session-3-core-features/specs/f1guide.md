---
capability: f1guide
fr: FR-009
ac: AC-006
---

## 기능 설명

F1 용어, 경기 방식, 레이스 위켄드 구조를 카드 형식으로 제공하는 정적 가이드.
별도 서버 없이 `features/f1guide/data.ts` 정적 데이터만 사용한다.

## 데이터 타입

```ts
type GuideCategory = 'terminology' | 'race-format' | 'race-weekend';

type F1GuideEntry = {
  id: string;
  category: GuideCategory;
  term: string;       // 카드 제목 (예: "DRS")
  shortDesc: string;  // 카드 한 줄 요약
  fullDesc: string;   // 인라인 확장 시 전체 설명
};
```

## 카테고리

| category | 탭 라벨 | 예시 항목 |
|---|---|---|
| `terminology` | 용어 사전 | DRS, Safety Car, Undercut, MGU-K |
| `race-format` | 경기 방식 | 포인트 시스템, 피트스톱 규칙, 플래그 규칙 |
| `race-weekend` | 레이스 위켄드 | FP1, FP2, FP3, 예선, 결선 순서 |

## F1101Guide 컴포넌트

```
F1101Guide
  ├─ 상단: 카테고리 탭 (용어 사전 / 경기 방식 / 레이스 위켄드)
  └─ 카드 그리드
       └─ F1GuideCard × N (선택 카테고리 필터링)
```

레이아웃: 1열(모바일 < 640px) / 2열(태블릿) / 3열(데스크톱)

## F1GuideCard 동작

- 기본 상태: 카드 제목(`term`) + 한 줄 요약(`shortDesc`) 표시
- 클릭 시: 같은 카드 내에서 `fullDesc`가 인라인으로 펼쳐짐 (별도 페이지 없음)
- 다시 클릭 시: 접힘

```ts
// 컴포넌트 내부
const [expanded, setExpanded] = useState(false);
```

접근성: 카드에 `aria-expanded`, `button` 역할 또는 `<button>` 래퍼 사용.

## Acceptance Criteria (AC-006)

```
Given  사용자가 F1 101 탭에 진입했을 때
When   카테고리 항목(용어 사전 / 경기 방식 등)을 선택하면
Then   해당 카테고리 카드만 표시되고,
       카드를 클릭하면 해당 항목의 상세 설명이 카드 내부에서 인라인으로 펼쳐진다.
```

## 데이터 요건

`features/f1guide/data.ts`에 최소 15개 이상의 항목을 작성한다:
- terminology: 8~10개 (DRS, Undercut, Overcut, Safety Car, VSC, MGU-K, ERS, Parc Fermé 등)
- race-format: 3~5개 (포인트 시스템, 피트스톱, 플래그 종류 등)
- race-weekend: 3~5개 (FP1~FP3, 예선 Q1~Q3, 레이스 당일 등)
