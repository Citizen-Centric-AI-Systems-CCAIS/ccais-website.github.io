import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const base = z.object({
  title: z.string(),
  date: z.coerce.date(),
  image: z.string().optional(),
  // Optional credit for the header image, shown small at the foot of the page;
  // imageCreditUrl (e.g. the photographer's profile) turns the credit into a link.
  imageCredit: z.string().optional(),
  imageCreditUrl: z.string().optional(),
  excerpt: z.string().optional(),
  // Team slug (see src/data/team.ts). Adds a byline on the article and lists
  // the piece on the author's /author/<slug>/ page automatically.
  author: z.string().optional(),
  // Team members involved. Each entry is either a slug from src/data/team.ts
  // (links to that person's /author/<slug>/ page and lists the piece there), or
  // an inline { name, url? } for an external collaborator who has no CCAIS page.
  members: z.array(z.union([z.string(), z.object({ name: z.string(), url: z.string().optional() })])).optional()
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
