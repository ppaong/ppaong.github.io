// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

/**
 * Markdown 프로세서 (Astro 7)
 * 기본값은 Rust 기반 Sätteri지만, remark/rehype 생태계(KaTeX)를 쓰기 위해
 * Unified 프로세서를 명시적으로 선택한다.
 * 참고: Astro 7에서 `markdown.remarkPlugins` 직접 지정은 deprecated.
 */
const processor = unified({
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
});

// D5: 커스텀 도메인 미사용 → site 고정
export default defineConfig({
  site: 'https://ppaong.github.io',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  markdown: {
    processor,
  },
  integrations: [mdx(), sitemap()],
  devToolbar: {
    enabled: false,
  },
});
