# Yozu Web

Yozu is an AI Operating System for Enterprise Travel.

> Source-available notice:
> This repository is not open source.
> Non-commercial internal evaluation use only.
> Commercial use or production deployment requires written permission from Yozu.

This repository currently contains the public 4-page launch MVP for Yozu:

- public landing
- trip intake
- demoable coordination flow
- contact / human follow-up

It does **not** represent a full OTA, merchant-of-record product, open travel operating system, or completed booking/payment platform.

## Current Product Scope

The live MVP is designed to help a traveler move from intent to a decision-ready next step:

`intent -> decision-ready options -> source/disclosure -> approval -> preflight`

Current routes:

- `/` — public landing
- `/intake` — trip intake and request handoff
- `/demo` — demoable coordination flow using mock/sandbox data
- `/contact` — human follow-up path

## Product Boundaries

Yozu follows these current launch boundaries:

- approval-gated coordination only
- source/disclosure shown before next-step coordination
- preflight re-check before checkout coordination
- mock/sandbox demo states for current product flow
- no automatic booking
- no payment capture
- no merchant-of-record claim
- no booked / paid / ticketed completion state on the public site

## Trip Intake

The current intake flow is designed to collect trip intent and route it to a human follow-up path.

Users can submit:

- destination and dates
- budget range
- travelers
- trip stakes and constraints
- contact details for follow-up

Current intake/privacy boundary:

- submitted details are used only to respond to that trip request
- users should not submit passport, payment, or other sensitive identity data

## Repository Purpose

This repository is the public launch surface for the current Yozu MVP.

It is suitable for:

- landing page iteration
- trip intake UX
- demo flow presentation
- submission/demo-day/public MVP deployment

It is **not** yet the repository for:

- supplier integrations
- real booking/payment execution
- SDKs or open infrastructure platform components
- enterprise or hotel production systems

Those future directions should be documented separately until they become part of the actual shipped product.

## Tech Stack

Current stack:

- Next.js
- React
- TypeScript
- Vercel

## Local Development

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production Build

```bash
npm run build
npm run start
```

## Current Repository Structure

```text
yozu-web/
├── app/
│   ├── contact/
│   ├── demo/
│   ├── intake/
│   └── lib/
├── docs/
├── public/
├── README.md
├── next.config.mjs
├── package.json
└── tsconfig.json
```

## Contact

Current public contact path:

- `contact@yozu.me`

## License

This repository is source-available under the terms in [LICENSE](./LICENSE).

- non-commercial internal evaluation use only
- commercial use requires written permission from Yozu
- third-party dependencies remain subject to their own licenses

## Notes

If the public repo remains public, the README should continue to describe only currently shipped scope and clearly separate future roadmap from implemented capability.
