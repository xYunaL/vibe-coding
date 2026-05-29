# Security Review — 패독 코리아 (Paddock Korea)

- 점검일: 2026-05-29
- 범위: `openspec/` change 문서, `src/`, `package.json`, `README.md`
- 대상 빌드: 채팅(전체)·게시판(전체/팀별)·밈·F1 101·Pit Wall(OpenF1)·홈(응원/랭킹) 포함 MVP
- 결론: **공격 표면이 작고 전반적으로 양호.** 서버/DB/인증/시크릿이 없고 사용자 입력은 React가 자동 이스케이프한다. 배포 전 **보안 응답 헤더 추가**만 권장(High 아님).

---

## 1. 요약 (위험도)

| # | 점검 항목 | 결과 | 위험도 |
|---|---|---|---|
| 1 | 민감 정보 노출 (시크릿/키/env) | 시크릿·env 없음, OpenF1 무인증 | 🟢 양호 |
| 2 | localStorage 저장 정보 | 닉네임·팀·응원 카운트만 (비밀정보 없음) | 🟢 양호 |
| 3 | XSS | `dangerouslySetInnerHTML` 미사용, JSX 자동 이스케이프 | 🟢 양호 |
| 4 | 외부 링크 보안 속성 | 외부 `<a target=_blank>` 없음 | 🟢 해당 없음 |
| 5 | `dangerouslySetInnerHTML` | 미사용 | 🟢 양호 |
| 6 | 배포 전 설정 | **보안 응답 헤더 미설정** | 🟡 권장 |
| 7 | 밈/외부 이미지 `<img src>` | http/https URL만 허용, 출처 제한 없음 | 🟡 경미 |

---

## 2. 항목별 상세

### 2.1 민감 정보 노출 — 🟢 양호
- `src/` 전체에서 `process.env`, `secret`, `api_key`, `token`, `password` **검출 0건**.
- OpenF1 API(`src/features/pitwall/openf1.ts`)는 **인증 키가 필요 없는** 공개 엔드포인트만 호출 → 노출할 키 자체가 없음.
- `.env*` 파일 없음, `.gitignore`에 `.env*` 포함되어 향후 키 추가 시에도 커밋 차단됨.
- OpenSpec change 문서에도 민감정보 없음.

### 2.2 localStorage 저장 정보 — 🟢 양호
저장 키 (`src/lib/storage.ts`):
| 키 | 내용 | 평가 |
|---|---|---|
| `paddock-korea:user-profile` | `{ nickname, selectedTeamId }` | 공개 표시용 닉네임·팀. 비밀번호/토큰/실명/연락처 아님 |
| `paddock-korea:cheer` | `{ myCheers, lastCheerDate }` | 응원 카운트·날짜. 민감성 없음 |

- **토큰·세션·인증정보를 localStorage에 저장하지 않음** → 토큰 탈취형 XSS 피해 표면 없음.
- 닉네임은 사용자가 입력하는 공개 식별자이며 단일 기기에만 남음(서버 전송 없음). 저장 금지 대상(자격증명/PII 민감정보) 해당 없음.
- 참고(경미): `JSON.parse`는 `try/catch`로 감싸 손상된 값에 안전하며, 알 수 없는 `selectedTeamId`는 `getUserProfile`에서 `null` 처리.

### 2.3 XSS — 🟢 양호
- **`dangerouslySetInnerHTML`·`innerHTML`·`eval`·`document.write` 사용 0건.**
- 사용자 생성 텍스트(채팅 메시지, 게시글 제목/본문, 댓글, 닉네임, 밈 캡션)는 모두 JSX `{text}`로 렌더 → React가 자동 이스케이프하므로 스크립트 주입 불가.
- 밈 이미지 URL은 `MemeUploadModal`의 `isValidUrl()`에서 **`http:`/`https:` 프로토콜만 허용**(`new URL()` 기반) → `javascript:`·`data:` URL 차단.
- API 입력 검증: `/api/pitwall/session/[sessionKey]`는 `Number(sessionKey)` 후 `Number.isFinite` 검사로 비정상 입력 시 400 반환.

### 2.4 외부 링크 보안 속성 — 🟢 해당 없음
- `src/`에 `target="_blank"`로 여는 **외부 링크 없음**, 하드코딩 `href="http..."` 없음(내부 이동은 Next `<Link>`/앵커 `#features`).
- 가이드(향후): 외부 링크를 새 탭으로 열 경우 반드시 `rel="noopener noreferrer"` 부여(탭내빙 방지).

### 2.5 dangerouslySetInnerHTML — 🟢 미사용
- 전체 코드베이스에서 사용처 없음.

### 2.6 배포 전 설정 — 🟡 권장
- `next.config.ts`가 비어 있어 **보안 응답 헤더가 설정되지 않음**. Vercel이 HSTS 등 일부 기본값을 제공하지만, 다음 헤더를 명시 권장:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` (또는 CSP `frame-ancestors 'none'`) — 클릭재킹 방지
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy`(카메라/마이크/위치 비활성)
  - (선택) `Content-Security-Policy` — `<img>`가 임의 외부 URL을 로드하므로 `img-src`를 `https: data:`로 제한하면 추적/혼합콘텐츠 위험 축소. 단 인라인 스타일/Tailwind와의 호환 검증 필요.
- 권장 구현(예시):
  ```ts
  // next.config.ts
  const securityHeaders = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ];
  const nextConfig: NextConfig = {
    async headers() {
      return [{ source: "/:path*", headers: securityHeaders }];
    },
  };
  ```

### 2.7 외부 이미지 `<img src>` — 🟡 경미
- `MemeCard`·`MemeUploadModal`·`PitWallPage(DriverAvatar)`가 외부 이미지(`picsum.photos`, `media.formula1.com`, 사용자 입력 URL)를 `<img>`로 직접 로드.
- 위험: 임의 외부 호스트로 요청이 나가 **사용자 IP가 제3자에 노출**될 수 있음(추적 픽셀). 스크립트 실행 위험은 없음(이미지 컨텍스트). 모든 `<img>`에 `onError` 폴백이 있어 깨진 링크는 graceful 처리됨.
- 완화: 위 CSP `img-src` 제한 또는 이미지 프록시(범위 밖).

---

## 3. 4회차 내 수정 가능 항목 (우선순위)

| 우선 | 항목 | 작업 | 난이도 |
|---|---|---|---|
| 1 | 보안 응답 헤더 | `next.config.ts`에 `headers()` 추가(2.6 예시) | 낮음 (10분) |
| 2 | (선택) CSP `img-src` | 외부 이미지 출처를 화이트리스트로 제한 | 중간 (호환 검증 필요) |
| 3 | 입력 길이 가드 재확인 | 게시글 제목 `maxLength`(60) 존재, 본문·댓글에도 상한 추가 검토 | 낮음 |
| 4 | 향후 외부 링크 규칙 | 외부 `<a>` 추가 시 `rel="noopener noreferrer"` 컨벤션 문서화 | 낮음 |

> 1번만으로도 배포 보안 기준을 충족한다. 2~4는 강화 항목.

---

## 4. 배포 전 체크리스트

- [ ] `next.config.ts` 보안 헤더 추가 후 `pnpm build` 통과 확인
- [ ] `.env*`가 저장소에 커밋되지 않았는지 재확인(현재 파일 없음)
- [ ] OpenF1 외부 호출 실패 시 폴백 동작 확인(이미 구현: `source: "fallback"`)
- [ ] 배포 도메인에서 응답 헤더 적용 여부 확인(`curl -I`)
- [ ] (선택) CSP 적용 시 밈/헤드샷 이미지·Tailwind 정상 렌더 회귀 확인

---

## 5. 결론

서버·DB·인증·시크릿이 없는 클라이언트 중심 MVP로, **토큰 저장·SQL 인젝션·서버 시크릿 노출 같은 고위험 표면이 구조적으로 존재하지 않는다.** 사용자 입력은 React 자동 이스케이프 + URL 프로토콜 검증으로 XSS가 차단된다. 남은 권장사항은 **배포용 보안 응답 헤더 추가(섹션 2.6)** 이며, 4회차 내 10분 내외로 적용 가능하다.
