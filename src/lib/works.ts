import { getCollection, type CollectionEntry } from 'astro:content';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export type Work = CollectionEntry<'works'>;

export async function getWorks(): Promise<Work[]> {
  const all = await getCollection('works', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function coverOf(w: Work): string | undefined {
  return w.data.cover || w.data.images?.[0]?.src || undefined;
}

// 封面裁切位置：後台可手動指定；未指定時，直式圖從上方裁（保留人物頭部與上半身），橫式置中
const FOCUS: Record<string, string> = { top: '50% 0%', upper: '50% 20%', center: '50% 50%', bottom: '50% 100%' };
const posCache = new Map<string, string>();

export async function coverPosition(w: Work): Promise<string> {
  const f = w.data.coverFocus;
  if (f && FOCUS[f]) return FOCUS[f];
  const src = coverOf(w);
  if (!src || /^https?:/i.test(src)) return FOCUS.center;
  if (posCache.has(src)) return posCache.get(src)!;
  let pos = FOCUS.center;
  try {
    const file = join(process.cwd(), 'public', decodeURI(src.split('?')[0]));
    if (existsSync(file)) {
      const sharp = (await import('sharp')).default;
      const { width, height } = await sharp(file).metadata();
      if (width && height && height > width * 1.05) pos = FOCUS.top;
    }
  } catch {
    // 讀不到尺寸就維持置中，不影響建置
  }
  posCache.set(src, pos);
  return pos;
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
