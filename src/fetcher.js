/**
 * fetcher.js
 * Fetches AI news from HackerNews, ArXiv RSS, and HuggingFace Papers.
 */

const YESTERDAY_TIMESTAMP = () => Math.floor(Date.now() / 1000) - 86400;

// ── HackerNews ──────────────────────────────────────────────────────────────

export async function fetchHackerNews() {
  const ts = YESTERDAY_TIMESTAMP();
  const url =
    `https://hn.algolia.com/api/v1/search?tags=story&query=AI+LLM` +
    `&hitsPerPage=10&numericFilters=created_at_i>${ts}`;

  console.log('[fetcher] Fetching HackerNews…');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HackerNews fetch failed: ${res.status} ${res.statusText}`);

  const data = await res.json();
  const items = (data.hits || []).map((h) => ({
    title: h.title || '(no title)',
    url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
    points: h.points ?? 0,
    author: h.author || '',
    created_at: h.created_at || '',
  }));

  console.log(`[fetcher] HackerNews: ${items.length} items`);
  return items;
}

// ── ArXiv RSS ───────────────────────────────────────────────────────────────

function parseXmlItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = (/<title>([\s\S]*?)<\/title>/.exec(block)?.[1] ?? '')
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1')
      .trim();
    const link = (/<link>([\s\S]*?)<\/link>/.exec(block)?.[1] ?? '').trim();
    const description = (/<description>([\s\S]*?)<\/description>/.exec(block)?.[1] ?? '')
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 500);
    if (title) items.push({ title, url: link, abstract: description });
    if (items.length >= 10) break;
  }
  return items;
}

export async function fetchArXiv() {
  const url = 'https://rss.arxiv.org/rss/cs.AI';
  console.log('[fetcher] Fetching ArXiv RSS…');
  const res = await fetch(url, {
    headers: { 'User-Agent': 'AI-Daily-Brief/1.0' },
  });
  if (!res.ok) throw new Error(`ArXiv fetch failed: ${res.status} ${res.statusText}`);

  const xml = await res.text();
  const items = parseXmlItems(xml);
  console.log(`[fetcher] ArXiv: ${items.length} items`);
  return items;
}

// ── HuggingFace Papers ───────────────────────────────────────────────────────

function parseHuggingFacePapers(html) {
  const papers = [];
  // Each paper card contains an <h3> with the title and an <a> with href
  const cardRegex =
    /<article[\s\S]*?<\/article>/g;
  let match;
  while ((match = cardRegex.exec(html)) !== null) {
    const card = match[0];
    // Extract title from <h3>
    const titleMatch = /<h3[^>]*>([\s\S]*?)<\/h3>/.exec(card);
    const title = titleMatch
      ? titleMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
      : null;
    // Extract href
    const hrefMatch = /href="(\/papers\/[^"]+)"/.exec(card);
    const url = hrefMatch ? `https://huggingface.co${hrefMatch[1]}` : null;
    if (title && url) {
      papers.push({ title, url });
    }
    if (papers.length >= 5) break;
  }
  return papers;
}

export async function fetchHuggingFacePapers() {
  const url = 'https://huggingface.co/papers';
  console.log('[fetcher] Fetching HuggingFace papers…');
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; AI-Daily-Brief/1.0)',
      Accept: 'text/html',
    },
  });
  if (!res.ok) throw new Error(`HuggingFace fetch failed: ${res.status} ${res.statusText}`);

  const html = await res.text();
  const papers = parseHuggingFacePapers(html);
  console.log(`[fetcher] HuggingFace: ${papers.length} papers`);
  return papers;
}

// ── Aggregate ────────────────────────────────────────────────────────────────

export async function fetchAll() {
  const results = await Promise.allSettled([
    fetchHackerNews(),
    fetchArXiv(),
    fetchHuggingFacePapers(),
  ]);

  const [hnResult, arxivResult, hfResult] = results;

  const hackerNews = hnResult.status === 'fulfilled' ? hnResult.value : [];
  const arxiv = arxivResult.status === 'fulfilled' ? arxivResult.value : [];
  const huggingFace = hfResult.status === 'fulfilled' ? hfResult.value : [];

  if (hnResult.status === 'rejected')
    console.error('[fetcher] HackerNews error:', hnResult.reason?.message);
  if (arxivResult.status === 'rejected')
    console.error('[fetcher] ArXiv error:', arxivResult.reason?.message);
  if (hfResult.status === 'rejected')
    console.error('[fetcher] HuggingFace error:', hfResult.reason?.message);

  return { hackerNews, arxiv, huggingFace };
}
