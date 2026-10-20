// 把作品裡的外部圖片（例如 Medium）下載到 public/media/works/<檔名>/，
// 轉成寬 1600px 以內的 WebP，並把文章裡的網址改成網站自己的路徑。
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const WORKS = 'src/content/works';
const MEDIA = 'public/media/works';
const files = (await readdir(WORKS)).filter((f) => f.endsWith('.md'));
let changed = 0;

for (const file of files) {
  const full = path.join(WORKS, file);
  let text = await readFile(full, 'utf8');
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) continue;
  const urls = [...new Set([...fm[1].matchAll(/https?:\/\/[^\s"']+\.(?:jpe?g|png|gif|webp|avif)/gi)].map((m) => m[0]))];
  if (!urls.length) continue;

  const stem = file.replace(/\.md$/, '');
  const dir = path.join(MEDIA, stem);
  await mkdir(dir, { recursive: true });
  let n = 0;
  for (const url of urls) {
    n += 1;
    const name = String(n).padStart(2, '0') + '.webp';
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (enjoy-the-moment image localizer)' } });
    if (!res.ok) { console.warn(`略過 ${url}：${res.status}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(dir, name));
    text = text.split(url).join(`/media/works/${stem}/${name}`);
  }
  await writeFile(full, text);
  changed += 1;
  console.log(`${file}：${n} 張`);
}
console.log(`完成，處理 ${changed} 篇`);
