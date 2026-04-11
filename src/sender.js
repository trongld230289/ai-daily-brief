/**
 * Send the formatted digest directly to Telegram
 */
export async function sendToWebhook(text) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN environment variable is not set');
  if (!chatId) throw new Error('TELEGRAM_CHAT_ID environment variable is not set');

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  // Telegram has a 4096 char limit per message — split if needed
  const chunks = [];
  for (let i = 0; i < text.length; i += 4000) {
    chunks.push(text.slice(i, i + 4000));
  }

  for (const chunk of chunks) {
    console.log('[Sender] Posting digest to Telegram...');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: chunk,
        parse_mode: 'Markdown',
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Telegram POST failed: ${res.status} ${res.statusText}\n${body}`);
    }
  }

  console.log('[Sender] Digest sent successfully to Telegram.');
}
