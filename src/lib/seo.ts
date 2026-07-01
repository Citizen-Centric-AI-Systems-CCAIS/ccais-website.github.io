/**
 * Structured-data (JSON-LD) + meta helpers for SEO and LLM/agent readability.
 *
 * Base.astro emits the site-wide Organization entity on every page. The
 * per-page builders below (article / project / event / person) are called by
 * the detail templates and handed to Base via its `jsonld` prop, which renders
 * each as a <script type="application/ld+json"> in the <head>.
 */
export const SITE = 'https://www.ccais.ac.uk';

/** Absolute URL for a site-relative path (absolute URLs pass through unchanged). */
export const abs = (p?: string): string | undefined =>
  !p ? undefined : /^https?:\/\//.test(p) ? p : SITE + (p.startsWith('/') ? p : '/' + p);

/** Collapse whitespace and clip to ~n chars on a word boundary (for meta descriptions). */
export function clip(s?: string, n = 155): string {
  if (!s) return '';
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1).replace(/\s+\S*$/, '').trim() + '…';
}

const LOGO = abs('/wp-content/uploads/2023/09/CCAIS-logo-colour.svg')!;
const ORG_NAME = 'Citizen-Centric AI Systems (CCAIS)';
const publisher = {
  '@type': 'Organization',
  name: ORG_NAME,
  logo: { '@type': 'ImageObject', url: LOGO }
};

/** Site-wide Organisation entity — emitted on every page by Base.astro. */
export const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE}/#organisation`,
  name: ORG_NAME,
  alternateName: 'CCAIS',
  url: SITE,
  logo: LOGO,
  description:
    'A University of Southampton research group, led by Professor Sebastian Stein, conducting fundamental research into citizen-centric artificial intelligence systems.',
  parentOrganization: { '@type': 'CollegeOrUniversity', name: 'University of Southampton' },
  funder: { '@type': 'Organization', name: 'UK Research and Innovation (UKRI)' },
  sameAs: [
    'https://www.linkedin.com/company/ccais/',
    'https://www.youtube.com/@CCAIS_Soton',
    'https://github.com/Citizen-Centric-AI-Systems-CCAIS'
  ]
};

type Article = {
  type?: 'NewsArticle' | 'BlogPosting' | 'Article';
  title: string;
  description: string;
  image?: string;
  dateISO?: string;
  authorName?: string;
  path: string;
};
export function articleSchema(i: Article) {
  const o: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': i.type ?? 'Article',
    headline: i.title,
    name: i.title,
    description: i.description,
    inLanguage: 'en-GB',
    datePublished: i.dateISO,
    dateModified: i.dateISO,
    author: i.authorName ? { '@type': 'Person', name: i.authorName } : publisher,
    publisher,
    url: abs(i.path),
    mainEntityOfPage: abs(i.path)
  };
  if (i.image) o.image = [abs(i.image)];
  return o;
}

type Project = {
  title: string;
  description: string;
  image?: string;
  dateISO?: string;
  authorName?: string;
  contributors?: string[];
  path: string;
};
export function projectSchema(i: Project) {
  const o: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: i.title,
    headline: i.title,
    description: i.description,
    inLanguage: 'en-GB',
    dateCreated: i.dateISO,
    datePublished: i.dateISO,
    publisher,
    isPartOf: { '@id': `${SITE}/#organisation` },
    url: abs(i.path),
    mainEntityOfPage: abs(i.path)
  };
  if (i.image) o.image = [abs(i.image)];
  if (i.authorName) o.author = { '@type': 'Person', name: i.authorName };
  if (i.contributors && i.contributors.length)
    o.contributor = i.contributors.map((n) => ({ '@type': 'Person', name: n }));
  return o;
}

type Ev = { title: string; description: string; image?: string; startISO?: string; path: string };
export function eventSchema(i: Ev) {
  const o: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: i.title,
    description: i.description,
    startDate: i.startISO,
    organizer: { '@type': 'Organization', name: ORG_NAME, url: SITE },
    url: abs(i.path),
    mainEntityOfPage: abs(i.path)
  };
  if (i.image) o.image = [abs(i.image)];
  return o;
}

type Person = {
  name: string;
  role?: string;
  bio?: string;
  image?: string;
  path: string;
  sameAs?: string[];
};
export function personSchema(i: Person) {
  const o: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: i.name,
    url: abs(i.path),
    mainEntityOfPage: abs(i.path),
    worksFor: { '@id': `${SITE}/#organisation`, '@type': 'Organization', name: ORG_NAME },
    affiliation: { '@type': 'CollegeOrUniversity', name: 'University of Southampton' }
  };
  if (i.role) o.jobTitle = i.role;
  if (i.bio) o.description = clip(i.bio, 300);
  if (i.image) o.image = abs(i.image);
  if (i.sameAs && i.sameAs.length) o.sameAs = i.sameAs;
  return o;
}
