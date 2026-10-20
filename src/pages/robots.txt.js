import site from '../data/site.json';

export function GET(context) {
  const base = (context.site ?? new URL(site.url)).href.replace(/\/$/, '');
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap-index.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
