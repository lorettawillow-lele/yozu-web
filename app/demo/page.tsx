import { coreFlow } from "../lib/site";
import { PageShell } from "../ui";

const optionCards = [
  {
    title: "Balanced arrival + recovery",
    tradeoff: "Best for demo readiness and investor follow-up windows.",
    source: "Mock supplier reference · flight + hotel bundle",
    fetchedAt: "2026-06-04 04:40 demo timestamp",
    policy: "Cancellation rule opened before next step",
    status: "Awaiting explicit approval"
  },
  {
    title: "Lower-cost route with tighter layover risk",
    tradeoff: "Budget-friendly but less forgiving if flights slip.",
    source: "Mock supplier reference · alternate route mix",
    fetchedAt: "2026-06-04 04:40 demo timestamp",
    policy: "Different cancellation rule surfaced in disclosure",
    status: "Needs traveler review"
  }
] as const;

export default function DemoPage() {
  return (
    <PageShell>
      <section className="section pageLead compactPublicLead">
        <div className="sectionIntro wideIntro">
          <p className="eyebrow">Demo flow</p>
          <h1 className="pageTitle">See how Yozu turns travel intent into a coordination-ready next step.</h1>
          <p className="lede">
            This page uses mock/sandbox data to show the launch MVP flow: options, disclosure,
            approval, and preflight before any checkout coordination.
          </p>
        </div>
      </section>

      <section className="section demoSection">
        <div className="steps demoSteps">
          {coreFlow.map((step) => (
            <article className="step" key={step.label}>
              <span>{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section demoBoard">
        <div className="sectionIntro">
          <p className="eyebrow">Decision-ready options</p>
          <h2>Readable tradeoffs, not a search-results wall.</h2>
        </div>
        <div className="optionGrid">
          {optionCards.map((card) => (
            <article className="optionCard" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.tradeoff}</p>
              <dl className="optionFacts">
                <div>
                  <dt>Source</dt>
                  <dd>{card.source}</dd>
                </div>
                <div>
                  <dt>fetched_at</dt>
                  <dd>{card.fetchedAt}</dd>
                </div>
                <div>
                  <dt>Policy / disclosure</dt>
                  <dd>{card.policy}</dd>
                </div>
                <div>
                  <dt>Current state</dt>
                  <dd>{card.status}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="section trustSection">
        <div className="sectionIntro">
          <p className="eyebrow">Preflight boundary</p>
          <h2>One last check before confirmation.</h2>
          <p className="lede smallLede">
            No payment capture until explicit user confirmation. If price, inventory, policy, or route
            context changes, Yozu interrupts the flow and asks for a fresh decision.
          </p>
        </div>
        <div className="calloutCard">
          <strong>Current launch rule</strong>
          <p>
            Demo and coordination only. No automatic booking, no merchant-of-record claim, no final
            booked/paid/ticketed state.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
