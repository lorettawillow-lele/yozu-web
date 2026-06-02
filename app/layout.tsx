import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { BRAND } from "./lib/brand";

export const metadata: Metadata = {
  title: `${BRAND.productDisplayName} - AI travel decision and execution layer`,
  description:
    "Yozu helps high-value travelers move from intent to source-backed, approval-gated travel decisions.",
  metadataBase: new URL(`https://${BRAND.publicDomain}`)
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
