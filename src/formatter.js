/**
 * formatter.js
 * Formats fetched data + AI summary into a Telegram MarkdownV2 digest.
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

/**
 * Escape text for Telegram MarkdownV2.
 * Must escape: _ * [ ] ( ) ~ ` > # + - = | { } . !
 */
function esc(str) {
  return String(str).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

function formatHackerNewsItems(items) {
  if (!items.length) return '_Không có tin tức HackerNews hôm nay\\._\n';
  return items
    .map((item) => {
      const pts = item.points ? ` _\\(${item.points} pts\\)_` : '';
      const link = item.url
        ? `[${esc(item.title)}](${item.url})`
        : esc(item.title);
      return `\\- ${link}${pts}`;
    })
    .join('\n');
}

function formatArXivItems(papers) {
  if (!papers.length) return '_Không có bài nghiên cứu ArXiv hôm nay\\._\n';
  return papers
    .map((p) => {
      const link = p.url
        ? `[${esc(p.title)}](${p.url})`
        : esc(p.title);
      const abs = p.abstract
        ? `\n  _${esc(p.abstract.slice(0, 150).replace(/\n/g, ' '))}\\.\\.\\._`
        : '';
      return `\\- ${link}${abs}`;
    })
    .join('\n');
}

function formatHuggingFaceItems(papers) {
  if (!papers.length) return '_Không có trending papers HuggingFace hôm nay\\._\n';
  return papers
    .map((p) => {
      const link = p.url
        ? `[${esc(p.title)}](${p.url})`
        : esc(p.title);
      return `\\- ${link}`;
    })
    .join('\n');
}

/**
 * Build the final MarkdownV2 digest.
 */
export function formatDigest(fetchedData, summary, now = new Date()) {
  const { hackerNews, arxiv, huggingFace } = fetchedData;
  const dateStr = formatDate(now);

  const sections = [
    `🤖 *AI Daily Brief \\- ${esc(dateStr)}*`,
    '',
    '🔥 *Tin tức nổi bật*',
    formatHackerNewsItems(hackerNews),
    '',
    '📄 *Research Papers*',
    formatArXivItems(arxiv),
    '',
    '🤗 *Trending trên HuggingFace*',
    formatHuggingFaceItems(huggingFace),
    '',
    '💡 *Tóm tắt của ngày*',
    esc(summary),
    '',
    '\\-\\-\\-',
    `_Tự động tạo lúc ${esc(now.toISOString())}_`,
  ];

  return sections.join('\n');
}
