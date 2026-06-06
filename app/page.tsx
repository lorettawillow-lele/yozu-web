import Link from "next/link";
import { BRAND } from "./lib/brand";
import { coreFlow, launchModules, trustChecks } from "./lib/site";
import { PageShell } from "./ui";

export default function Home() {
  return (
    <PageShell>
      <section className="hero landingHero">
        <div className="heroGrid landingGrid">
          <div className="heroCopy">
            <p className="eyebrow">AI Operating System for Enterprise Travel</p>
            <h1 className="compactPublicTitle">Trustworthy travel execution starts before booking.</h1>
            <p className="lede">
              {BRAND.productDisplayName} helps travelers move from messy intent to decision-ready,
              source-backed options with approval, disclosure, and preflight before checkout
              coordination.
            </p>
            <div className="actions">
              <Link className="primaryButton" href="/intake">
                Start a trip request
              </Link>
              <Link className="secondaryButton" href="/contact">
                Request a demo
              </Link>
            </div>
            <p className="boundary">
              Launch MVP: public landing, trip intake, demoable coordination flow, and human
              follow-up. No automatic booking, no lowest-price promise, no payment capture.
            </p>
          </div>

          <div className="demoCard" aria-label="Yozu launch MVP preview">
            <div className="cardHeader">
              <span>Launch MVP</span>
              <strong>4-page public product</strong>
            </div>
            <div className="routeStack">
              <div className="routeRow">
                <span>/</span>
                <strong>landing</strong>
              </div>
              <div className="routeRow">
                <span>/intake</span>
                <strong>trip request</strong>
              </div>
              <div className="routeRow">
                <span>/demo</span>
                <strong>coordination flow</strong>
              </div>
              <div className="routeRow">
                <span>/contact</span>
                <strong>human follow-up</strong>
              </div>
            </div>
            <div className="facts compactFacts">
              <div>
                <dt>Domain</dt>
                <dd>{BRAND.primaryDomain}</dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>{BRAND.supportEmail}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>Live MVP</dd>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sectionIntro">
          <p className="eyebrow">Scope</p>
          <h2>Small enough to launch, specific enough to be useful.</h2>
        </div>
        <div className="launchGrid">
          {launchModules.map((item) => (
            <article className="infoCard" key={item}>
              <h3>{item}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="sectionIntro">
          <p className="eyebrow">Core flow</p>
          <h2>Intent to approval without pretending the trip is already booked.</h2>
        </div>
        <div className="steps">
          {coreFlow.map((step) => (
            <article className="step" key={step.label}>
              <span>{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section trustSection">
        <div className="sectionIntro">
          <p className="eyebrow">Trust layer</p>
          <h2>Built to coordinate real-world next steps without over-claiming.</h2>
        </div>
        <ul className="trustList">
          {trustChecks.map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
