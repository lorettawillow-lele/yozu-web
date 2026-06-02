# Yozu Web

Minimal Vercel/Next.js scaffold for the Yozu Application Demo v1.0.

## Purpose

- Host the public landing/demo surface for Demo Day.
- Keep all user-visible brand text centralized as `Yozu`.
- Provide a deployable fallback URL through Vercel before `yozu.me` DNS is fully stable.

## Quick Start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Deploy On Vercel

1. Create a private GitHub repo named `yozu-web`.
2. Push this folder to the repo.
3. In Vercel, create a new project from the repo.
4. Use the generated `*.vercel.app` URL as the fallback submission URL.
5. Add `yozu.me`, `www.yozu.me`, and optionally `join.yozu.me` in Vercel project domains.
6. Send the Vercel DNS records screen to DevOps before editing Aliyun DNS.

## Guardrails

- Do not commit API keys or tokens. Use Vercel Environment Variables.
- Do not present mock/sandbox demo states as live booking or payment.
- Do not promise lowest price, automatic booking, unified refunds/support, or merchant-of-record behavior.
- Any change to logo, QR, URL, email, screenshot, PDF, landing, or external copy must go through QA/Legal review.
