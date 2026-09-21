# Travlan — Design System (v3, 최종)
> Neutral zinc grid with one confident orange CTA. 그림자 대신 헤어라인 테두리로 층위를 만들고, 오렌지는 오직 핵심 액션 버튼에만 쓴다.

**Theme:** light
**참고:** Awesomic 스타일(테두리 기반 elevation, 큰 radius, 이미지 카드 구조)의 구조를 가져오고, 색 사용 규칙만 Dialog 방식(오렌지 = 핵심 CTA)으로 혼합.

## 핵심 원칙

1. **그림자 금지, 테두리로만 구분.** 카드 elevation은 `1px solid` 헤어라인 테두리로만 표현한다. box-shadow 사용 안 함.
2. **Radius는 크게, 36px.** 카드 전체가 확실히 둥글다. 버튼/뱃지는 pill(완전 둥근).
3. **오렌지(clay-ember)는 핵심 CTA 버튼 전용.** "여행 만들기", "저장하기", "타임라인으로 보내기" 등 사용자가 실제로 눌러야 하는 주요 액션에만. 뱃지, 텍스트 강조, 카드 배경엔 사용 금지.
4. **이미지 카드 = 사진이 상단을 꽉 채움.** 좁은 회색 placeholder 박스 금지. 사진이 있으면 카드 상단 절반 이상을 object-cover로 꽉 채우고, 그 아래 텍스트(이름/설명/뱃지)가 이어진다.
5. **페이지 배경은 순백(pure-white) 유지.** 별도 배경색 톤 분리 없음 — 카드 구분은 테두리가 담당하므로 배경/카드 명도차에 의존하지 않는다.

## Tokens — Colors (기존 토큰 이름 유지, 값 교체)

| 토큰 | 이전 값 | 최종 값 | 역할 |
|------|---------|---------|------|
| `--color-deep-ink` | #000d10 | `#09090b` | 기본 텍스트, 헤딩, 다크 버튼 배경 |
| `--color-pure-white` | #ffffff | `#ffffff` | 페이지 배경, 카드 표면 |
| `--color-cool-ash` | #8e8e95 | `#71717a` | 보조 텍스트, 헬퍼 텍스트 |
| `--color-pebble` | (배경 or 테두리로 계속 바뀌었음) | `#ececee` | **카드/입력창 테두리 전용** (1px hairline) — 최종 확정, 더 이상 배경으로 안 씀 |
| `--color-graphite` | #484758 | `#18181b` | 본문 텍스트, nav 텍스트 |
| `--color-midnight-hull` | #0f0f1c | `#27272a` | 다크 섹션/카드 배경 |
| `--color-clay-ember` | (여러 번 변경됨) | `#ff5a00` | **오직 핵심 CTA 버튼에만.** 뱃지/텍스트 강조 사용 금지 |

### 신규 추가 토큰

| 토큰 | 값 | 역할 |
|------|-----|------|
| `--color-mist` | `#d4d4d8` | 보조 구분선, 비활성 상태 |
| `--color-ash-light` | `#a1a1aa` | placeholder 텍스트, 비활성 라벨 |
| `--color-paper` | `#f4f4f5` | 선택적 섹션 배경 (기본은 pure-white, 특정 섹션에만) |

## Tokens — Radius (최종)

```css
--radius-flat: 36px;      /* 카드 전체 */
--radius-input: 14px;     /* input, select, textarea */
--radius-badge: 12px;     /* 작은 뱃지 (필터 칩 제외) */
--radius-pill: 10000px;   /* 버튼, 필터 칩 */
```

## Elevation — 그림자 대신 테두리

```css
border: 1px solid var(--color-pebble); /* #ececee */
```

**hover 시(클릭 가능한 카드):**
```css
hover:border-color: var(--color-mist); /* #d4d4d8 */
transition: border-color 150ms;
```

## 카드 스타일 — 텍스트 카드 (일반)

```
bg-pure-white border border-pebble rounded-flat(36px) p-7
그림자 없음
```

## 카드 스타일 — 이미지 카드 (여행 카드, 커뮤니티/마이페이지)

레퍼런스: 인물 사진이 카드 상단을 꽉 채우고, 아래로 이름/직함/태그가 이어지는 구조.

```
카드 전체: border border-pebble rounded-flat(36px) overflow-hidden bg-pure-white

이미지 영역:
- aspect-[4/5] 권장 (세로로 약간 긴 비율)
- object-cover로 꽉 채움
- 이미지 없을 시: bg-paper(#f4f4f5) 배경 + 중앙에 흐린 아이콘, "대표 사진" 텍스트 라벨 사용 금지
- overflow-hidden이 카드에 있으므로 이미지 자체 radius 불필요

텍스트 영역 (이미지 아래, padding 20-24px):
- 여행 이름: font-semibold, 18-20px, --color-deep-ink
- 날짜/예산: --color-cool-ash, 14px
- 뱃지(카테고리/상태): outline만 - border border-pebble rounded-badge, 배경 없음
- 작성자: 하단에 아바타(32px, 원형) + 이름, cool-ash 텍스트
```

## CTA 버튼 (최종)

```css
.btn-primary {
  background: var(--color-clay-ember); /* #ff5a00 */
  color: #ffffff;
  border-radius: var(--radius-pill);
}
.btn-secondary {
  background: var(--color-deep-ink); /* #09090b */
  color: #ffffff;
  border-radius: var(--radius-pill);
}
.btn-ghost {
  background: #ffffff;
  color: var(--color-deep-ink);
  border: 1px solid var(--color-pebble);
  border-radius: var(--radius-pill);
}
```

**주의:** 한 화면에 Primary(오렌지) 버튼은 원칙적으로 1개만.

## 뱃지 / 필터 칩

```
outline만: border border-pebble rounded-badge(필터 칩은 rounded-pill), 배경 없음
텍스트: --color-graphite, 12-13px
선택된 상태: bg-deep-ink text-white border-deep-ink (오렌지 사용 금지)
```

## Input / 검색창 / 슬라이더

```
border border-pebble rounded-input(14px) bg-pure-white
placeholder: --color-ash-light
포커스 시: border-color를 deep-ink로 전환
```

## 적용 범위 (다음 단계)

1. 토큰 전면 교체 (tokens.css)
2. 커뮤니티 페이지 재시범 적용 (이미지 카드 구조 포함)
3. 확인 후 마이페이지, 지도 페이지, 타임라인 페이지, 홈페이지, Navbar 순으로 확산