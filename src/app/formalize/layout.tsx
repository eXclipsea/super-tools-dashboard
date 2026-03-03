import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formalize — AI Text Style Transformer (Shakespeare, Formal, Presidential)",
  description:
    "Transform casual text into Shakespeare, formal business English, Presidential speech, philosopher prose, poetry, medieval dialect, or 1920s gangster slang — instantly with GPT-4o.",
  keywords: ["AI text formalize", "Shakespeare text generator", "formal writing AI", "writing style transformer", "Formalize app"],
  alternates: { canonical: "https://supertoolz.xyz/formalize" },
  openGraph: {
    title: "Formalize — AI Writing Style Transformer",
    description:
      "Turn any casual text into Shakespeare, formal English, presidential speech, philosophy, poetry, medieval, or gangster style — powered by GPT-4o.",
    url: "https://supertoolz.xyz/formalize",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Formalize",
  applicationCategory: "UtilitiesApplication",
  url: "https://supertoolz.xyz/formalize",
  description:
    "AI text style transformer that rewrites casual input into 7 distinct styles: Shakespeare, Formal Business, Presidential, Philosopher, Poet, Medieval, and 1920s Gangster. Powered by GPT-4o.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "7 distinct writing style transformations",
    "Shakespeare thee/thou/thy style conversion",
    "Formal business and academic writing",
    "Presidential inspiring speech style",
    "One-click copy to clipboard",
  ],
};

export default function FormalizeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
