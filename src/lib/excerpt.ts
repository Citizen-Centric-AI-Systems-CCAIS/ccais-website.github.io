/**
 * Derive a listing excerpt from an entry. If the Markdown file declares an
 * `excerpt` in its frontmatter that takes precedence; otherwise the first
 * paragraph of the body is used (stripped of HTML/Markdown syntax).
 */
export function excerptOf(entry: { data: { excerpt?: string }; body?: string }, max = 300): string {
  if (entry.data.excerpt) return entry.data.excerpt;
  const body = entry.body ?? '';
  const para = body
    .split(/\n\s*\n/)
    .map((p) =>
      p
        .replace(/<[^>]+>/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/\\([\\`*_{}\[\]()#+\-.!>~|])/g, '$1')
        .replace(/[#>*_`]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .find((p) => p.length > 40);
  const flat = para ?? '';
  return flat.length > max ? flat.slice(0, max).trimEnd() + '…' : flat;
}
