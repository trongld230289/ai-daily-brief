/**
 * formatter.js
 * Formats fetched data + AI summary into a clean Vietnamese markdown digest.
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

function formatHackerNewsItems(items) {
  if (!items.length) return '_Không có tin tức HackerNews hôm nay._\n';
  return items
    .map((item) => {
      const pts = item.points ? ` _(${item.points} pts)_` : '';
      const link = item.url ? `[${item.title}](${item.url})` : item.title;
      return `- ${link}${pts}`;
    })
    .join('\n');
}

function formatArXivItems(papers) {
  if (!papers.length) return '_Không có bài nghiên cứu ArXiv hôm nay._\n';
  return papers
    .map((p) => {
      const link = p.url ? `[${p.title}](${p.url})` : p.title;
      const abs = p.abstract ? `\n  > ${p.abstract.slice(0, 200).replace(/\n/g, ' ')}…` : '';
      return `- ${link}${abs}`;
    })
    .join('\n');
}

function formatHuggingFaceItems(papers) {
  if (!papers.length) return '_Không có trending papers HuggingFace hôm nay._\n';
  return papers
    .map((p) => {
      const link = p.url ? `[${p.title}](${p.url})` : p.title;
      return `- ${link}`;
    })
    .join('\n');
}

/**
 * Build the final markdown digest.
 *
 * @param {{ hackerNews: object[], arxiv: object[], huggingFace: object[] }} fetchedData
 * @param {string} summary  - AI-generated summary paragraph (Vietnamese)
 * @param {Date}   [now]    - Override date (useful for testing)
 * @returns {string}
 */
export function formatDigest(fetchedData, summary, now = new Date()) {
  const { hackerNews, arxiv, huggingFace } = fetchedData;
  const dateStr = formatDate(now);

  const sections = [
    `# 🤖 AI Daily Brief - ${dateStr}`,
    '',
    '## 🔥 Tin tức nổi bật',
    formatHackerNewsItems(hackerNews),
    '',
    '## 📄 Research Papers',
    formatArXivItems(arxiv),
    '',
    '## 🤗 Trending trên HuggingFace',
    formatHuggingFaceItems(huggingFace),
    '',
    '## 💡 Tóm tắt của ngày',
    summary,
    '',
    `---`,
    `_Được tạo tự động lúc ${now.toISOString()} bởi AI Daily Brief._`,
  ];

  return sections.join('\n');
}
