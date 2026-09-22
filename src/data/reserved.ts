/**
 * R15 검증용 예약어 목록 (PLAN 4장).
 * D2-b = B안(`/blog/` 격리)이므로 최상위 세그먼트 충돌 위험은 작지만,
 * `/blog/<track>/` 아래에서도 슬러그가 URL 세그먼트로 쓰이므로 함께 관리한다.
 */
export const RESERVED_SEGMENTS = [
  'blog',
  'portfolio',
  'search',
  'toc',
  'tracks',
  'privacy',
  'assets',
  'images',
  'pagefind',
  '_astro',
  'rss.xml',
  'sitemap-index.xml',
  'robots.txt',
  '404',
] as const;

export type ReservedSegment = (typeof RESERVED_SEGMENTS)[number];

/** 트랙명/슬러그가 예약어와 충돌하는지 검사한다. (M2의 validate-content에서 사용) */
export function isReserved(segment: string): boolean {
  return (RESERVED_SEGMENTS as readonly string[]).includes(segment);
}
