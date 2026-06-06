import Link from "next/link";
import type { ReactNode } from "react";
import { BRAND } from "./lib/brand";

const navLinks = [
  { href: "/", label: "Landing" },
  { href: "/intake", label: "Trip intake" },
  { href: "/ops/cases", label: "Operator Queue" },
  { href: "/demo", label: "Demo flow" },
  { href: "/contact", label: "Contact" }
] as const;

export function SiteHeader() {
  return (
    <header className="siteHeader">
      <nav className="nav" aria-label="Primary">
        <Link className="brand" href="/" aria-label={`${BRAND.productDisplayName} home`}>
          <span className="mark" aria-hidden="true">
            Y
          </span>
          <span>{BRAND.productDisplayName}</span>
        </Link>
        <div className="navLinks">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div>
        <strong>{BRAND.productDisplayName}</strong>
        <p>
          AI Operating System for Enterprise Travel. Demo launch MVP only. No automatic booking or
          payment capture.
        </p>
      </div>
      <div className="footerMeta">
        <span>{BRAND.primaryDomain}</span>
        <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>
      </div>
    </footer>
  );
}

export function PageShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <main className="pageShell">
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}
