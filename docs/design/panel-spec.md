# 우측 패널 상세 스펙 (M3 구현 기준)

- 작성일: 2026-09-21
- 근거 자료: `docs/reference/codetree/` (로컬 전용, 커밋 금지)
  - `panel-only.clean.txt`, `panel-expanded.clean.txt` — TextEdit 래퍼를 벗겨낸 원본 outerHTML
  - `panel-styles.txt` — `Copy styles`로 확보한 CSS 변수(1,663줄)
- 관련: `docs/PLAN.md` 5.1(좌측 네비), 6.4(반응형), 9.3(패널 개요)

---

## 1. 코드트리에서 측정한 사실

### 1.1 레이아웃 모델 — 2분할 flex + 비율 리사이즈

```html
<div data-slot="resizable-panel-group"
     style="height:100%; width:100%; overflow:hidden; display:flex; flex-flow:row; touch-action:pan-y;">
  <div data-slot="resizable-panel" id="left"  style="display:flex; flex: 55.203 1 0px;">…</div>
  <div data-slot="resizable-handle" role="separator" aria-orientation="vertical" tabindex="0"
       style="flex: 0 0 auto; touch-action: none;"
       aria-controls="left" aria-valuemin="51.337" aria-valuemax="59.358" aria-valuenow="55.203">
  <div data-slot="resizable-panel" id="right" style="display:flex; flex: 44.797 1 0px;">…</div>
</div>
```

| 관찰 | 값 |
|---|---|
| 분할 방식 | `display:flex` (2분할), 좌/우 비율 합 = 100 |
| 패널 크기 표현 | `flex: <비율> 1 0px` → **비율(percentage) 기반** |
| 리사이즈 핸들 폭 | `w-16` = **16px** |
| 핸들 커서 | `cursor-col-resize` |
| 핸들 a11y | `role="separator"`, `aria-orientation="vertical"`, `tabindex="0"`, `aria-controls`, `aria-valuemin/max/now` (제약도 % 단위) |
| 핸들 상태 | `data-separator="inactive"` → 상태를 data 속성으로 관리 |
| 키보드 포커스 | `focus-visible:ring-1` |
| 스크롤 격리 | 컨테이너 `contain: layout` + `overflow: hidden` + `touch-action: pan-y` |

### 1.2 패널 내부 골격 — 40px 헤더 / 스크롤 본문 / 40px 푸터

| 영역 | 클래스에서 읽은 값 |
|---|---|
| 패널 루트 | `flex flex-col h-full`, `rounded-0` → `lg:rounded-12` (=12px) |
| 스크롤 래퍼 | `flex-grow:1; overflow:hidden; contain: layout; touch-action: pan-y` |
| **헤더** | `min-height:40px; max-height:40px`, `gap:16px`, `padding-left:8px; padding-right:16px`, `border-bottom`, `z-40` |
| 본문 | `flex:1; overflow-y:auto; flex-col`, 좌우 border |
| 본문 안 **sticky 서브헤더** | `position:sticky; top:0; z-index:12` (내부 배너는 `height:44px`) |
| **푸터** | `min-height:40px`, `z-40`, `rounded-b-12`, `border-top`, `gap:4px`, `overflow:hidden` |
| 하단 오버레이 슬롯 | 푸터 위에 `position:absolute; bottom:40px; height:0` 인 슬롯 → 하단 고정 알림/확장용 |
| 닫기/안내 배너 | `absolute top:0; left:0; width:100%; height:44px` + 우측 X 버튼(24px 정사각) → **닫을 수 있는 안내 배너** |

### 1.3 모션 · 트랜지션

| 용도 | 값 |
|---|---|
| 색/배경 전환 | `transition-colors 200ms ease-in-out` |
| 버튼 눌림 표현 | `duration-100`, `border-b-6 → active:border-b-2` + `active:h-[60px] active:mt-6` (높이·여백으로 눌린 느낌) |
| 등장 애니메이션 | `animate-appear-bottom`, `animate-scale`, `animate-in` |
| 그 외 | `duration-300` 1회 |

### 1.4 반응형

- 사용된 브레이크포인트 접두어는 **`lg:` 3개, `max-md:` 2개 뿐** (sm/md/xl/2xl은 미사용)
  - `lg:rounded-12`, `lg:p-16`, `lg:p-0`
  - `max-md:px-16`, `max-md:pt-24`
- 즉 **작은 화면에서는 둥근 모서리·패딩을 제거해 전체 폭으로 쓰고, 넓은 화면에서만 카드처럼 띄운다**
- 캡처 범위에는 별도 드로어/바텀시트 코드가 없다 (좁은 화면에서는 분할이 아니라 전체 폭 전환으로 처리하는 것으로 보임)

### 1.5 디자인 토큰 (참고)

```css
--font-sans: "Pretendard Variable", Pretendard, -apple-system, … ;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, … ;
--color-neutral-50: #fafafa … --color-neutral-500: #b0b0b0 … --color-neutral-950: #171717
```

- **`Pretendard Variable` 사용을 확인** → 우리 6.2 폰트 선택과 일치
- 시맨틱 접미사 체계: `label / background / stroke / icon / fill` × `neutral / light / lighter / dark / darker / normal / disable / assistive` + `primary / success`
- 다크 모드는 `<html class="dark">` + `dark:` 유틸리티로 **강제 다크**
- `--vscode-*` / `--monaco-editor-*` 변수 700여 개가 함께 복사됨 (Monaco 에디터 내장 때문) → 우리에게 불필요

### 1.6 전체 레이아웃 스크린샷에서 확인한 것

근거: `docs/reference/codetree/full-layout-dark.png`

| 관찰 | 내용 |
|---|---|
| 3영역 구조 | ① 좌측 **아이콘 레일**(약 54px, 문제 이동 아이콘 + 진행률) ② **중앙 메인 카드** ③ **우측 패널 카드** |
| 카드 분리 | 중앙과 우측이 **각각 독립된 둥근 카드(12px)** 이고 사이에 **거터(gutter)** 가 있음. 패널이 본문에 붙어 있지 않고 "떠 있는 카드"로 인식됨 |
| 리사이즈 핸들 | 그 거터 위치에 세로선으로 존재 |
| **탭의 위치** | 탭(`개념 / 문제 / 해설 / 토론`)은 **중앙 메인 카드 상단**에 있고, **우측 패널에는 탭이 없다** |
| 패널 구성 | 헤더(우측 정렬 버튼 3개 + `● 연결됨` 상태) → **닫을 수 있는 안내 배너**(ⓘ + X) → 중앙 정렬 콘텐츠 → **푸터(우측 정렬 주요 액션 "제출 및 채점", 비활성 상태 시각화)** |
| 대응 표시 | **원형 숫자 뱃지 ①②③…** 로 본문/보기 항목과 결과 항목을 연결 |
| 선택 카드 | 60×66px, 하단 보더 6px로 입체감, 활성 시 amber 강조 |
| 패널 내부 행 | 6px 라운드 + 1px 보더, 높이 약 48px, 좌측 원형 숫자 + 우측 값 |
| 톤 | 배경 거의 검정(`#171717` 계열), 카드/보더는 neutral-800~900, **강제 다크** |

**우리 설계에 주는 시사점**

1. **본문↔패널 번호 뱃지** 방식이 실제로 쓰이고 있음을 확인 → `panel-spec` 4장(양방향 동기화)의 번호 뱃지 설계 유지
2. **패널을 독립 카드로 분리**하는 방식은 "보조자료"라는 성격을 시각적으로 잘 전달함 → **채택하되 절제**: 우리는 배경 차이를 아주 옅게(같은 계열) 두고 1px 보더 + 12px 라운드만 사용
3. **패널 푸터의 주요 액션 슬롯**은 우리에게도 유용 → 자료 탭 하단에 `원본 이미지 모두 보기`·`이미지 다운로드` 같은 액션 자리로 활용
4. **탭 위치는 다르게 간다**: 코드트리의 탭은 "콘텐츠 종류 전환"이고 우리 탭은 "보조 정보 전환"이므로, **패널 안에 두는 D7 결정을 유지**한다. 다만 "메인 영역 상단 탭" 패턴은 향후 트랙 내 탭(개념/예제/연습)으로 확장할 때 참고 가치가 있음



| 항목 | 결정 | 근거 |
|---|---|---|
| `role="separator"` + `aria-valuenow/min/max` + `tabindex="0"` 핸들 | **채택** | 키보드로 패널 폭 조절 가능. 접근성 요구(14장) 충족 |
| `data-*` 상태 속성으로 드래그 상태 스타일링 | **채택** | `data-state="idle\|dragging\|collapsed"` |
| `contain: layout` + `overflow:hidden` 스크롤 래퍼 | **채택** | 패널 내부 스크롤이 본문 레이아웃에 영향 주지 않음 |
| 40px 헤더 / 40px 푸터 / 12px 라운드 | **채택** | 밀도 좋고 우리 토큰과 충돌 없음 |
| 본문 내 **sticky 서브헤더** | **채택** | 문서 목차 탭에서 "현재 섹션"을 상단 고정하는 데 재사용 |
| **닫을 수 있는 안내 배너** | **채택** | "이 글의 자료 4개" 등 안내 + 닫기. 닫힘 상태 저장 |
| 200ms 이하 트랜지션 | **채택** | 우리 모션 원칙(200ms)과 동일 |
| **패널을 독립 카드로 분리**(12px 라운드 + 보더 + 거터) | **채택(절제 변형)** | "보조자료"라는 성격이 시각적으로 분리됨. 배경 차이는 같은 계열의 옅은 차이만 사용 |
| **패널 푸터의 주요 액션 슬롯** | **채택** | 자료 탭 하단 액션(`원본 보기`·`다운로드`) 자리로 재사용 |
| **원형 숫자 뱃지로 본문↔패널 대응** | **채택** | 색이 아니라 번호로 연결 → 접근성 요구와 부합 |
| 탭을 메인 영역에 두는 방식 | **배제(우리는 패널에 둠)** | 코드트리 탭=콘텐츠 종류, 우리 탭=보조 정보 → 위치가 다른 게 자연스러움. D7 유지 |
| 3D 눌림 효과(`border-b-6 → active:border-b-2`) | **배제** | 우리 사이트 톤(절제)과 불일치 |
| lucide 아이콘 세트 의존 | **배제** | 필요한 7~8개만 인라인 SVG로 직접 보유(외부 의존 0) |
| 비율(flex %) 기반 패널 폭 | **변형** | 아래 2.1 |
| 강제 다크 | **변형** | 우리는 `prefers-color-scheme` 자동 + 수동 토글 |
| 좁은 화면 = 전체 폭 전환 | **변형** | 우리는 **바텀 시트**(6.4)로 처리. 근거: 좌측 네비 드로어와 동시 사용성 확보 |

### 2.1 폭 결정 방식 — 비율(%)이 아니라 px 고정 + 드래그

코드트리는 좌측이 코드 에디터라 비율 기반이 자연스럽다. 우리 좌측은 **읽기용 본문**이고, 본문은 **한 줄 길이(measure)가 일정해야** 한다(6.1 원칙: 최대 44rem).

```
[좌 nav: 고정 px] [본문: 유동, max 44rem, 중앙] [우 패널: px 고정, 320~560px]
```

- 우 패널 폭: 기본 **380px**(≥1440), **320px**(1024~1439), 드래그로 **320~560px** 조절
- 조절값은 `localStorage`에 저장, **리셋 버튼** 제공
- 창 폭이 줄어들면 사용자가 정한 px가 컨테이너를 넘지 않도록 **`min(사용자값, 컨테이너의 45%)`** 로 클램프
- 키보드: 핸들 포커스 후 `←/→` = 16px 이동, `Shift+←/→` = 64px, `Home/End` = 최소/최대, `Enter` = 접기/펼치기 (aria-valuenow 갱신)

---

## 3. 접힘/펼침 동작 명세

| 항목 | 값 |
|---|---|
| 트리거 | 헤더 우측 버튼, `]` 키, 좁은 화면에서 스와이프 |
| 애니메이션 | 폭 `200ms` `ease-out`. CSS `width` 대신 **`flex-basis`/`grid-template-columns` 트랜지션**으로 리플로우 최소화 |
| 읽기 위치 보존 | 애니메이션 동안 **스크롤 앵커(현재 읽던 문단) 고정**. 폭 변화로 읽던 줄이 튀지 않게 하는 필수 조건 |
| 접힌 상태 표시 | 우측 모서리에 **세로 탭(폭 28px)** 만 남김 → "자료 n개" 존재 인지(9.3-3) |
| 상태 저장 | `panel.open`, `panel.width`, `panel.tab`, `panel.group` |
| 모션 감소 | `prefers-reduced-motion: reduce` → 트랜지션 제거, 즉시 전환 |
| 좁은 화면(<768) | 바텀 시트: 스냅 지점 `25% / 50% / 90%`, 배경 스크림, 포커스 트랩, `Esc`/스크림 탭으로 닫기, `touch-action: pan-y` |

## 4. 본문 ↔ 패널 동기화 (양방향)

| 방향 | 동작 |
|---|---|
| 본문 → 패널 | `<FigureRef id="fig-1">` 클릭 → 패널 열기 + `자료` 탭 + 해당 `group` 활성 + 항목 하이라이트 + `scrollIntoView({block:'center'})` |
| 패널 → 본문 | 항목 클릭 → 본문의 해당 참조 위치로 스크롤(옵션으로 끄기) |
| 양쪽 표시 | 본문 참조와 패널 항목에 **같은 번호 뱃지**(`① ② ③`) 부여 → 시각적 대응. 색이 아니라 번호로 연결(접근성) |
| 접힘 상태 | 본문 우측 여백에 참조 뱃지만 남김 |

## 5. M3 수용 기준 (이 스펙의 검증 항목)

1. 패널 폭을 키보드만으로 320~560px 범위에서 조절할 수 있다
2. 드래그 중 `data-state="dragging"`이 적용되고, 리사이즈 핸들에 `aria-valuenow`가 실시간 갱신된다
3. 패널 폭을 바꿔도 읽던 문단 위치가 유지된다(스크롤 앵커)
4. `FigureRef` 클릭 시 올바른 탭·그룹·항목이 열린다
5. 접힘 상태에서 세로 탭으로 존재가 인지되고, `]`로 재토글된다
6. 새로고침 후 `open/width/tab/group`이 복원된다
7. `prefers-reduced-motion`에서 애니메이션 없이 동작한다
8. 768px 미만에서 바텀 시트로 전환되고, `Esc`·스크림으로 닫히며 포커스 트랩이 동작한다
9. 패널 내부 스크롤이 본문/좌측 네비에 영향을 주지 않는다(`contain: layout`)
10. 인쇄 시 패널 자료가 부록으로 출력된다(9.3-7)
