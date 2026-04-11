# AI Daily Brief

A GitHub Actions workflow that runs every day at **8:00 AM GMT+7** (1:00 AM UTC), fetches the latest AI news and research papers, summarizes them using the **GitHub Models API (GPT-4o)**, and sends the digest directly to **Telegram**.

## What it does

1. **Fetches** AI news from three sources:
   - [Hacker News](https://news.ycombinator.com/) — top AI/LLM stories from the past 24 hours
   - [ArXiv cs.AI](https://arxiv.org/list/cs.AI/recent) — latest AI research papers via RSS
   - [HuggingFace Papers](https://huggingface.co/papers) — top 5 trending papers

2. **Summarizes** all content using the **GitHub Models API** (`gpt-4o`) — free with GitHub Pro/Pro+

3. **Formats** a clean Vietnamese markdown digest

4. **Sends** the digest directly to your **Telegram** chat

## Output Format

```
# 🤖 AI Daily Brief - [DATE]

## 🔥 Tin tức nổi bật
[bullet points from HackerNews]

## 📄 Research Papers
[bullet points from ArXiv]

## 🤗 Trending trên HuggingFace
[bullet points]

## 💡 Tóm tắt của ngày
[AI-generated summary paragraph in Vietnamese]
```

---

## Setup

### 1. Fork or clone this repository

```bash
git clone https://github.com/trongld230289/ai-daily-brief.git
cd ai-daily-brief
```

### 2. Set required GitHub Secrets

Go to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret name | Description |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Your Telegram Bot token (get from [@BotFather](https://t.me/BotFather)) |
| `TELEGRAM_CHAT_ID` | Your Telegram chat/user ID (send a message to your bot, then check `https://api.telegram.org/bot<TOKEN>/getUpdates`) |

> **Note on GitHub token:** No PAT needed! The workflow uses the auto-injected `github.token` with `models: read` permission to call the GitHub Models API for free.

### 3. Verify the workflow is enabled

Go to your repository → **Actions** tab → make sure Actions are enabled. The workflow will automatically run at **1:00 AM UTC (8:00 AM GMT+7)** every day.

---

## Manual Testing

You can trigger the workflow manually at any time:

1. Go to your repository → **Actions** tab
2. Select **AI Daily Brief** in the left sidebar
3. Click **Run workflow**
4. Optionally enable **Debug logging** to see full output
5. Click **Run workflow** to start

---

## Local Development

### Prerequisites

- Node.js 20+

### Install

```bash
npm install
```

> This project has **no runtime dependencies** — it uses Node.js built-in `fetch` (available since Node 18).

### Run locally

```bash
export GH_TOKEN=your_github_token
export TELEGRAM_BOT_TOKEN=your_bot_token
export TELEGRAM_CHAT_ID=your_chat_id

node main.js
```

### Debug mode

```bash
DEBUG=true node main.js
# or
npm run debug
```

Debug mode prints the full fetched data, AI summary, and final digest to stdout.

---

## Project Structure

```
ai-daily-brief/
├── .github/
│   └── workflows/
│       └── daily-brief.yml   # Cron workflow (runs at 1 AM UTC daily)
├── src/
│   ├── fetcher.js            # Fetch news from HN, ArXiv, HuggingFace
│   ├── summarizer.js         # Summarize via GitHub Models API (gpt-4o)
│   ├── formatter.js          # Format digest as Vietnamese markdown
│   └── sender.js             # Send digest to Telegram
├── main.js                   # Orchestration entry point
├── package.json
└── README.md
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GH_TOKEN` | Yes (local only) | GitHub token for Models API (auto-injected in Actions) |
| `TELEGRAM_BOT_TOKEN` | Yes | Telegram Bot token to send messages |
| `TELEGRAM_CHAT_ID` | Yes | Telegram chat ID to receive the digest |
| `DEBUG` | No | Set to `true` for verbose logging |

---

## Cost

**$0/month** — completely free:
- GitHub Actions: free for public repos
- GitHub Models API (gpt-4o): free with GitHub Pro/Pro+
- Telegram Bot API: always free

---

## License

MIT
