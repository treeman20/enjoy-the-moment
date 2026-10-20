import { getCollection, type CollectionEntry } from 'astro:content';

export type Work = CollectionEntry<'works'>;

export async function getWorks(): Promise<Work[]> {
  const all = await getCollection('works', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function coverOf(w: Work): string | undefined {
  return w.data.cover || w.data.images?.[0]?.src || undefined;
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function plainExcerpt(w: Work, len = 90): string {
  if (w.data.summary) return w.data.summary;
  const text = (w.body || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~\-]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > len ? text.slice(0, len) + '…' : text;
}
