/**
 * sender.js
 * POSTs the digest to an OpenClaw webhook.
 */

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Send the digest to the OpenClaw webhook.
 *
 * @param {string} text          - The formatted digest markdown text
 * @param {string} webhookUrl    - The OpenClaw webhook URL (env: OPENCLAW_WEBHOOK_URL)
 * @returns {Promise<void>}
 */
export async function sendDigest(text, webhookUrl) {
  if (!webhookUrl) {
    throw new Error('OPENCLAW_WEBHOOK_URL environment variable is not set');
  }
  if (!text || !text.trim()) {
    throw new Error('Digest text is empty, nothing to send');
  }

  const payload = JSON.stringify({ text });
  console.log(`[sender] Sending digest (${text.length} chars) to webhook…`);

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Daily-Brief/1.0',
        },
        body: payload,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Webhook responded with ${res.status}: ${body.slice(0, 200)}`);
      }

      console.log(`[sender] Digest delivered successfully (HTTP ${res.status}).`);
      return;
    } catch (err) {
      lastError = err;
      console.error(`[sender] Attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
      if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS);
    }
  }

  throw new Error(`Failed to deliver digest after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}
