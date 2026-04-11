# AI Daily Brief

A GitHub Actions workflow that runs every day at **8:00 AM GMT+7** (1:00 AM UTC), fetches the latest AI news and research papers, summarizes them using the GitHub Copilot API, and sends the digest to an OpenClaw webhook.

## What it does

1. **Fetches** AI news from three sources:
   - [Hacker News](https://news.ycombinator.com/) — top AI/LLM stories from the past 24 hours
   - [ArXiv cs.AI](https://arxiv.org/list/cs.AI/recent) — latest AI research papers via RSS
   - [HuggingFace Papers](https://huggingface.co/papers) — top 5 trending papers

2. **Summarizes** all content using the GitHub Copilot API (OpenAI-compatible endpoint)

3. **Formats** a clean Vietnamese markdown digest

4. **Sends** the digest to your OpenClaw webhook

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
| `GITHUB_TOKEN` | Your GitHub Personal Access Token with **`models:read`** scope (or use the auto-injected `GITHUB_TOKEN` for GitHub Copilot API access via `github.token`) |
| `OPENCLAW_WEBHOOK_URL` | Your OpenClaw webhook URL (see below) |

> **Note on `GITHUB_TOKEN`:** GitHub Actions automatically provides a `GITHUB_TOKEN` secret for the repository, but it may not have access to the GitHub Models API. If you get authentication errors, create a **Personal Access Token (PAT)** at https://github.com/settings/tokens with the `models:read` permission and add it as a repository secret named `GITHUB_TOKEN`.

### 3. How to get an OpenClaw webhook URL

1. Open [OpenClaw](https://openclaw.com) and sign in
2. Navigate to **Settings** → **Integrations** → **Webhooks**
3. Click **Create Webhook**
4. Copy the generated webhook URL
5. Paste it as the `OPENCLAW_WEBHOOK_URL` secret in your GitHub repository

### 4. Verify the workflow is enabled

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
- A GitHub token with GitHub Models access

### Install

```bash
npm install
```

> This project has **no runtime dependencies** — it uses Node.js built-in `fetch` (available since Node 18).

### Run locally

```bash
export GITHUB_TOKEN=your_github_token
export OPENCLAW_WEBHOOK_URL=your_webhook_url

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
│   ├── summarizer.js         # Summarize via GitHub Copilot API
│   ├── formatter.js          # Format digest as Vietnamese markdown
│   └── sender.js             # POST to OpenClaw webhook
├── main.js                   # Orchestration entry point
├── package.json
└── README.md
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | Yes | GitHub token for Copilot API authentication |
| `OPENCLAW_WEBHOOK_URL` | Yes | OpenClaw webhook URL to receive the digest |
| `DEBUG` | No | Set to `true` for verbose logging |

---

## License

MIT
