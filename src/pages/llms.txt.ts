import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { team, groups } from '../data/team';
import { excerptOf } from '../lib/excerpt';
import { clip, SITE } from '../lib/seo';

/**
 * Generates /llms.txt (https://llmstxt.org/) — a curated, Markdown index of the
 * site for LLM agents. Built from the content collections + team data so it
 * stays in sync automatically; no need to hand-edit when content is added.
 */
export const prerender = true;

const url = (p: string) => SITE + p;
const byDate = (a: any, b: any) => b.data.date - a.data.date;
const item = (title: string, href: string, desc?: string) =>
  `- [${title}](${href})${desc ? `: ${desc}` : ''}`;

export const GET: APIRoute = async () => {
  const [projects, news, blog, openSource, impacts] = await Promise.all([
    getCollection('projects'),
    getCollection('news'),
    getCollection('blog'),
    getCollection('open-source'),
    getCollection('impacts')
  ]);

  const list = (entries: any[], base: string) =>
    entries
      .sort(byDate)
      .map((e) => item(e.data.title, url(`${base}${e.id}/`), clip(excerptOf(e), 110)))
      .join('\n');

  const teamByGroup = groups
    .map((g) => {
      const members = team.filter((m) => m.group === g.heading);
      if (!members.length) return '';
      return `### ${g.heading}\n\n` + members.map((m) => item(m.name, url(`/author/${m.slug}/`), m.role)).join('\n');
    })
    .filter(Boolean)
    .join('\n\n');

  const outputs = [
    item('Publications', url('/outputs/publications/'), 'peer-reviewed papers from the group'),
    list(openSource, '/open-sources/'),
    list(impacts, '/impacts/')
  ]
    .filter(Boolean)
    .join('\n');

  const body = `# Citizen-Centric AI Systems (CCAIS)

> CCAIS is a research group at the University of Southampton, led by Professor Sebastian Stein and funded by a five-year UKRI Turing AI Acceleration Fellowship. It develops the fundamental science needed to build AI systems that citizens can trust — systems that put people at their heart, act in their interest, use incentives responsibly, and keep citizens in a feedback loop so they can audit and shape the decisions taken.

Research themes: citizen-centric AI, multi-agent systems, mechanism design, trustworthy and explainable AI, and fairness, with application areas in smart energy, smart transportation, buildings, and disaster response. The website is static HTML, so every page linked below is fully readable without running JavaScript.

## About

- [About CCAIS](${url('/about-us/')}): the group, its research challenges and achievements
- [Vision](${url('/about-us/vision/')}): the vision for trustworthy, citizen-centric AI
- [Applications](${url('/about-us/applications/')}): smart energy, smart transportation and disaster response
- [Our team](${url('/about-us/our-team/')}): the full team
- [Our partners](${url('/about-us/our-partners/')}): industrial and academic partners

## Projects

${list(projects, '/projects/')}

## News

${list(news, '/latest-news/')}

## Blog

${list(blog, '/uncategorised/')}

## Outputs

${outputs}

## Team

${teamByGroup}

## Optional

- [Contact CCAIS](${url('/contact-ccais/')}): email, phone and address
- [Join us](${url('/join-us/')}): PhD, internship, postdoc and collaboration opportunities
- [Partner with us](${url('/partner-with-us/')}): industrial collaboration
- [Seminar series](${url('/seminar-series/')}): monthly online seminar on citizen-centric AI
- [Search](${url('/search/')}): full-text site search
- [Sitemap](${url('/sitemap-index.xml')}): machine-readable list of all pages
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
