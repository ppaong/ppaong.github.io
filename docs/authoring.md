# 글 작성 가이드

블로그 글 한 편을 쓰고 발행하는 방법입니다. **본문**과 **오른쪽 보조 자료**를 모두 하나의 `.mdx` 파일에서 작성합니다.

---

## 0. 30초 요약

```bash
# 1. 파일 만들기 (트랙 폴더 안에 슬러그 이름으로)
#    src/content/blog/<트랙>/<슬러그>.mdx
#    예: src/content/blog/sample/what-is-a-set.mdx  →  /blog/sample/what-is-a-set/

# 2. 본문 + 프론트매터 작성 (아래 3~5장)

# 3. 검사하고 확인
npm run validate      # 프론트매터·링크·자료 검증
npm run dev           # http://localhost:4321 에서 눈으로 확인

# 4. 발행
git add -A && git commit -m "post(sample): 글 제목" && git push
```

`push`하면 GitHub Actions가 자동으로 배포합니다(1~2분).

---

## 1. 파일 위치와 이름 규칙

```
src/content/blog/<트랙>/<슬러그>.mdx
                 └ sample      └ what-is-a-set
```

- **트랙** = 강좌/시리즈 이름. `src/data/tracks.ts`에 등록되어 있어야 합니다.
- **슬러그** = 그 글의 URL 이름. 소문자·숫자·하이픈만 씁니다.
- 파일 경로가 곧 URL과 글 번호입니다.

| 파일 | URL |
|---|---|
| `src/content/blog/sample/what-is-a-set.mdx` | `/blog/sample/what-is-a-set/` |

> ⚠️ **슬러그는 발행 후 바꾸지 마세요.** URL이 바뀌면 외부 링크와 검색 색인이 깨집니다.
> 트랙/슬러그로 쓸 수 없는 예약어 목록은 `src/data/reserved.ts`에 있습니다(`toc`, `tracks`, `search` 등). 충돌하면 검증에서 걸립니다.

새 트랙을 추가하려면 `src/data/tracks.ts`에 항목을 넣습니다.

```ts
export const TRACKS: Track[] = [
  {
    id: 'algorithms',          // 폴더 이름과 같아야 함
    title: '알고리즘',
    summary: '복잡도부터 그래프 탐색까지',
    difficulty: 2,
    status: 'in-progress',     // planned | in-progress | stable | archived
  },
];
```

---

## 2. 프론트매터 (파일 맨 위 `---` 사이)

```yaml
---
title: 집합이란 무엇인가          # (필수) 글 제목
order: 1                        # (필수) 트랙 안에서의 순서. 중복 금지
summary: 한 문장 요약.            # (필수) 목록·검색·OG 설명에 쓰임
status: published                # (필수) draft | published | archived
difficulty: 1                    # (선택) 1~5
tags: [집합, 기호, 기초]          # (선택)
created: 2026-09-23              # (필수)
updated: 2026-09-25              # (선택) 수정일
links:                           # (선택) 글 사이의 관계 → 목차 그래프
  requires:
    - sample/what-is-a-set
materials:                       # (선택) 오른쪽 보조 자료 → 5장
  - id: fig-venn
    type: image
    title: 전체집합 U와 집합 A
    src: /blog/sample/set-basic.svg
    alt: 점선 사각형 U 안에 타원 A가 있고 …
---
```

### 필드 표

| 필드 | 필수 | 설명 |
|---|---|---|
| `title` | ✔ | 글 제목. `h1`로 렌더됩니다 |
| `order` | ✔ | 트랙 내 순서(정수). 이전/다음 글과 좌측 네비 정렬에 쓰입니다 |
| `summary` | ✔ | 한 줄 요약. 트랙 목록·검색 결과·OG 태그에 쓰입니다 |
| `status` | ✔ | `draft`는 **로컬에서만** 보이고 배포되지 않습니다 |
| `difficulty` | | 1~5 |
| `tags` | | 문자열 배열 |
| `created` / `updated` | ✔ / | `YYYY-MM-DD` |
| `links` | | `requires` / `applies` / `related` / `cites` — 6장 참고 |
| `materials` | | 오른쪽 패널 자료 — 5장 참고 |

> `track`과 `slug`는 **적지 않습니다.** 파일 경로에서 자동으로 정해집니다(중복·불일치 방지).

---

## 3. 본문 작성

프론트매터 아래는 마크다운입니다. 제목은 `##`부터 시작하세요(`#`는 페이지 제목이 자동으로 들어갑니다).

```markdown
## 집합이란

수학에서 **집합**은 분명하게 구별되는 대상들의 모임입니다.

- 목록 항목
- 목록 항목

| 기호 | 뜻 |
| --- | --- |
| $\in$ | 원소이다 |
```

- `##`, `###`은 자동으로 **오른쪽 패널의 "문서 안내" 탭**에 목차로 들어갑니다.
- 표, 인용, 목록, 코드블록(```) 모두 그대로 씁니다.
- 각 `##`에는 자동으로 `id`가 붙어 링크로 공유할 수 있습니다.

### 3.1 수식

KaTeX로 **빌드 시점에** 렌더됩니다. 별도 설정이 필요 없습니다.

**인라인 수식** — 문장 안에 넣을 때:

```markdown
인라인 수식은 $a \in A$ 처럼 씁니다.
```

**디스플레이 수식** — 한 줄을 차지하며 가운데 정렬될 때:

```markdown
$$
A \cup B = \lbrace x \mid x \in A \text{ 또는 } x \in B \rbrace
$$
```

> ⚠️ **디스플레이 수식은 `$$`를 반드시 단독 줄에 두세요.**
> `$$수식$$` 을 한 줄에 몰아 쓰면 **디스플레이가 아니라 인라인으로 렌더**되어 글자 크기가 작고 정렬되지 않습니다.
> 위처럼 `$$` 여는 줄 / 수식 / `$$` 닫는 줄, 3줄로 쓰면 됩니다.

> ⚠️ **MDX에서는 중괄호가 특별한 문자입니다.** 집합 기호 `{ }`는 반드시 `\lbrace` `\rbrace`로 쓰세요.
> `\{ \}`도 동작하지만, MDX 문법과 섞이면 오류가 나기 쉬우므로 `\lbrace`/`\rbrace`를 권장합니다.

| 쓰고 싶은 것 | 이렇게 |
|---|---|
| 집합 `{1, 2}` | `$\lbrace 1, 2 \rbrace$` |
| 원소 `∈`, `∉` | `$\in$`, `$\notin$` |
| 공집합 | `$\varnothing$` |
| 합집합/교집합 | `$\cup$`, `$\cap$` |
| 여집합 | `$A^{c}$` |
| 부분집합 | `$\subset$` |
| 자연수/정수/실수 | `$\mathbb{N}$`, `$\mathbb{Z}$`, `$\mathbb{R}$` |
| 분수 | `$\dfrac{1}{2}$` |

### 3.2 강조 박스 — `<Callout>`

```markdown
<Callout type="tip" title="순서와 중복은 상관없습니다">
집합에서는 순서도, 같은 원소를 여러 번 쓰는 것도 의미가 없습니다.
</Callout>
```

- `type`: `note`(참고, 기본) / `tip`(알아두기) / `warn`(주의)
- `title`을 생략하면 타입별 기본 제목이 들어갑니다.

### 3.3 MDX에서 주의할 문자

MDX는 `<`, `{`를 특별하게 취급합니다. 본문에서 이 글자 자체를 쓰려면:

| 쓰고 싶은 것 | 이렇게 |
|---|---|
| `<` | `&lt;` 또는 코드로 `` `<` `` |
| `{` | 수식 안에서는 `\lbrace`, 본문에서는 `&#123;` |
| 중괄호가 들어간 코드 | 백틱으로 감싸기: `` `{ "a": 1 }` `` |

---

## 4. 오른쪽 보조 자료 만들기

오른쪽 패널은 **탭 2개**로 되어 있습니다.

| 탭 | 내용 | 자동/수동 |
|---|---|---|
| 1. 문서 안내 | `##`/`###` 목차 + 현재 위치 표시 | **자동** (아무것도 안 해도 됨) |
| 2. 자료 | `materials`에 적은 카드들 | **프론트매터에 작성** |

즉, `##` 소제목만 잘 달면 1번 탭은 저절로 채워집니다. 우리가 작성할 것은 2번 탭입니다.

### 4.1 구조

`materials`는 **배열**이고, 적은 순서대로 1번, 2번, 3번… 번호가 붙습니다.

```yaml
materials:
  - id: fig-venn            # 본문에서 참조할 키 (영문 소문자·숫자·하이픈)
    type: image             # 자료 종류 (아래 표)
    title: 전체집합 U와 집합 A   # 카드 제목
    group: 그림              # 패널 안 그룹 (탭)
    src: /blog/sample/set-basic.svg
    alt: 점선 사각형 U 안에 타원 A가 있고 …   # image는 필수!
    caption: 1, 2, 3은 A의 원소이고 7은 아니다.
    source: 자체 제작         # 출처 표기
```

### 4.2 타입별로 꼭 필요한 필드

| `type` | 용도 | 필수 | 자주 쓰는 선택 |
|---|---|---|---|
| `image` | 그림·도식 한 장 | `src`, `alt` | `caption`, `width`, `height`, `source` |
| `gallery` | 여러 장(현재는 image와 동일 렌더) | `src`, `alt` | `caption` |
| `pdf` | PDF 링크 | `src` | `caption` |
| `video` | 영상 링크 | `href` | `caption` |
| `code` | 코드 조각 | `body` | `caption` |
| `link` | 바깥 문서 링크 | `href` | `caption`, `source` |
| `note` | 짧은 텍스트 메모 | `body` | `source` |

**`alt`는 반드시 채우세요.** 화면 낭독기 사용자와 이미지가 안 보이는 환경을 위한 설명입니다. 검증에서 누락 시 오류가 납니다.

`width`/`height`를 적으면 이미지가 로드될 때 화면이 흔들리지 않습니다(CLS 방지). SVG는 적지 않아도 됩니다.

### 4.3 그룹으로 묶기

같은 `group` 값을 쓰면 패널 안에서 **탭으로 묶입니다.** 자료가 4개 이상이면 그룹을 나누는 것을 권합니다.

```yaml
materials:
  - id: fig-venn
    group: 그림          # ←
    …
  - id: note-symbols
    group: 정리          # ← 다른 그룹
    …
  - id: ref-wikipedia
    group: 바깥 자료      # ← 또 다른 그룹
    …
```

그룹이 하나뿐이면 탭 없이 그냥 목록으로 보입니다.

### 4.4 본문에서 자료로 연결하기 — `<FigureRef>`

자료를 만들어 두기만 하면 목록에는 나옵니다. **본문에서 "이 그림을 보라"고 가리키려면** 다음과 같이 씁니다.

```markdown
A의 모든 원소가 B에 속합니다.<FigureRef id="fig-subset" n={1}>그림으로 보기</FigureRef>
```

- `id` — `materials`에 적은 `id`와 **정확히 같아야** 합니다.
- `n` — 패널에 표시될 **번호**. `materials` 배열에서 몇 번째인지(1부터)와 같아야 합니다.
- 사이의 글자가 링크 라벨이 됩니다.

렌더 결과는 이렇게 됩니다: `① 그림으로 보기` — 클릭하면 **패널이 열리고 해당 자료로 스크롤 + 강조**됩니다. 다시 본문으로 돌아오려면 자료 카드 오른쪽의 `↩` 버튼을 누릅니다.

> `n`이 실제 순서와 다르면 검증(`npm run validate`)에서 오류로 잡아 줍니다.

### 4.5 이미지 파일은 어디에 두나

`public/` 폴더에 두고, `src`에는 **슬래시로 시작하는 경로**를 씁니다.

```
public/blog/<트랙>/<파일명>
        └ sample   └ set-basic.svg
                        ↓
src: /blog/sample/set-basic.svg
```

- 그림·도식은 **SVG**를 권장합니다(가볍고 확대해도 깨지지 않음).
- 사진은 JPG/PNG를 쓰되 가로 1600px 이하로 줄여서 올리세요.
- 파일명은 영문 소문자·하이픈을 권장합니다.

> 현재는 정적 파일로 서빙합니다(자동 리사이즈 없음). Astro 이미지 최적화(`astro:assets`)로의 전환은 M3에서 다룹니다.

---

## 5. 글 사이의 관계 적기 — `links`

목차 그래프(M4)의 재료입니다. **`id`는 `<트랙>/<슬러그>` 형식**으로 씁니다.

```yaml
links:
  requires:                 # 이 글을 이해하려면 먼저 읽어야 하는 글
    - sample/what-is-a-set
  applies: []               # 이 글의 개념이 응용되는 글
  related:                  # 연관된 글 (서로 적어 주는 것을 권장)
    - sample/set-operations
  cites: []                 # 참고한 외부 문헌
```

| 키 | 의미 | 방향 |
|---|---|---|
| `requires` | 선수 지식 | 강한 의존 (**순환 금지**) |
| `applies` | 개념 → 응용 | 강한 의존 (**순환 금지**) |
| `related` | 연관 | 약한 연결 (순환 허용) |
| `cites` | 인용 | 표시용 |

- `requires`/`applies`가 서로 순환하면(예: A→B→A) **검증에서 오류**가 납니다.
- `related`는 한쪽만 적어도 그래프가 자동으로 양방향 처리하지만, 검증이 역방향 누락을 경고로 알려 줍니다.

---

## 6. 검증하고 발행하기

```bash
npm run validate   # 프론트매터·링크·자료 검증 (오류 0이어야 통과)
npm run check      # 타입 검사 + 위 검증
npm run dev        # http://localhost:4321 에서 확인
```

| 명령 | 검사 내용 |
|---|---|
| `npm run validate` | 프론트매터 형식, 트랙 존재, `order` 중복, 슬러그 규칙, 링크 대상 존재, 선수 관계 순환, 자료 필수 필드, `FigureRef` 번호 일치 |
| `npm run check` | 위 + Astro/TypeScript 타입 검사 |

발행:

```bash
git add -A
git commit -m "post(sample): 새 글 제목"
git push
```

`push` 후 1~2분이면 `https://ppaong.github.io`에 반영됩니다. 초안으로만 두고 싶으면 `status: draft`로 쓰면 배포되지 않습니다.

### 발행 전 체크리스트

- [ ] `status: published` 인가
- [ ] `order`가 트랙 안에서 겹치지 않는가
- [ ] `summary`가 한 문장으로 정리되었는가
- [ ] 이미지 `alt`를 모두 채웠는가
- [ ] `<FigureRef>`의 `n`이 `materials` 순서와 맞는가
- [ ] `links.requires`가 실제로 존재하는 글인가
- [ ] `npm run validate`가 **오류 0**인가
- [ ] `npm run dev`에서 좌측 네비·우측 패널·이전/다음 글이 정상인가

---

## 7. 자주 하는 실수

| 증상 | 원인 | 해결 |
|---|---|---|
| 빌드가 `Expected a closing tag` 로 실패 | 본문에 `<` 또는 `{`를 그대로 씀 | `&lt;` 또는 `\lbrace`로 |
| 수식이 글자로 보임 | `$` 짝이 안 맞음 | `$...$` 개수를 확인 |
| 디스플레이 수식이 작고 왼쪽에 붙음 | `$$수식$$`을 한 줄에 씀 | `$$`를 단독 줄에 (3줄 형식) |
| 오른쪽 패널에 자료가 안 보임 | `materials`가 없거나 `status: draft` | 프론트매터 확인 |
| `①` 링크를 눌러도 아무 일이 없음 | `id` 오타 | `materials[].id`와 대조 |
| 글이 목록에 안 나옴 | `status: draft` | `published`로 |
| 검증에서 `R12` 오류 | 트랙이 `tracks.ts`에 없음 | 트랙 등록 |
| 좌측 네비 순서가 이상함 | `order` 값 문제 | 정수로 다시 지정 |

---

## 8. 참고할 실제 예

이 저장소에 있는 샘플 트랙을 그대로 참고하세요.

| 파일 | 무엇을 보여주는가 |
|---|---|
| `src/content/blog/sample/what-is-a-set.mdx` | 기본 구조, 수식, 표, Callout, 자료 3개(그림·정리·링크) |
| `src/content/blog/sample/subsets-and-equality.mdx` | `requires` 링크, `related` 양방향 |
| `src/content/blog/sample/set-operations.mdx` | 자료 3개 + 그룹, 본문에서 `FigureRef` 2회 참조, 드모르간 법칙 |
