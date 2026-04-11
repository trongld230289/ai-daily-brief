/**
 * summarizer.js
 * Summarizes fetched content using the GitHub Copilot API (OpenAI-compatible).
 * Endpoint: https://models.inference.ai.azure.com
 * Model:    claude-ai/claude-sonnet-4-6
 */

const BASE_URL = 'https://models.inference.ai.azure.com';
const MODEL = 'claude-ai/claude-sonnet-4-6';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildPrompt({ hackerNews, arxiv, huggingFace }) {
  const lines = [];

  lines.push('Dưới đây là các tin tức và nghiên cứu AI mới nhất trong ngày. Hãy viết một bản tóm tắt hàng ngày bằng tiếng Việt, súc tích và dễ hiểu.\n');

  if (hackerNews.length > 0) {
    lines.push('=== TIN TỨC TỪ HACKER NEWS ===');
    for (const item of hackerNews) {
      lines.push(`- ${item.title} (${item.points} điểm)`);
      if (item.url) lines.push(`  URL: ${item.url}`);
    }
    lines.push('');
  }

  if (arxiv.length > 0) {
    lines.push('=== NGHIÊN CỨU TỪ ARXIV (cs.AI) ===');
    for (const paper of arxiv) {
      lines.push(`- ${paper.title}`);
      if (paper.abstract) lines.push(`  Tóm tắt: ${paper.abstract.slice(0, 300)}`);
      if (paper.url) lines.push(`  URL: ${paper.url}`);
    }
    lines.push('');
  }

  if (huggingFace.length > 0) {
    lines.push('=== PAPERS TRENDING TRÊN HUGGINGFACE ===');
    for (const paper of huggingFace) {
      lines.push(`- ${paper.title}`);
      if (paper.url) lines.push(`  URL: ${paper.url}`);
    }
    lines.push('');
  }

  lines.push(`
Yêu cầu định dạng đầu ra (bằng tiếng Việt):
1. Phần "Tóm tắt của ngày": Viết 2-3 đoạn văn tóm tắt toàn cảnh AI hôm nay, nêu bật xu hướng chính, các đột phá quan trọng và điểm đáng chú ý nhất.
2. Giữ giọng văn chuyên nghiệp nhưng dễ tiếp cận, phù hợp với kỹ sư phần mềm và nhà nghiên cứu AI Việt Nam.
3. Chỉ trả về phần văn bản tóm tắt, không thêm tiêu đề hay định dạng markdown.`);

  return lines.join('\n');
}

async function callCopilotAPI(prompt, token) {
  const payload = {
    model: MODEL,
    messages: [
      {
        role: 'system',
        content:
          'Bạn là một trợ lý AI chuyên tóm tắt tin tức công nghệ và nghiên cứu AI bằng tiếng Việt. ' +
          'Hãy viết súc tích, chính xác và dễ hiểu.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 1500,
    temperature: 0.7,
  };

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Copilot API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from Copilot API');
  return content.trim();
}

export async function summarize(fetchedData, token) {
  if (!token) throw new Error('GITHUB_TOKEN is required for summarizer');

  const { hackerNews, arxiv, huggingFace } = fetchedData;
  const totalItems = hackerNews.length + arxiv.length + huggingFace.length;

  if (totalItems === 0) {
    console.warn('[summarizer] No items to summarize, returning default message.');
    return 'Hôm nay không có tin tức AI đáng chú ý mới nào được thu thập.';
  }

  const prompt = buildPrompt(fetchedData);
  console.log(`[summarizer] Sending ${totalItems} items to Copilot API…`);

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const summary = await callCopilotAPI(prompt, token);
      console.log('[summarizer] Summary generated successfully.');
      return summary;
    } catch (err) {
      lastError = err;
      console.error(`[summarizer] Attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
      if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS);
    }
  }

  throw new Error(`Summarizer failed after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}
