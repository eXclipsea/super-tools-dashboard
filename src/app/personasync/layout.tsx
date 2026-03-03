import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PersonaSync — AI Writing Style Cloner & Message Drafter",
  description:
    "Paste examples of your writing. PersonaSync analyzes your style, tone, and vocabulary — then drafts replies that sound exactly like you wrote them. Powered by GPT-4o.",
  keywords: ["AI writing style cloner", "AI message drafter", "writing persona AI", "PersonaSync", "GPT-4o writing assistant"],
  alternates: { canonical: "https://supertoolz.xyz/personasync" },
  openGraph: {
    title: "PersonaSync — AI That Writes Like You",
    description:
      "Give AI a few examples of your writing. It learns your exact style, then drafts messages, emails, and replies that sound authentically like you.",
    url: "https://supertoolz.xyz/personasync",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PersonaSync",
  applicationCategory: "ProductivityApplication",
  url: "https://supertoolz.xyz/personasync",
  description:
    "AI writing style analyzer and message drafter. Learns writing voice, tone, vocabulary, and sentence structure from user-provided examples. Generates contextually appropriate replies that match the learned style. Supports multiple saved brand voices.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Writing style analysis from text examples",
    "AI message drafting in your personal voice",
    "Multiple saved brand voice profiles",
    "Screenshot-to-text message parsing",
    "Draft history across sessions",
  ],
};

export default function PersonaSyncLayout({ children }: { children: React.ReactNode }) {
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
