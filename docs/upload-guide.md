# 글 업로드 전체 절차 (도구 없이, raw)

로컬 글 작성기를 쓰지 않고 **손으로** 글을 작성해서 사이트에 올리는 전체 과정입니다.
맥/윈도우 공통이며, 명령은 터미널(PowerShell·zsh)에서 실행합니다.

> 글의 **내용 규칙**(프론트매터 필드, 수식 표기, 자료 타입)은 `docs/authoring.md`에 있습니다.
> 이 문서는 **"처음부터 배포까지의 순서와 명령"** 을 다룹니다.

---

## 0. 전체 흐름

```
① 저장소 클론 (최초 1회)
② git pull  ─ 최신 상태로
③ 파일 생성  src/content/blog/<트랙>/<슬러그>.mdx
④ 내용 작성  프론트매터 + 보조자료(materials) + 본문 + 섹션 마커(::section[...])
⑤ 이미지 준비  public/blog/<트랙>/ 에 저장
⑥ 로컬 확인  npm run dev  → http://localhost:4321
⑦ 검증      npm run validate   (오류 0 필수)
⑧ 커밋·푸시  git add → commit → push
⑨ 배포 확인  GitHub Actions 1~2분 → https://ppaong.github.io
```

---

## 1. 최초 1회 준비

### 1.1 필요한 도구

| 도구 | 확인 명령 | 없으면 |
|---|---|---|
| Git | `git --version` | https://git-scm.com |
| Node.js 22.12+ | `node -v` | https://nodejs.org (LTS) |

### 1.2 저장소 클론

```bash
cd ~/Documents            # 윈도우: cd %USERPROFILE%\Documents
git clone https://github.com/ppaong/ppaong.github.io.git
cd ppaong.github.io
npm install               # 최초 1회 (또는 package.json 변경 시)
```

### 1.3 git 인증 (한 번만 설정하면 유지)

이미 설정되어 있다면 건너뜁니다. 확인:

```bash
cd ~/Documents/ppaong.github.io
git config --get user.name      # ppaong 이어야 함
git remote -v                   # origin 이 https://ppaong@github.com/... 인지
```

원격 URL에 **`ppaong@`가 포함되어 있어야** 올바른 계정의 토큰을 씁니다.

```bash
git remote set-url origin https://ppaong@github.com/ppaong/ppaong.github.io.git
git config --global user.name  "ppaong"
git config --global user.email "munboseog@gmail.com"
```

PAT를 다시 입력하고 싶을 때(키체인 초기화 후 첫 push):

```bash
git -c credential.helper= push -u origin main
# Username 은 URL에 ppaong@ 로 들어있어 묻지 않습니다. Password 에 PAT 붙여넣기
```

> ⚠️ **PAT 권한**: classic이면 `repo` + **`workflow`**, fine-grained면 `Contents: Read and write` + **`Workflows: Read and write`**.
> `workflow`가 없으면 **`.github/workflows/deploy.yml`이 포함된 커밋에서 403**이 납니다.

---

## 2. 매번: 최신 상태로 만들기

```bash
cd ~/Documents/ppaong.github.io
git pull --rebase
```

작성 중인 파일이 있으면 먼저 커밋하거나 `git stash` 하세요.

---

## 3. 글 파일 만들기

### 3.1 이미 있는 트랙에 글 추가

파일 경로가 곧 URL입니다.

```
src/content/blog/<트랙>/<슬러그>.mdx
                 └ sample      └ what-is-a-set
                            ↓
        https://ppaong.github.io/blog/sample/what-is-a-set/
```

- **트랙**: `src/data/tracks.ts`에 등록된 id (예: `sample`)
- **슬러그**: 영문 소문자·숫자·하이픈. **공백·한글·대문자 사용 금지**
- 확장자는 `.mdx`를 권장(수식·컴포넌트 사용 가능). 순수 마크다운만 쓸 거면 `.md`도 됩니다.

```bash
# 예: sample 트랙에 새 글
mkdir -p src/content/blog/sample
code src/content/blog/sample/my-new-post.mdx      # VS Code 기준
# 또는
nano src/content/blog/sample/my-new-post.mdx
```

### 3.2 새 트랙(챕터) 만들기

> 현재 트랙 정의는 **코드 파일**(`src/data/tracks.ts`)입니다. M4에서 JSON으로 옮길 예정입니다.

1. `src/data/tracks.ts`를 엽니다.

```ts
export const TRACKS: Track[] = [
  {
    id: 'sample',                        // ← 폴더 이름과 반드시 같아야 함
    title: '샘플: 집합론',
    summary: '고등학교 수준의 집합론을 짧게 정리합니다.',
    difficulty: 1,                       // 1~5
    status: 'in-progress',               // planned | in-progress | stable | archived
  },
  // ▼ 여기에 새 트랙을 추가
  {
    id: 'algorithms',
    title: '알고리즘',
    summary: '복잡도부터 그래프 탐색까지',
    difficulty: 2,
    status: 'planned',
  },
];
```

2. 같은 이름의 폴더를 만듭니다.

```bash
mkdir -p src/content/blog/algorithms
```

주의사항:
- `id`는 **예약어**와 겹치면 안 됩니다(`toc`, `tracks`, `search`, `portfolio`, `privacy`, …). `src/data/reserved.ts` 참조
- `id`는 **발행 후 바꾸지 않습니다**(URL이 바뀜)
- 검증에서 `R12`(트랙 미등록), `R15`(예약어) 오류로 잡힙니다

---

## 4. 내용 작성

### 4.1 프론트매터 (파일 맨 위)

```yaml
---
title: 동적 계획법 입문
order: 1
summary: 중복 부분문제와 최적 부분구조로 DP를 설명합니다.
status: published          # 처음엔 draft 로 두고 마지막에 published 로 바꿔도 됩니다
difficulty: 2
tags: [dp, 재귀, 메모이제이션]
created: 2026-09-24
materials: []
---
```

필드 설명은 `docs/authoring.md` 2장. **`track`과 `slug`는 쓰지 않습니다**(경로에서 자동 결정).

### 4.2 본문

```markdown
## 개념

문장 안의 수식은 $f(n) = f(n-1) + f(n-2)$ 처럼 씁니다.

$$
T(n) = T(n-1) + O(1)
$$

<Callout type="tip" title="기억할 것">
디스플레이 수식은 `$$`를 **단독 줄**에 써야 가운데 정렬됩니다.
</Callout>
```

### 4.3 보조자료(부가 문서) 작성

우측 패널에 들어갈 자료를 **프론트매터의 `materials` 배열**에 씁니다. 적은 순서가 곧 패널 번호(1, 2, 3…)입니다.

```yaml
materials:
  # ① 그림
  - id: fig-trace            # 본문에서 참조할 키
    type: image
    title: 재귀 호출 트리
    group: 그림               # 패널 안 그룹 탭
    src: /blog/sample/recursion-tree.svg
    alt: f(5)가 f(4)와 f(3)으로 갈라지는 재귀 호출 트리 그림
    caption: 같은 부분문제가 여러 번 계산된다.
    source: 자체 제작

  # ② 텍스트 메모
  - id: note-complexity
    type: note
    title: 시간 복잡도
    group: 정리
    body: "메모이제이션 없이 O(2ⁿ), 있으면 O(n)."

  # ③ 바깥 링크
  - id: ref-wiki
    type: link
    title: 위키백과 — 동적 계획법
    group: 바깥 자료
    href: https://ko.wikipedia.org/wiki/동적_계획법
```

**타입별 필수 필드** (빠지면 검증에서 `R9` 오류)

| type | 필수 | 설명 |
|---|---|---|
| `image` / `gallery` | `src`, `alt` | 그림·도식 |
| `link` / `video` | `href` | 바깥 링크 |
| `note` / `code` | `body` | 짧은 텍스트·코드 |
| `pdf` | `src` | PDF |

**본문에서 자료를 가리키기** — `<FigureRef>`:

```markdown
같은 부분문제가 반복됩니다.<FigureRef id="fig-trace" n={1}>그림으로 보기</FigureRef>
```

- `id`는 `materials[].id`와 정확히 같아야 합니다
- `n`은 **배열에서 몇 번째인지(1부터)** 와 같아야 합니다 → 틀리면 검증 오류

### 4.6 본문 섹션 표시 — `::section[...]` (따라오기 모드)

보조자료를 **본문 어느 구간에서 보여줄지** 정합니다.

```markdown
::section[fig-trace]        ← 섹션 1 시작 (자료 fig-trace 연결)

## 재귀 호출

본문 1

::section[note-complexity]  ← 섹션 2 시작. 여기서 섹션 1이 끝난다

## 메모이제이션

본문 2

::section[]                 ← 빈 섹션 (경계 역할만)

## 연습 문제
```

- **단독 줄**에 씁니다. 빈 섹션은 `::section[]`
- 같은 자료를 여러 번 불러도 됩니다(중복 허용)
- 없는 id를 쓰면 빈 섹션으로 처리됩니다(검증 경고 `R16`)
- 마커가 없으면 **전체 목록 모드**로 동작합니다(기존과 동일)

이 마커가 있으면 우측 패널이 **따라오기**로 동작해, 읽는 구간에 맞춰 자료가 바뀝니다.
자세한 규칙과 화면 동작은 `docs/authoring.md` 4.6 참조.

---

## 5. 이미지·파일 업로드

### 5.1 어디에 두는가

```
public/blog/<트랙>/<파일명>
        └ sample     └ recursion-tree.svg
                        ↓
   materials 의 src: /blog/sample/recursion-tree.svg
```

`public/` 아래 파일은 **빌드 시 그대로 복사**되어 `/파일경로` 로 접근됩니다.
`src/content/blog/...` 폴더가 아닙니다 — 헷갈리기 쉬운 지점입니다.

```bash
mkdir -p public/blog/algorithms
cp ~/Desktop/recursion-tree.svg public/blog/algorithms/
```

### 5.2 파일 형식과 크기

| 종류 | 권장 | 비고 |
|---|---|---|
| 도식·차트·수식 그림 | **SVG** | 가볍고 확대해도 깨지지 않음. 직접 만들거나 도구로 내보내기 |
| 사진·스크린샷 | PNG / JPG | **가로 1600px 이하**로 줄이기 |
| 용량 | **1.5MB 이하** | 넘으면 검증에서 경고(`R14`) |

**macOS에서 이미지 줄이기** (내장 `sips` 사용):

```bash
# 가로 1600px로 줄이고 JPEG 품질 70으로 저장
sips -Z 1600 input.png --out output.jpg -s format jpeg -s formatOptions 70

# 결과 확인
ls -lh output.jpg
```

**Windows** — 그림판(크기 조정) 또는 PowerShell:

```powershell
# ImageMagick 설치 시
magick input.png -resize 1600x -quality 70 output.jpg
```

### 5.3 파일명 규칙

- 영문 소문자·숫자·하이픈: `recursion-tree.svg`
- 공백·한글은 피하세요(URL 인코딩 문제)
- 같은 폴더에서 이름이 겹치면 나중 파일이 덮어씁니다

---

## 6. 로컬에서 확인

```bash
npm run dev
```

→ http://localhost:4321 접속 → 좌측 네비에서 글을 찾아 클릭합니다.

확인할 것:

| 위치 | 확인 |
|---|---|
| 본문 | 수식이 제대로 렌더되는가(작게 나오면 `$$` 3줄 형식 확인) |
| 우측 패널 **문서 안내** 탭 | `##` 소제목이 목차로 들어갔는가, 스크롤하면 활성 표시가 따라오는가 |
| 우측 패널 **자료** 탭 | 자료 카드와 그룹 탭이 보이는가, 이미지가 뜨는가 |
| 본문의 `① 그림으로 보기` | 클릭하면 패널이 열리고 그 자료로 이동하는가 |
| 이미지 클릭 | 확대(라이트박스)되고 좌우 이동이 되는가 |
| 이전/다음 글 | 트랙 순서대로 연결되는가 |

빌드 결과까지 확인하려면:

```bash
npm run build && npm run preview   # http://localhost:4321
```

---

## 7. 검증 (커밋 전 필수)

```bash
npm run validate
```

```
콘텐츠 검증: 글 4편 / 트랙 2개

✗ [R3] sample/my-new-post.mdx
    links.requires 의 'sample/does-not-exist' 를 찾을 수 없습니다.

결과: 오류 1 · 경고 0
```

오류 메시지 읽는 법:

| 규칙 | 뜻 | 해결 |
|---|---|---|
| `R2` | 슬러그 형식 오류 | 소문자·숫자·하이픈만 |
| `R3` | 링크 대상이 없음 | `links`의 id를 실제 글과 대조 |
| `R4` | 자기 자신을 링크 | 제거 |
| `R5` | 선수 관계 순환 | `requires`/`applies` 방향 재검토 |
| `R6` | `order` 중복 | 트랙 내 번호 조정 |
| `R9` | 자료 필수 필드 누락 / `FigureRef` 번호 불일치 | `alt`, `src`, `href`, `body`, `n` 확인 |
| `R12` | 트랙이 `tracks.ts`에 없음 | 트랙 등록 |
| `R15` | 예약어 충돌 | 다른 이름 사용 |

**오류 0**이 될 때까지 고친 뒤 커밋합니다. 타입 검사까지 한 번에 하려면 `npm run check`.

---

## 8. 커밋하고 올리기

```bash
git add -A
git commit -m "post(algorithms): 동적 계획법 입문"
git push
```

`git add` 로 포함되는 파일을 한 번 확인하는 습관을 권합니다:

```bash
git status --short
```

> ⚠️ `.github/workflows/` 아래 파일이 실수로 변경되면 push가 거부될 수 있습니다(workflow 스코프).

---

## 9. 배포 확인

`push` 후 **1~2분** 뒤 반영됩니다.

1. https://github.com/ppaong/ppaong.github.io/actions 에서 `Deploy to GitHub Pages` 실행이 **초록**인지 확인
2. `https://ppaong.github.io/blog/<트랙>/<슬러그>/` 접속
3. 안 보이면 **캐시**를 의심 → 새로고침(Shift+Reload), 시크릿 창

> Actions가 빨간색이면 해당 실행을 열어 로그를 봅니다. 대부분 `npm run check`(검증) 실패입니다.

---

## 10. 초안으로만 두기

`status: draft` 로 쓰면 **로컬(`npm run dev`)에서는 보이지만 배포되지 않습니다.**
완성되면 `published`로 바꾸고 커밋·푸시하면 됩니다.

---

## 11. 글 수정하기

1. 파일을 열어 내용을 고칩니다
2. 프론트매터에 `updated: 2026-09-30` 을 추가/갱신합니다(글 머리에 "수정" 날짜로 표시됨)
3. `npm run validate` → `git add -A && git commit -m "post(sample): 제목 — 오타 수정" && git push`

**슬러그(파일명)는 바꾸지 마세요.** URL이 바뀌어 외부 링크와 검색 색인이 깨집니다.
정말 바꿔야 한다면 먼저 알려주세요 — **리다이렉트를 등록해야** 합니다(현재 미구현).

---

## 12. 글 삭제하기

```bash
git rm src/content/blog/sample/old-post.mdx
# 이미지도 함께 지운다면
git rm public/blog/sample/old-post-diagram.svg
npm run validate          # ← 다른 글이 이 글을 링크하고 있으면 R3 오류로 알려줌
git commit -m "post(sample): old-post 삭제"
git push
```

git 이력에 남으므로 **복구할 수 있습니다**(`git revert`).

---

## 13. 자주 겪는 문제

| 증상 | 원인 | 해결 |
|---|---|---|
| push가 **403** | 토큰이 다른 계정 것 / `workflow` 스코프 없음 | `docs/PLAN.md` 13장, 토큰 재확인 |
| push 거부: `refusing to allow a Personal Access Token … workflow` | `workflow` 스코프 누락 | 토큰에 스코프 추가 |
| MDX: `Expected a closing tag` | 본문에 `<` 또는 `{`를 그대로 씀 | `&lt;`, `\lbrace` 사용 |
| 수식이 작게/왼쪽에 붙음 | `$$수식$$`을 한 줄에 씀 | `$$`를 단독 줄에 (3줄 형식) |
| 수식이 글자로 보임 | `$` 짝이 안 맞음 | `$` 개수 확인 |
| 패널에 자료가 없음 | `materials` 누락 / `status: draft` | 프론트매터 확인 |
| `①` 링크 클릭해도 반응 없음 | `id` 오타 | `materials[].id`와 대조 |
| 목록에 글이 안 나옴 | `status: draft` | `published` |
| 이미지가 안 뜸 | `public/` 이 아닌 곳에 둠 | `public/blog/<트랙>/` 로 이동 |
| 배포했는데 안 바뀜 | CDN 캐시 | 1~2분 대기, 강력 새로고침 |

---

## 14. 이 과정이 나중에 작성기에서 어떻게 바뀌는가

로컬 글 작성기(스튜디오)는 이 문서의 **3~9단계를 GUI로 대체**합니다.

| 지금 (raw) | 작성기에서 |
|---|---|
| 3. 파일·폴더 직접 생성 | "새 글" 버튼 |
| 4.1 프론트매터 손으로 작성 | 폼 입력 (필드 검증 포함) |
| 4.2 `$$` 3줄 형식 주의 | 수식 삽입 버튼이 자동으로 형식 생성 |
| 4.3 `materials` 손으로 작성 + 번호 맞추기 | 자료 카드 UI + **번호 자동 계산** |
| 4.6 `::section[...]` 마커를 손으로 배치 | **섹션 추가 버튼** + 자료 선택 드롭다운 |
| 5. `public/` 에 파일 복사 + `src` 경로 손입력 | **드래그&드롭 업로드** → 경로 자동 입력 |
| 6. `npm run dev` 후 눈으로 확인 | 내장 미리보기 + **뷰포트 전환** |
| 7. `npm run validate` | 저장 시 자동 검증, 문제 위치 표시 |
| 8. git 명령 | "발행" 버튼 (검증 통과 시에만 커밋) |
| 새 트랙 추가 = 코드 편집 | 트랙 관리 화면 |

단, **검증 규칙과 파일 규약은 동일**합니다. 작성기도 같은 `npm run validate:json` 계약을 호출합니다
(`docs/studio-plan.md` 3장).
