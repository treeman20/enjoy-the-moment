import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import site from './src/data/site.json' with { type: 'json' };

// 網站正式網址請在後台「網站設定」裡修改（src/data/site.json 的 url）
export default defineConfig({
  site: site.url,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: { format: 'directory' },
});
