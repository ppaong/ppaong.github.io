/**
 * 사이트 전역 메타데이터.
 * 값은 여기서만 관리하고 컴포넌트에 하드코딩하지 않는다.
 */
export const SITE = {
  title: 'ppaong',
  tagline: '배운 것을 정리하는 블로그',
  description:
    '알고리즘과 수학을 처음부터 다시 정리하는 개인 블로그. 강좌(트랙) 단위로 글을 묶고, 글 사이의 선수·후속 관계를 그래프로 보여줍니다.',
  url: 'https://ppaong.github.io',
  lang: 'ko',
  locale: 'ko_KR',
  author: {
    name: 'ppaong',
    // M6(포트폴리오)에서 채운다
    email: '',
    github: 'https://github.com/ppaong',
  },
} as const;

/**
 * 좌측 네비게이션 고정 블록 (PLAN 5.1)
 * `status: 'planned'` 인 항목은 링크를 렌더하지 않는다 (404 방지).
 * 해당 페이지를 만들면 'ready'로 바꾼다.
 */
export const NAV = [
  { label: '블로그', href: '/', status: 'ready' },
  { label: '목차', href: '/blog/toc/', status: 'planned' },
  { label: '트랙', href: '/blog/tracks/', status: 'planned' },
  { label: '검색', href: '/search/', status: 'planned' },
  { label: '포트폴리오', href: '/portfolio/', status: 'planned' },
] as const;

/** 레이아웃 상수 (CSS 토큰과 값을 맞춰 둔다) */
export const LAYOUT = {
  navWidth: 260,
  panelWidth: 380,
  panelMin: 320,
  panelMax: 560,
  proseMax: 704, // 44rem
} as const;
