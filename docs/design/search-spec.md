# 검색 상세 스펙 (M5 구현 기준)

- 작성일: 2026-09-21
- 엔진: **Pagefind** (결정 D6)
- UX 참고: **just-the-docs** (`search` 설정 체계) — 목표로 하신 "검색 기능 포함"
- 관련: `docs/PLAN.md` 12.4

---

## 1. 왜 Pagefind인가 (just-the-docs와 비교)

just-the-docs는 **lunr.js**로 클라이언트 검색을 구현합니다. UX는 훌륭하지만 한국어 형태소 처리가 약하고, **인덱스 전체를 JS로 내려받는** 구조라 글이 많아질수록 초기 로딩이 무거워집니다. "글 목록이 많아질 예정"이라는 요구에 맞춰 **엔진은 Pagefind, UX는 just-the-docs를 벤치마크**합니다.

| 기능 | just-the-docs (lunr) | 우리 (Pagefind) |
|---|---|---|
| 검색 방식 | 자동완성 드롭다운, **결과 페이지 없음** | 자동완성 드롭다운 **+ `/search/?q=` 결과 페이지**(공유·no-JS·딥링크) |
| 섹션 단위 검색 | `search.heading_level: 2` | Pagefind **`sub_results`** (제목 단위로 결과 분할) |
| 미리보기 | `previews: 3`, 앞 5단어 / 뒤 10단어 | `excerpt` + `sub_results[].excerpt` (여러 개 반환) |
| 하이라이트 | 검색어 강조 | `excerpt`에 `<mark>` 포함 → 우리 스타일로 감쌈 |
| 키보드 단축키 | `Ctrl/Cmd + <key>` | **`Cmd/Ctrl + K`** (표준) + `/` 보조 |
| 검색 버튼 | 우하단 플로팅 버튼 | **좌측 네비 상단 검색 입력창**(항상 보임) |
| 검색 제외 | frontmatter `search_exclude: true` | 우리 `search: false` 프론트매터 + `status: draft` 자동 제외 |
| 인덱싱 범위 | 페이지 title/content/URL | **`data-pagefind-body`로 본문만**(네비/패널 잡음 제거) |
| 필터 | 없음 | **트랙·태그·난이도 필터**(`data-pagefind-filter`) |
| 인덱스 생성 | Jekyll 빌드 시 JSON | 빌드 후 `pagefind --site dist` |

---

## 2. 인덱싱 설계

### 2.1 무엇을 인덱싱하는가

| 대상 | 포함 | 방법 |
|---|---|---|
| 본문 텍스트 | ✅ | 글 컨테이너에 `data-pagefind-body` |
| 제목·요약·태그 | ✅ | `data-pagefind-meta="title"` / `"track"` / `"tags"` |
| 우측 패널 **자료의 캡션** | ✅ | 패널 항목에도 캡션을 인덱스에 포함(자료 텍스트로 검색 유입) |
| 좌측 네비 / 헤더 / 푸터 | ❌ | `data-pagefind-ignore` |
| 그래프 페이지의 SVG | ❌ | 대신 **텍스트 목차가 인덱싱**됨 |
| `/portfolio/`, `/404`, `/search/` | ❌ | `data-pagefind-ignore` |
| `status: draft` | ❌ | 빌드 산출물 자체에 없음 |

### 2.2 메타데이터 / 필터

```html
<article data-pagefind-body
         data-pagefind-meta="track:algorithms,difficulty:2">
  <span data-pagefind-filter="track" hidden>algorithms</span>
  <span data-pagefind-filter="tags" hidden>dp,memoization</span>
  …
</article>
```

- 결과 카드에 **`트랙 › 글 제목 › 섹션 제목`** 3단 맥락 표시(just-the-docs의 상대 URL 표시보다 정보량 우선)
- 필터 UI: 트랙 드롭다운 + 태그 칩. 필터는 URL 쿼리에 직렬화(`?q=dp&track=algorithms`)

---

## 3. UI/UX 명세

### 3.1 좌측 네비 검색창

| 상태 | 동작 |
|---|---|
| 기본 | 입력창 + `⌘K` 힌트 뱃지 |
| 포커스 | 드롭다운 오픈, 최근 검색어 최대 5개(`localStorage`) |
| 입력(150ms debounce) | 결과 최대 8개 + `모두 보기 →`(→ `/search/?q=`) |
| 결과 항목 | 트랙 뱃지 · 제목 · 섹션 · `excerpt`(검색어 `<mark>`) |
| 키보드 | `↓/↑` 이동, `Enter` 열기, `Esc` 닫기, `Tab` 순환 |
| 빈 결과 | "결과 없음" + **관련 트랙으로 가는 링크** + 텍스트 목차 링크 |
| 로딩 | 첫 입력 시에만 인덱스 로드(그 전에는 힌트 표시) |

### 3.2 `/search/` 결과 페이지
- 좌측 필터 레일 + 결과 목록, 총 개수 표시
- 결과는 20개 단위 "더 보기"
- **JS 없이도 동작**: `q` 파라미터가 있으면 "검색은 자바스크립트가 필요합니다" 안내 + **전체 텍스트 목차 링크**. (그래프 페이지의 텍스트 목차와 동일한 컴포넌트 재사용)
- `<meta name="robots" content="noindex">` (검색 결과 페이지 색인 금지)

### 3.3 접근성
- 입력창 `role="combobox"`, 결과 목록 `role="listbox"`, 항목 `role="option"`, `aria-activedescendant` 관리
- `aria-live="polite"`로 결과 개수 안내
- 드롭다운이 열리면 `Esc`로 닫고 포커스는 입력창으로 복귀
- `<mark>`는 색만으로 강조하지 않고 굵기+배경 병행

---

## 4. 한국어 품질 보강 (Pagefind의 약점 보완)

Pagefind는 형태소 분석이 아니므로 **띄어쓰기 차이로 누락**될 수 있습니다.

| 대응 | 방법 |
|---|---|
| 표기 통일 규칙 | 제목·태그에 전문용어를 일관되게 표기(저작 가이드에 명시) |
| 동의어/별칭 인덱스 | `src/data/search-synonyms.ts`에 `{ term: '동적계획법', aliases: ['동적 계획법','DP'] }` → Pagefind **custom records**로 별칭 항목 주입 |
| 태그 노출 | 글 하단 태그를 인덱스에 포함해 태그명으로도 유입 |
| 부분일치 | 필요 시 Pagefind의 substring 모드로 보완 |

- 초성 검색(예: `ㄷㅈㄱㅎ`)은 **지원하지 않는다** (한계로 명시). 필요해지면 M5 이후 별도 검색 보조 인덱스로 확장

---

## 5. 빌드 · 성능

```jsonc
// package.json (발췌)
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && pagefind --site dist",
    "check": "node scripts/validate-content.mjs && node scripts/build-graph.mjs --check"
  }
}
```

| 항목 | 목표 |
|---|---|
| 추가 빌드 시간 | ≤ 30초 (글 100편 기준) |
| 검색 JS/WASM | 첫 검색 시에만 로드 — **본문 페이지 초기 로딩에 영향 0** |
| 본문 페이지 JS 예산 | 14장 기준(≤ 60KB gzip) 유지. 검색 UI는 좌측 네비 island로 분리하고 **지연 로드** |
| 인덱스 청크 | Pagefind 기본 분할 사용. 300편 초과 시 빈도 기반 분할 옵션 검토 |
| CI | `pagefind` 미설치 시 빌드 실패하도록 버전 고정(`package-lock.json`) |

---

## 6. 분석 연동 (D8)
- 검색 실행 시 이벤트 전송: `search` + 검색어(원문 저장 여부는 개인정보 최소화 관점에서 선택)
- 클릭률 파악용: 결과 클릭은 별도 이벤트로 만들지 않음(과계측 금지, 부록 C)
  - 근거: 제출한 검색어만으로도 "무엇을 찾지 못했는가"를 알 수 있음

---

## 7. M5 수용 기준
1. 좌측 네비 검색창에서 입력 → 150ms 내 결과 드롭다운 표시
2. `⌘K` / `/` 로 검색창 포커스, `Esc`로 닫기, 방향키·Enter로 결과 이동
3. 결과에 트랙·제목·섹션·`<mark>` 미리보기가 표시된다
4. 트랙/태그 필터가 동작하고 URL 쿼리로 공유된다
5. `/search/?q=...` 직접 진입 시 결과가 그대로 보인다
6. **JS 비활성 상태**에서도 `/search/`가 텍스트 목차 링크를 제공한다
7. 좌측 네비·헤더 텍스트가 검색 결과에 나타나지 않는다(`data-pagefind-ignore`)
8. 결과에 `status: draft` 글과 `/portfolio/`, `/404`가 나타나지 않는다
9. 본문 페이지 초기 로딩 JS가 예산(≤60KB gzip) 내다
10. 스크린리더에서 결과 개수 변화가 안내된다(`aria-live`)
