# 참고 자료 보관소 (로컬 전용)

이 폴더는 **우리 사이트 구현에 참고할 외부 화면 자료**를 모아 두는 곳입니다.

- `codetree/` → 코드트리 우측 패널 캡처 (`.gitignore`에 등록됨, **커밋 금지**)
- `private/` → 그 밖의 비공개 참고 자료 (`.gitignore`에 등록됨, **커밋 금지**)

> ⚠️ 코드트리는 유료/로그인 기반 서비스입니다. 수집한 HTML·스크린샷은 **로컬 참고용**으로만 쓰고,
> 저장소에 커밋하거나 외부에 재배포하지 않습니다. 실제 구현은 관찰한 **동작·구조를 우리 스타일로 재구현**합니다.

## 수집 체크리스트

각 항목을 파일로 남겨 주세요. 파일명은 아래 규칙을 따르면 제가 바로 찾습니다.

| # | 항목 | 파일명 예시 |
|---|---|---|
| 1 | 패널 **펼친 상태** 전체 HTML | `docs/reference/codetree/panel-expanded.html` |
| 2 | 패널 **접힌 상태** 전체 HTML | `docs/reference/codetree/panel-collapsed.html` |
| 3 | 우측 패널 영역만의 outerHTML | `docs/reference/codetree/panel-only.html` |
| 4 | 패널 요소의 계산된 스타일 | `docs/reference/codetree/panel-styles.txt` |
| 5 | 스크린샷: 펼침 / 접힘 / 리사이즈 중 | `panel-expanded.png`, `panel-collapsed.png`, `panel-resizing.png` |
| 6 | 스크린샷: 좁은 창(모바일 폭)에서의 패널 | `panel-narrow.png` |

## 함께 알려 주실 정보 (글로 남겨 주세요)

- 창 너비(px) 및 좌측 네비/우측 패널의 실제 폭
- 패널이 **드래그로 리사이즈되는지**, 된다면 최소/최대 폭
- 접힘/펼침 애니메이션의 **지속 시간과 이징 느낌**(빠름/부드러움)
- 패널 안에 탭이 있는지, 탭 전환 시 스크롤 위치가 유지되는지
- 이미지를 클릭했을 때 확대(라이트박스)가 되는지
- 패널 접힘 상태에서 **본문에 표시가 남는지**
- 새로고침 후에도 접힘 상태가 유지되는지

## 정리 결과 기록

| 원본 (전달받은 파일) | 정리본 | 비고 |
|---|---|---|
| `panel-only.html` (TextEdit 래퍼) | `panel-only.clean.txt`, `panel-only.pretty.html` | `<p>` 안의 이스케이프된 HTML을 `textutil`로 복원 |
| `panel-expanded.html` (TextEdit 래퍼) | `panel-expanded.clean.txt` | 동일 |
| `panel-styles.txt.rtf` (RTF) | `panel-styles.txt` | `textutil -convert txt`로 변환 (CSS 변수 1,663줄) |

분석 결과는 `docs/design/panel-spec.md`에 정리했습니다.

### 캡처 범위에 대한 메모
- 이번 캡처는 **"문제" 패널**(안내 배너 + 선택지 카드)이었습니다. 패널의 **겉구조(헤더/푸터/리사이즈 핸들/배너/스크롤 격리)** 를 읽는 데는 충분했습니다.
- 다만 우리가 참고하려는 **"이미지 참고자료를 모아 두는 패널"** 의 실제 예(이미지 목록·탭·라이트박스)가 코드트리에 있다면,
  그 화면도 함께 캡처해 주시면 9.3의 자료 탭 UI를 더 정확히 맞출 수 있습니다.
- 리사이즈 **동작**(드래그 중 커서·제약, 접기 후 상태 유지)은 HTML만으로는 알 수 없어
  **화면 녹화(⇧⌘5)** 또는 관찰 메모가 있으면 좋습니다.

## 수집 방법 (macOS)

> **중요 — 저장 방식**: TextEdit은 `.html`/`.rtf`로 저장할 때 Cocoa HTML Writer 형식으로 감싸 버려서
> 원본 HTML이 `&lt;div&gt;`처럼 이스케이프된 채 `<p>` 태그 안에 들어갑니다(지금 전달해 주신 파일이 그 상태였습니다).
> 저는 `textutil`로 정상 복원했지만, 다음부터는 **VS Code 등 텍스트 편집기로 저장**하거나
> TextEdit을 쓴다면 **`⇧⌥⌘V`(서식 없이 붙여넣기) 후 포맷을 "일반 텍스트(.txt)"로 저장**해 주세요.

아래 요약 절차를 참고하세요.

1. Chrome/Edge에서 코드트리 페이지 접속 → 로그인 → 대상 페이지 열기
2. `⌥⌘I` (Option+Command+I) 로 개발자 도구 열기
3. `Elements` 탭에서 **우측 패널에 해당하는 요소**를 찾는다
   (페이지에서 요소를 우클릭 → `검사` 를 쓰면 바로 선택됨)
4. 패널 요소 우클릭 → `Copy` → `Copy outerHTML` → 텍스트 편집기에 붙여넣고 `panel-only.html`로 저장
5. 더 넓게 잡고 싶으면 `<body>` 또는 `<html>`에서 같은 방식으로 → `panel-expanded.html`
6. `Copy` → `Copy styles` 로 계산된 CSS를 복사 → `panel-styles.txt`
7. 요소 우클릭 → `Capture node screenshot` → 해당 영역만 PNG로 저장
8. 접힘/펼침 상태를 각각 반복해 두 상태를 모두 수집
9. 브라우저 창을 좁혀(예: 400px) 모바일 동작도 캡처
