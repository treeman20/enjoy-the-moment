import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.string().optional().nullable(),
    summary: z.string().optional().nullable(),
    cover: z.string().optional().nullable(),
    tools: z.string().optional().nullable(),
    draft: z.boolean().optional().nullable().default(false),
    // 後台使用：一次上傳多張 + 每行一則圖說
    gallery: z.array(z.string()).optional().nullable(),
    captions: z.string().optional().nullable(),
    // 進階：逐張指定圖說（與 gallery 二擇一或並用）
    images: z
      .array(
        z.object({
          src: z.string(),
          caption: z.string().optional().nullable(),
        })
      )
      .optional()
      .nullable()
      .default([]),
  }).transform((d) => {
    const lines = (d.captions || '').split(/\r?\n/);
    const fromGallery = (d.gallery || []).filter(Boolean).map((src, i) => ({ src, caption: (lines[i] || '').trim() || null }));
    return { ...d, images: [...fromGallery, ...(d.images || [])] };
  }),
});

export const collections = { works };
