/**
 * formatter.js
 * Formats fetched data + AI summary into a clean HTML digest for Telegram.
 * Uses HTML parse_mode to avoid Markdown entity parse errors.
 */

function formatDate(date) {
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
}

/** Escape text content for Telegram HTML */
function escText(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Escape URL for use inside href="..." attribute */
function escUrl(url) {
  return String(url)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatHackerNewsItems(items) {
  if (!items.length) return '<i>Khong co tin tuc HackerNews hom nay.</i>\n';
  return items
    .map((item) => {
      const pts = item.points ? ` <i>(${item.points} pts)</i>` : '';
      const link = item.url
        ? `<a href="${escUrl(item.url)}">${escText(item.title)}</a>`
        : escText(item.title);
      return `- ${link}${pts}`;
    })
    .join('\n');
}

function formatArXivItems(papers) {
  if (!papers.length) return '<i>Khong co bai nghien cuu ArXiv hom nay.</i>\n';
  return papers
    .map((p) => {
      const link = p.url
        ? `<a href="${escUrl(p.url)}">${escText(p.title)}</a>`
        : escText(p.title);
      const abs = p.abstract
        ? `\n  <i>${escText(p.abstract.slice(0, 200).replace(/\n/g, ' '))}...</i>`
        : '';
      return `- ${link}${abs}`;
    })
    .join('\n');
}

function formatHuggingFaceItems(papers) {
  if (!papers.length) return '<i>Khong co trending papers HuggingFace hom nay.</i>\n';
  return papers
    .map((p) => {
      const link = p.url
        ? `<a href="${escUrl(p.url)}">${escText(p.title)}</a>`
        : escText(p.title);
      return `- ${link}`;
    })
    .join('\n');
}

/**
 * Build the final HTML digest for Telegram.
 */
export function formatDigest(fetchedData, summary, now = new Date()) {
  const { hackerNews, arxiv, huggingFace } = fetchedData;
  const dateStr = formatDate(now);

  const sections = [
    `<b>AI Daily Brief - ${escText(dateStr)}</b>`,
    '',
    '<b>Tin tuc noi bat (HackerNews)</b>',
    formatHackerNewsItems(hackerNews),
    '',
    '<b>Research Papers (ArXiv)</b>',
    formatArXivItems(arxiv),
    '',
    '<b>Trending tren HuggingFace</b>',
    formatHuggingFaceItems(huggingFace),
    '',
    '<b>Tom tat cua ngay</b>',
    escText(summary),
    '',
    '---',
    `<i>Tu dong tao luc ${escText(now.toISOString())}</i>`,
  ];

  return sections.join('\n');
}
