import fetch from 'node-fetch';

/**
 * Split text into chunks <= maxLen chars, breaking only on newlines.
 * Never cuts mid-line (and therefore never mid-HTML-tag).
 */
function splitIntoChunks(text, maxLen = 4000) {
  const lines = text.split('\n');
  const chunks = [];
  let current = '';

  for (const line of lines) {
    const addition = current.length ? '\n' + line : line;
    if (current.length + addition.length > maxLen) {
      if (current.length) chunks.push(current);
      // If a single line is longer than maxLen, split it hard
      if (line.length > maxLen) {
        for (let i = 0; i < line.length; i += maxLen) {
          chunks.push(line.slice(i, i + maxLen));
        }
        current = '';
      } else {
        current = line;
      }
    } else {
      current += addition;
    }
  }
  if (current.length) chunks.push(current);
  return chunks;
}

/**
 * Send the formatted digest to Telegram
 */
export async function sendDigest(text) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN environment variable is not set');
  if (!chatId) throw new Error('TELEGRAM_CHAT_ID environment variable is not set');

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const chunks = splitIntoChunks(text);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`[Sender] Chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: chunk,
        parse_mode: 'HTML',
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Telegram POST failed: ${res.status} ${res.statusText}\n${body}`);
    }
  }

  console.log('[Sender] Digest sent successfully to Telegram.');
}
