---
id: session-3-core-features
title: Session 3 — 핵심 기능 구현 (FR-001 ~ FR-011)
status: proposed
created: 2026-05-27
---

## Summary

Session 2에서 완성된 App Shell 위에 핵심 기능 6개를 구현한다.
온보딩(닉네임·팀 선택), 전체 채팅(The Main Straight), 팀별 채팅(The Garage),
밈 박스(Meme Box), F1 입문 가이드(F1 101), 경기 일정·챔피언십 순위(Pit Wall).

## Problem

Session 2 종료 시점에서 앱의 모든 탭은 placeholder 상태다.
사용자가 닉네임·팀을 설정할 수 없고, 메시지 전송·밈 게시·좋아요 등 어떤 상호작용도 동작하지 않는다.

## Goals

- FR-001 ~ FR-011(Must) 전부 구현
- AC-001 ~ AC-008 기준 수동 QA 통과 가능 상태
- Session 4 Playwright E2E 테스트가 붙을 수 있는 코드 구조 유지

## Non-goals

- WebSocket / 실시간 서버 연동 — setInterval 시뮬레이터로 대체
- 서버 DB 연동 — localStorage(UserProfile) + 인메모리 State만 사용
- 로그인 / 회원가입
- 결제
- 외부 F1 공식 API
- Playwright 테스트 작성 (→ Session 4)
- Vercel 배포 (→ Session 4)

## Scope

| Feature | FR | Priority |
|---|---|---|
| 온보딩 (닉네임 + 팀 선택 + localStorage 저장) | FR-001 | Must |
| 전체 채팅 The Main Straight | FR-002, FR-004, FR-005 | Must |
| 팀별 채팅 The Garage | FR-003, FR-004, FR-005 | Must |
| 밈 박스 업로드 + 피드 + 좋아요 | FR-006, FR-007, FR-008 | Must |
| F1 101 가이드 (카드 인라인 확장) | FR-009 | Must |
| Pit Wall 순위·일정 | FR-010, FR-011 | Must |
| 밈 인기순 정렬 | FR-012 | Should |
| 프로필 편집 (닉네임·팀 변경) | FR-013 | Nice |

## Success Criteria

- 사용자가 닉네임·팀 설정 → 채팅 참여의 핵심 흐름을 1분 안에 완료할 수 있다.
- AC-001 ~ AC-008 시나리오를 브라우저에서 수동으로 검증할 수 있다.
- `pnpm build`가 오류 없이 통과한다.
