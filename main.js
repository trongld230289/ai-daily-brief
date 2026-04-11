import { fetchAll } from './src/fetcher.js';
import { summarize } from './src/summarizer.js';
import { formatDigest } from './src/formatter.js';
import { sendDigest } from './src/sender.js';

const GITHUB_TOKEN = process.env.GH_TOKEN;
const DEBUG = process.env.DEBUG === 'true';

function validateEnv() {
  const missing = [];
  if (!GITHUB_TOKEN) missing.push('GH_TOKEN');
  if (!process.env.TELEGRAM_BOT_TOKEN) missing.push('TELEGRAM_BOT_TOKEN');
  if (!process.env.TELEGRAM_CHAT_ID) missing.push('TELEGRAM_CHAT_ID');
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

async function run() {
  console.log('========================================');
  console.log('  AI Daily Brief — starting pipeline');
  console.log(`  ${new Date().toISOString()}`);
  console.log('========================================');

  validateEnv();

  // Step 1: Fetch
  console.log('\n[pipeline] Step 1/4 — Fetching news…');
  const fetchedData = await fetchAll();
  const totalItems =
    fetchedData.hackerNews.length +
    fetchedData.arxiv.length +
    fetchedData.huggingFace.length;

  console.log(
    `[pipeline] Fetched: HN=${fetchedData.hackerNews.length}, ArXiv=${fetchedData.arxiv.length}, HF=${fetchedData.huggingFace.length} (total=${totalItems})`
  );

  if (totalItems === 0) {
    console.warn('[pipeline] No items fetched from any source. Proceeding with empty digest.');
  }

  if (DEBUG) {
    console.log('\n[debug] Fetched data:');
    console.log(JSON.stringify(fetchedData, null, 2));
  }

  // Step 2: Summarize
  console.log('\n[pipeline] Step 2/4 — Summarizing with GitHub Copilot API…');
  const summary = await summarize(fetchedData, GITHUB_TOKEN);

  if (DEBUG) {
    console.log('\n[debug] AI Summary:');
    console.log(summary);
  }

  // Step 3: Format
  console.log('\n[pipeline] Step 3/4 — Formatting digest…');
  const digest = formatDigest(fetchedData, summary);

  if (DEBUG) {
    console.log('\n[debug] Final digest:');
    console.log(digest);
  }

  // Step 4: Send
  console.log('\n[pipeline] Step 4/4 — Sending to Telegram…');
  await sendDigest(digest);

  console.log('\n========================================');
  console.log('  AI Daily Brief — pipeline complete!');
  console.log(`  ${new Date().toISOString()}`);
  console.log('========================================');
}

run().catch((err) => {
  console.error('\n[pipeline] FATAL ERROR:', err.message);
  if (DEBUG) console.error(err.stack);
  process.exit(1);
});
