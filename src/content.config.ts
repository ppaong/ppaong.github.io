/**
 * 콘텐츠 컬렉션 정의 (PLAN 11장)
 *
 * 파일 위치가 곧 식별자다:
 *   src/content/blog/<track>/<slug>.mdx
 *   → entry.id = "<track>/<slug>"  → URL = /blog/<track>/<slug>/
 * 따라서 track/slug 는 프론트매터에 쓰지 않는다(중복·불일치 방지).
 * 대신 scripts/validate-content.mjs 가 트랙 존재 여부와 슬러그 규칙을 검사한다.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** 우측 패널에 표시할 보조 자료 1건 (9.3) */
const materialSchema = z.object({
  /** 본문에서 <FigureRef id="..." /> 로 참조하는 키. 페이지 내 유일 */
  id: z.string().regex(/^[a-z0-9-]+$/, '소문자/숫자/하이픈만 사용하세요'),
  type: z.enum(['image', 'gallery', 'pdf', 'video', 'code', 'link', 'note']),
  /** 패널에 표시할 제목 */
  title: z.string(),
  /** 패널 내 그룹(탭). 없으면 '자료' */
  group: z.string().optional(),
  caption: z.string().optional(),
  /** image/gallery 는 필수 (validate-content 가 강제) */
  alt: z.string().optional(),
  /** 이미지/PDF 경로. public/ 기준 절대경로 (예: /blog/sample/venn.svg) */
  src: z.string().optional(),
  /** link 타입의 대상 URL */
  href: z.string().optional(),
  /** note/code 타입의 본문 텍스트 */
  body: z.string().optional(),
  /** CLS 방지용 (이미지) */
  width: z.number().optional(),
  height: z.number().optional(),
  /** 출처/라이선스 표기 */
  source: z.string().optional(),
});

/** 그래프 간선 선언 (8.1). curriculum: 순환 금지 / annotation: 순환 허용 */
const linksSchema = z.object({
  requires: z.array(z.string()).optional(),
  applies: z.array(z.string()).optional(),
  related: z.array(z.string()).optional(),
  cites: z.array(z.string()).optional(),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    /** 트랙 내 정렬 순서. 중복 금지(검증) */
    order: z.number().int(),
    summary: z.string(),
    /** draft 는 로컬에서만 보인다 */
    status: z.enum(['draft', 'published', 'archived']),
    /** 1~5 */
    difficulty: z.number().int().min(1).max(5).optional(),
    tags: z.array(z.string()).default([]),
    created: z.coerce.date(),
    updated: z.coerce.date().optional(),
    links: linksSchema.optional(),
    materials: z.array(materialSchema).default([]),
  }),
});

export const collections = { blog };
