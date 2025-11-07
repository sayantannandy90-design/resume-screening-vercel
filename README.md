# Resume Screening on Vercel (No paid APIs)

Fast, zero-config Next.js app that parses a PDF resume on the server (Node runtime) and scores it against a pasted Job Description using simple keyword coverage.

## One‑click deploy (recommended)

1. Create a new **GitHub** repo and upload this folder (or use the ZIP below).
2. Go to **vercel.com → New Project → Import from GitHub**.
3. Build & deploy with defaults. No environment variables required.

## Local dev

```bash
npm install
npm run dev
# open http://localhost:3000
```

## How it works
- `/api/score` uses `pdf-parse` to extract text from the uploaded PDF.
- We build a lightweight skill list from the Job Description + a small curated set.
- Scoring = coverage of skills that appear in the resume text + a small frequency boost.
- No external model or API calls → fast and free on the Hobby plan.

> Note: This is **not** semantic AI ranking. For production quality, integrate an embedding model or an LLM (OpenAI, Azure OpenAI, Gemini, Cohere, etc.) and a database for storing candidates.

## Files
- `app/page.jsx` — simple UI for upload + results
- `app/api/score/route.js` — serverless function (Node runtime) that parses the PDF & scores
- `lib/score.js` — skill extraction + scorer
- `app/globals.css` — basic styling

## Troubleshooting
- If you see a 500 error, ensure the uploaded file is a valid PDF.
- On Vercel, this route requires the **Node.js** runtime (already set in the API route).
- Very large PDFs may exceed default request limits. Keep resumes < 5 MB.
