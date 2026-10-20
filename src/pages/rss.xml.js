import rss from '@astrojs/rss';
import site from '../data/site.json';
import { getWorks, plainExcerpt } from '../lib/works';

export async function GET(context) {
  const works = await getWorks();
  return rss({
    title: site.title,
    description: site.description,
    site: context.site ?? site.url,
    items: works.map((w) => ({
      title: w.data.title,
      pubDate: w.data.date,
      description: plainExcerpt(w, 200),
      link: `/works/${w.id}/`,
      categories: w.data.category ? [w.data.category] : [],
    })),
    customData: '<language>zh-TW</language>',
  });
}
