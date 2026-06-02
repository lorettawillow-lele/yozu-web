import { BRAND } from "./lib/brand";

const demoSteps = [
  {
    label: "Intent",
    title: "Tell Yozu the trip outcome",
    body: "A high-value traveler describes timing, budget, people, constraints, and what would make the trip successful."
  },
  {
    label: "Decision",
    title: "Get 2-3 decision-ready options",
    body: "The interface compresses choices into clear tradeoffs instead of dumping another search-results page."
  },
  {
    label: "Trust",
    title: "See sources, timestamps, and rules",
    body: "Every bookable item must show supplier identity, price or inventory timestamp, and cancellation-rule access."
  },
  {
    label: "Approval",
    title: "Nothing moves without confirmation",
    body: "Yozu coordinates booking intent only after explicit user approval; demo states are mock/sandbox until production review."
  },
  {
    label: "Preflight",
    title: "Re-check before execution",
    body: "Price, inventory, supplier, and policy changes interrupt the flow and require a fresh confirmation."
  }
];

const trustChecks = [
  "Source-backed itinerary items",
  "Visible + logged disclosure",
  "Approval-gated booking coordination",
  "Preflight price and inventory check",
  "No lowest-price or unified-refund promise"
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <nav className="nav" aria-label="Main navigation">
          <a className="brand" href="/" aria-label={`${BRAND.productDisplayName} home`}>
            <span className="mark" aria-hidden="true">
              Y
            </span>
            <span>{BRAND.productDisplayName}</span>
          </a>
          <div className="navLinks">
            <a href="#demo">Demo flow</a>
            <a href="#trust">Trust layer</a>
            <a href="#waitlist">Private preview</a>
          </div>
        </nav>

        <div className="heroGrid">
          <div className="heroCopy">
            <p className="eyebrow">AI travel operator for high-value trips</p>
            <h1>AI suggestions are easy. Trustworthy travel execution is hard.</h1>
            <p className="lede">
              {BRAND.productDisplayName} helps travelers move from messy intent to decision-ready,
              source-backed travel plans with approval before execution.
            </p>
            <div className="actions">
              <a className="primaryButton" href="#waitlist">
                Request private preview
              </a>
              <a className="secondaryButton" href="#demo">
                View demo flow
              </a>
            </div>
            <p className="boundary">
              Application Demo v1.0: mock/sandbox flow, no live payment capture, no merchant-of-record
              promise.
            </p>
          </div>

          <div className="demoCard" aria-label="Yozu demo state preview">
            <div className="cardHeader">
              <span>Approval checkpoint</span>
              <strong>Decision ready</strong>
            </div>
            <div className="tripRoute">
              <span>SFO</span>
              <span className="routeLine" aria-hidden="true" />
              <span>Singapore</span>
            </div>
            <div className="option">
              <div>
                <strong>Balanced work + recovery itinerary</strong>
                <p>Best for Demo Day arrival, jet-lag recovery, and investor follow-up windows.</p>
              </div>
              <span className="pill">Recommended</span>
            </div>
            <dl className="facts">
              <div>
                <dt>Source</dt>
                <dd>Supplier data placeholder</dd>
              </div>
              <div>
                <dt>Freshness</dt>
                <dd>Preflight required</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>Awaiting approval</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section id="demo" className="section">
        <div className="sectionIntro">
          <p className="eyebrow">Demo flow</p>
          <h2>From travel intent to auditable coordination.</h2>
        </div>
        <div className="steps">
          {demoSteps.map((step) => (
            <article className="step" key={step.label}>
              <span>{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="trust" className="section trustSection">
        <div className="sectionIntro">
          <p className="eyebrow">Trust layer</p>
          <h2>Built to avoid the travel-agent failure mode: confident but wrong.</h2>
        </div>
        <ul className="trustList">
          {trustChecks.map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ul>
      </section>

      <section id="waitlist" className="section waitlist">
        <div>
          <p className="eyebrow">Private preview</p>
          <h2>For travelers who need decisions, not another tab.</h2>
          <p>
            Waitlist and email capture will be connected after domain, email, QA, and legal review. Until
            then, this page is a deployable application demo surface.
          </p>
        </div>
        <div className="previewBox">
          <span>Public domain</span>
          <strong>{BRAND.publicDomain}</strong>
          <small>{BRAND.supportEmail}</small>
        </div>
      </section>
    </main>
  );
}
