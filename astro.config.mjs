import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.ccais.ac.uk',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  redirects: {
    // Fix the old footer-only URLs so existing inbound links keep working.
    // The header (canonical) navigation points at the content archives:
    '/outputs/open-source': '/open-sources/',
    '/outputs/impact': '/impacts/',
    '/outputs': '/outputs/publications/'
  }
});
