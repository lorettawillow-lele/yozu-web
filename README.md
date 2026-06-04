# Yozu AI

Yozu is the Linux for AI-native travel. 

Yozu provides Open Travel Operating System for the AI Era.

Its open-source travel infrastructure platform that enables hotels, travel providers, enterprises, and developers to deploy AI-native travel agents without replacing their existing systems.

Built around autonomous agents, structured travel data, and open APIs, Yozu helps travel suppliers connect directly with customers while reducing operational costs and increasing fulfillment efficiency.

## Vision

Travel is one of the world’s largest industries, yet the travel industry still runs on fragmented systems, manual operations, and commission-heavy marketplaces for decades. Yozu exists to rebuild that infrastructure for the AI era.

Yozu aims to become the operating system powering the next generation of travel services:

* Hotels operate through AI agents
* Enterprises book business travel through AI agents
* Travelers interact with AI instead of forms and call centers
* Suppliers retain ownership of their customers and data

Our mission is to make travel as programmable as software.

## Purpose

Yozu provides a standardized AI layer on top of existing travel operations.

Instead of replacing hotel PMS, CRM, ERP, or booking systems, Yozu connects to them through open interfaces.

### Hotels

* Room inventory management
* Dynamic pricing
* Order fulfillment
* Guest service automation
* AI concierge

### Enterprise Travel

* Business trip planning
* Policy compliance
* Approval workflows
* Expense integration

### Developers

* Open Agent SDK
* Travel APIs
* Multi-agent orchestration
* Custom travel workflows

## Roadmap

### Phase 1

* Website
* Agent SDK
* Hotel Agent MVP

### Phase 2

* Enterprise Travel Agent
* Open API Platform
* Self-hosted Deployment

### Phase 3

* Global Supplier Network
* Marketplace Protocol
* Multi-Agent Ecosystem

### Phase 4

* Travel Operating System
* Autonomous Travel Workflows
* Global Travel Infrastructure

## Architecture

```text
┌─────────────────────┐
│     Traveler AI     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│      Yozu Core      │
│ Agent Orchestrator  │
└───────┬─────┬───────┘
        │     │
        ▼     ▼

 Hotel Agent  Enterprise Agent
        │     │
        ▼     ▼

 Existing PMS / ERP / CRM
```

## Core Components

### Hotel Agent

Manages:

* Room availability
* Pricing
* Orders
* Guest requests
* Service fulfillment

### Enterprise Agent

Manages:

* Business travel requests
* Internal policies
* Approvals
* Budget controls

### Traveler Agent

Provides:

* Natural language booking
* Personalized recommendations
* Itinerary generation
* Travel assistance


## Features

### AI Native

Designed for agents first, not retrofitted with AI later.

### Open Source

Deploy on your own infrastructure.

### Supplier-Owned Data

Hotels and enterprises keep customer relationships.

### Multi-Agent Architecture

Travelers, suppliers, and enterprises can each operate independent agents.

### Global Ready

Supports:

* Hotels
* Transportation
* Corporate travel
* Tourism services

## Quick Start

### Prerequisites

- Node.js 20+
- npm or pnpm
- Git

### Clone Repository

```bash
git clone https://github.com/lorettawillow-lele/yozu-web.git
cd yozu-web
```

### Install Dependencies

Using npm:

```bash
npm install
```

Using pnpm:

```bash
pnpm install
```

### Run Development Server

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

### Prerequisites

* Node.js 20+
* npm or pnpm
* Git

### Clone Repository
git clone https://github.com/lorettawillow-lele/yozu-web.git
cd yozu-web

or

pnpm install

### Run Development Server
npm run dev

Open:
http://localhost:3000

Production Build
npm run build

npm run start

### Repository Structure

```text
yozu-web/
├── app/
├── components/
├── public/
├── styles/
├── lib/
├── docs/
└── README.md
```

## Guardrails

Yozu follows several design principles.

1. Human-in-the-Loop

Critical travel decisions require human confirmation.

Examples:

* Large payments
* Reservation changes
* Refund approvals


2. Data Privacy

Users own their data.

Yozu does not sell traveler data.


3. Supplier Ownership

Hotels and travel providers maintain direct customer relationships.

No platform lock-in.


4. Explainable Actions

Agents must provide reasoning for:

* Recommendations
* Pricing decisions
* Schedule changes


5. Open Standards

Whenever possible, Yozu uses:

* Open APIs
* Open protocols
* Portable data formats


## Security

* OAuth 2.0
* Role-Based Access Control (RBAC)
* Audit Logs
* Encryption at Rest
* Encryption in Transit

## Contributing

We are building the future infrastructure for AI-native travel.

We welcome contributions from:

- AI engineers
- Travel technology builders
- Hotel operators
- Enterprise travel experts
- Open-source contributors

To discuss collaboration:

contact@yozu.me

GitHub Issues and Pull Requests are welcome.
