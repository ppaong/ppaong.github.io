// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// D5: 커스텀 도메인 미사용 → site 고정
export default defineConfig({
  site: 'https://ppaong.github.io',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [mdx(), sitemap()],
  devToolbar: {
    enabled: false,
  },
  // M2에서 추가 예정: remark-math + rehype-katex, Shiki 라이트/다크 이중 테마
});
