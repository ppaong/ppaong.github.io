#!/usr/bin/env node
/**
 * 콘텐츠 검증 (PLAN 8.3 R1~R15 중 프론트매터·링크 규칙)
 *
 * 실행: npm run validate  (= node scripts/validate-content.ts)
 * Node 22.6+ 의 TypeScript 지원을 사용하므로 별도 빌드가 필요 없다.
 *
 * 검증 항목
 *   R2  슬러그 형식 및 중복
 *   R3  links 대상 id 존재 (dangling 금지)
 *   R5  curriculum 레이어(requires/applies) 비순환
 *   R6  트랙 내 order 중복
 *   R8  related 한쪽만 선언 (경고 — 그래프 빌더가 자동 미러)
 *   R9  materials 무결성 (id 유일, 타입별 필수 필드)
 *   R11 고아 노드 (경고)
 *   R12 track 정의 일치
 *   R15 예약어 충돌
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { TRACKS } from '../src/data/tracks.ts';
import { isReserved } from '../src/data/reserved.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT_DIR = join(ROOT, 'src/content/blog');

type Level = 'error' | 'warn';
interface Issue {
  level: Level;
  rule: string;
  file: string;
  message: string;
}
const issues: Issue[] = [];
const add = (level: Level, rule: string, file: string, message: string): void => {
  issues.push({ level, rule, file, message });
};

interface Entry {
  file: string;
  rel: string;
  track: string;
  slug: string;
  url: string;
  data: Record<string, unknown>;
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === 'assets') return [];
      return walk(full);
    }
    return /\.(md|mdx)$/.test(name) ? [full] : [];
  });
}

function frontmatter(source: string): Record<string, unknown> | null {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const block = match?.[1];
  if (block === undefined) return null;
  const parsed = parseYaml(block);
  return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
}

// ── 수집 ────────────────────────────────────────────────
const files = walk(CONTENT_DIR).sort();
const entries: Entry[] = [];
const trackIds = new Set(TRACKS.map((t) => t.id));

for (const file of files) {
  const rel = relative(CONTENT_DIR, file);
  const parts = rel.split('/');
  const track = parts[0] ?? '';
  const slug = (parts.slice(1).join('/') || '').replace(/\.(md|mdx)$/, '');
  const source = readFileSync(file, 'utf8');
  const data = frontmatter(source);

  if (!data) {
    add('error', 'R1', rel, '프론트매터가 없습니다. --- 로 감싼 YAML 블록이 필요합니다.');
    continue;
  }

  // R15 / R2
  if (isReserved(track)) add('error', 'R15', rel, `트랙명 '${track}'은(는) 예약어입니다.`);
  if (isReserved(slug)) add('error', 'R15', rel, `슬러그 '${slug}'은(는) 예약어입니다.`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    add('error', 'R2', rel, `슬러그는 소문자/숫자/하이픈만 씁니다: '${slug}'`);
  }
  // R12
  if (!trackIds.has(track)) {
    add('error', 'R12', rel, `트랙 '${track}'이(가) src/data/tracks.ts 에 없습니다.`);
  }

  // R9 — materials
  const materials = Array.isArray(data.materials) ? (data.materials as Record<string, unknown>[]) : [];
  const seen = new Set<string>();
  materials.forEach((m, i) => {
    const where = `materials[${i}]`;
    const id = String(m.id ?? '');
    if (!id) add('error', 'R9', rel, `${where}: id 가 없습니다.`);
    if (seen.has(id)) add('error', 'R9', rel, `${where}: id '${id}' 가 중복됩니다.`);
    seen.add(id);

    const type = String(m.type ?? '');
    if (['image', 'gallery'].includes(type)) {
      if (!m.src) add('error', 'R9', rel, `${where}(${id}): image/gallery 는 src 가 필요합니다.`);
      if (!m.alt) add('error', 'R9', rel, `${where}(${id}): image/gallery 는 alt 가 필요합니다.`);
    }
    if (type === 'link' && !m.href) add('error', 'R9', rel, `${where}(${id}): link 는 href 가 필요합니다.`);
    if (type === 'note' && !m.body) add('error', 'R9', rel, `${where}(${id}): note 는 body 가 필요합니다.`);
  });

  // R9-b — 본문의 <FigureRef> 가 가리키는 자료가 실존하고, 번호가 순서와 맞는가
  for (const match of source.matchAll(/<FigureRef\s+id="([^"]+)"(?:\s+n=\{(\d+)\})?/g)) {
    const refId = match[1] ?? '';
    const refN = match[2];
    const idx = materials.findIndex((m) => String(m.id) === refId);
    if (idx === -1) {
      add('error', 'R9', rel, `<FigureRef id="${refId}"> 가 가리키는 자료가 materials 에 없습니다.`);
      continue;
    }
    if (refN !== undefined && Number(refN) !== idx + 1) {
      add(
        'error',
        'R9',
        rel,
        `<FigureRef id="${refId}" n={${refN}}> 의 번호가 materials 순서(${idx + 1})와 다릅니다.`,
      );
    }
  }

  entries.push({ file, rel, track, slug, url: `/blog/${track}/${slug}/`, data });
}

// ── R2 중복 ─────────────────────────────────────────────
const byUrl = new Map<string, string>();
for (const e of entries) {
  const prev = byUrl.get(e.url);
  if (prev) add('error', 'R2', e.rel, `URL '${e.url}' 가 ${prev} 와 중복됩니다.`);
  byUrl.set(e.url, e.rel);
}

// ── R6 order 중복 ───────────────────────────────────────
const byTrack = new Map<string, Entry[]>();
for (const e of entries) {
  const list = byTrack.get(e.track) ?? [];
  list.push(e);
  byTrack.set(e.track, list);
}
for (const [track, list] of byTrack) {
  const orders = new Map<number, string>();
  for (const e of list) {
    const order = Number(e.data.order);
    if (!Number.isInteger(order)) {
      add('error', 'R1', e.rel, `order 는 정수여야 합니다: ${String(e.data.order)}`);
      continue;
    }
    const prev = orders.get(order);
    if (prev) add('error', 'R6', e.rel, `트랙 '${track}' 안에서 order ${order} 가 ${prev} 와 중복됩니다.`);
    orders.set(order, e.rel);
  }
}

// ── 링크 무결성 ─────────────────────────────────────────
const known = new Set(entries.map((e) => `${e.track}/${e.slug}`));
const relationKeys = ['requires', 'applies', 'related', 'cites'] as const;
const incoming = new Map<string, Set<string>>();
const curriculum = new Map<string, string[]>();

for (const e of entries) {
  const self = `${e.track}/${e.slug}`;
  const links = (e.data.links ?? {}) as Record<string, unknown>;
  const edges: string[] = [];

  for (const key of relationKeys) {
    const raw = links[key];
    if (raw === undefined) continue;
    if (!Array.isArray(raw)) {
      add('error', 'R1', e.rel, `links.${key} 는 배열이어야 합니다.`);
      continue;
    }
    for (const target of raw) {
      const id = String(target);
      if (id === self) add('error', 'R4', e.rel, `links.${key} 에 자기 자신을 넣을 수 없습니다.`);
      if (!known.has(id)) {
        add('error', 'R3', e.rel, `links.${key} 의 '${id}' 를 찾을 수 없습니다.`);
        continue;
      }
      const set = incoming.get(id) ?? new Set<string>();
      set.add(self);
      incoming.set(id, set);
      if (key === 'requires' || key === 'applies') edges.push(id);
    }
  }
  curriculum.set(self, edges);
}

// ── R5 순환 검사 (requires + applies) ───────────────────
const WHITE = 0;
const GRAY = 1;
const BLACK = 2;
const color = new Map<string, number>();

function visit(node: string, path: string[]): void {
  color.set(node, GRAY);
  for (const next of curriculum.get(node) ?? []) {
    const c = color.get(next) ?? WHITE;
    if (c === GRAY) {
      const cycle = [...path, node, next].join(' → ');
      add('error', 'R5', node, `선수 관계에 순환이 있습니다: ${cycle}`);
      continue;
    }
    if (c === WHITE) visit(next, [...path, node]);
  }
  color.set(node, BLACK);
}
for (const e of entries) {
  const id = `${e.track}/${e.slug}`;
  if ((color.get(id) ?? WHITE) === WHITE) visit(id, []);
}

// ── R8 / R11 ────────────────────────────────────────────
for (const e of entries) {
  const self = `${e.track}/${e.slug}`;
  const related = ((e.data.links ?? {}) as Record<string, unknown>).related;
  if (Array.isArray(related)) {
    for (const target of related) {
      const t = String(target);
      const back = (entries.find((x) => `${x.track}/${x.slug}` === t)?.data.links ?? {}) as Record<
        string,
        unknown
      >;
      const backList = Array.isArray(back.related) ? back.related.map(String) : [];
      if (!backList.includes(self)) {
        add('warn', 'R8', e.rel, `related '${t}' 에 역방향 선언이 없습니다 (그래프 빌더가 자동 미러).`);
      }
    }
  }

  const links = (e.data.links ?? {}) as Record<string, unknown>;
  const hasOut = relationKeys.some((k) => Array.isArray(links[k]) && (links[k] as unknown[]).length > 0);
  const hasIn = (incoming.get(self)?.size ?? 0) > 0;
  if (!hasOut && !hasIn) {
    add('warn', 'R11', e.rel, '들어오는/나가는 링크가 없습니다 (고아 노드).');
  }
}

// ── 출력 ────────────────────────────────────────────────
const errors = issues.filter((i) => i.level === 'error');
const warns = issues.filter((i) => i.level === 'warn');

/**
 * 외부 도구(로컬 글 작성기)와 CI 가 기계적으로 읽는 인터페이스.
 * 이 형식은 **계약**이다 — 필드를 바꾸면 CONTRACT_VERSION 을 올린다.
 * docs/studio-plan.md 의 "코어 계약" 참고.
 */
const CONTRACT_VERSION = 1;

if (process.argv.includes('--json')) {
  const payload = {
    contractVersion: CONTRACT_VERSION,
    ok: errors.length === 0,
    summary: {
      posts: entries.length,
      tracks: byTrack.size,
      errors: errors.length,
      warnings: warns.length,
    },
    issues: issues.map((i) => ({
      level: i.level,
      rule: i.rule,
      file: i.file,
      message: i.message,
    })),
    // 글 인덱스 — 작성기가 목록/트리를 그리는 데 쓴다
    posts: entries.map((e) => ({
      id: `${e.track}/${e.slug}`,
      track: e.track,
      slug: e.slug,
      url: e.url,
      title: e.data.title,
      order: e.data.order,
      status: e.data.status,
      difficulty: e.data.difficulty ?? null,
      tags: e.data.tags ?? [],
      materialCount: Array.isArray(e.data.materials) ? e.data.materials.length : 0,
      updated: e.data.updated ?? e.data.created ?? null,
    })),
    tracks: [...byTrack.keys()].map((id) => ({
      id,
      postCount: (byTrack.get(id) ?? []).length,
    })),
  };
  console.log(JSON.stringify(payload, null, 2));
  if (errors.length > 0) process.exit(1);
} else {
  console.log(`\n콘텐츠 검증: 글 ${entries.length}편 / 트랙 ${byTrack.size}개\n`);
  for (const i of [...errors, ...warns]) {
    const mark = i.level === 'error' ? '✗' : '△';
    console.log(`${mark} [${i.rule}] ${i.file}\n    ${i.message}`);
  }
  console.log(`\n결과: 오류 ${errors.length} · 경고 ${warns.length}\n`);

  if (errors.length > 0) process.exit(1);
}
