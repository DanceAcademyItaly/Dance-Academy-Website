import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const episodes = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/episodes' }),
  schema: z.object({
    id: z.number(),
    season: z.number(),
    seasonName: z.string(),
    title: z.string(),
    slug: z.string(),
    mainVideoId: z.string(),
    choreographies: z.array(z.object({
      title: z.string(),
      videoId: z.string(),
    })),
    thumbnail: z.string().optional(),
  }),
});

export const collections = { episodes };
