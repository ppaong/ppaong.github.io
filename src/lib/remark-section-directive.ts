/**
 * `::section[fig-venn]` 디렉티브 → 본문 섹션 마커 변환 (remark 플러그인)
 *
 * 문법
 *   ::section[fig-venn]   섹션 시작. 자료 fig-venn 과 연결
 *   ::section[]           빈 섹션(자료 없음). 경계 역할만
 *
 * 의미
 *   마커는 **섹션의 시작**이다. 다음 마커 직전까지가 그 섹션 범위.
 *   같은 id 를 여러 번 호출할 수 있다(중복 허용).
 *
 * 렌더 결과
 *   <div class="section-marker" data-section-id data-section-index data-material-known>
 *     <span class="section-marker__num">1</span>
 *     <span class="section-marker__title">벤다이어그램</span>
 *   </div>
 *   → 이 요소가 클라이언트의 활성 섹션 판정 + 패널 연동의 앵커가 된다.
 *
 * 설계: docs/design/section-spec.md
 */
import { visit } from 'unist-util-visit';
import type { Root, RootContent, PhrasingContent } from 'mdast';
import type { ElementContent } from 'hast';
import type { Plugin } from 'unified';

interface DirectiveLike {
  type: string;
  name?: string;
  children?: RootContent[];
}

interface MarkerNode {
  type: 'paragraph';
  data: {
    hName: string;
    hProperties: Record<string, unknown>;
    hChildren: ElementContent[];
  };
  children: PhrasingContent[];
}

/** mdast 는 hName/hProperties/hChildren 를 타입에 두지 않으므로 캐스팅해서 붙인다 */

interface FrontmatterMaterial {
  id?: string;
  title?: string;
}

const isSectionDirective = (node: unknown): node is DirectiveLike => {
  const candidate = node as DirectiveLike | null;
  if (!candidate || typeof candidate !== 'object') return false;
  if (
    candidate.type !== 'leafDirective' &&
    candidate.type !== 'containerDirective' &&
    candidate.type !== 'textDirective'
  ) {
    return false;
  }
  return candidate.name === 'section';
};

/** `fig-venn`, `#fig-venn`, `{fig-venn}` 어느 형태로 써도 받아준다 */
function normalizeId(raw: string): string {
  return raw.trim().replace(/^#/, '').replace(/^\{/, '').replace(/\}$/, '').toLowerCase();
}

function textOf(node: DirectiveLike): string {
  return (node.children ?? [])
    .map((child) => (child && 'value' in child && typeof child.value === 'string' ? child.value : ''))
    .join('');
}

function span(className: string, value: string): ElementContent {
  return {
    type: 'element',
    tagName: 'span',
    properties: { className: [className] },
    children: [{ type: 'text', value }],
  } as ElementContent;
}

function buildMarker(id: string, index: number, title: string | undefined): MarkerNode {
  return {
    type: 'paragraph',
    data: {
      hName: 'div',
      hProperties: {
        className: ['section-marker'],
        'data-section-id': id,
        'data-section-index': String(index),
        'data-material-known': title ? 'true' : 'false',
      },
      hChildren: [
        span('section-marker__num', String(index)),
        span('section-marker__title', title ?? (id ? `알 수 없는 자료: ${id}` : '자료 없음')),
      ],
    },
    children: [],
  };
}

const remarkSectionDirective: Plugin<[], Root> = () => {
  return (tree, file) => {
    const frontmatter = (
      file.data as { astro?: { frontmatter?: { materials?: FrontmatterMaterial[] } } }
    )?.astro?.frontmatter;
    const materials = Array.isArray(frontmatter?.materials) ? frontmatter.materials : [];

    const titleById = new Map<string, string>();
    for (const material of materials) {
      if (material?.id) titleById.set(material.id, material.title ?? material.id);
    }

    let counter = 0;

    visit(tree, (node, index, parent) => {
      if (!isSectionDirective(node)) return;
      if (index === undefined || index === null || !parent) return;

      const id = normalizeId(textOf(node));
      counter += 1;
      const marker = buildMarker(id, counter, id ? titleById.get(id) : undefined);

      const siblings = parent.children as unknown as RootContent[];
      if (node.type === 'containerDirective') {
        // `:::section[id]` 로 쓴 경우: 마커 + 내부 내용을 그대로 이어 붙인다
        const inner = (node.children ?? []) as RootContent[];
        siblings.splice(index, 1, marker as unknown as RootContent, ...inner);
        return ['skip', index + 1 + inner.length];
      }

      siblings.splice(index, 1, marker as unknown as RootContent);
      return ['skip', index + 1];
    });
  };
};

export default remarkSectionDirective;
