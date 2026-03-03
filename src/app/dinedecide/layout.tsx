import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DineDecide — AI Restaurant Comparison & Recommendation",
  description:
    "Can't choose between two restaurants? DineDecide uses AI to compare food quality, service, atmosphere, and value — then picks the best fit based on your dining history and preferences.",
  keywords: ["AI restaurant comparison", "restaurant picker app", "best restaurant AI", "DineDecide", "restaurant recommendation AI"],
  alternates: { canonical: "https://supertoolz.xyz/dinedecide" },
  openGraph: {
    title: "DineDecide — AI Restaurant Comparison",
    description:
      "Enter two restaurants. AI compares food, service, atmosphere, and value using real review data — then recommends the best fit based on your dining history.",
    url: "https://supertoolz.xyz/dinedecide",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DineDecide",
  applicationCategory: "LifestyleApplication",
  url: "https://supertoolz.xyz/dinedecide",
  description:
    "AI restaurant recommendation tool. Compares two restaurants across food quality, service, atmosphere, and value. Learns user preferences from dining history to improve future recommendations.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Side-by-side restaurant score comparison",
    "AI-derived preference profile from dining history",
    "Optional specific address input for accuracy",
    "Persistent restaurant visit history",
    "History-aware recommendation reasoning",
  ],
};

export default function DineDecideLayout({ children }: { children: React.ReactNode }) {
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
