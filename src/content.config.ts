import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const base = z.object({
  title: z.string(),
  date: z.coerce.date(),
  image: z.string().optional(),
  excerpt: z.string().optional(),
  // Team slug (see src/data/team.ts). Adds a byline on the article and lists
  // the piece on the author's /author/<slug>/ page automatically.
  author: z.string().optional()
});

const mk = (dir: string, schema = base) =>
  defineCollection({ loader: glob({ pattern: '**/*.md', base: `./src/content/${dir}` }), schema });

export const collections = {
  projects: mk('projects'),
  news: mk('news'),
  blog: mk('blog'),
  events: mk('events', base.extend({ eventDate: z.coerce.date() })),
  impacts: mk('impacts'),
  'open-source': mk('open-source')
};
