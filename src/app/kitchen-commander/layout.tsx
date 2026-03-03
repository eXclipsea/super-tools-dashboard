import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kitchen Commander — AI Pantry Scanner & Recipe Generator",
  description:
    "Snap a photo of your fridge or pantry. Kitchen Commander uses GPT-4o vision to build your ingredient inventory and generate recipes you can cook right now — zero waste.",
  keywords: ["AI pantry scanner", "recipe generator AI", "fridge photo recipes", "GPT-4o cooking app", "Kitchen Commander"],
  alternates: { canonical: "https://supertoolz.xyz/kitchen-commander" },
  openGraph: {
    title: "Kitchen Commander — AI Pantry & Recipe App",
    description:
      "Photo-scan your fridge. Get a full pantry inventory and AI-generated recipes based on exactly what you have. Reduce food waste instantly.",
    url: "https://supertoolz.xyz/kitchen-commander",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Kitchen Commander",
  applicationCategory: "FoodApplication",
  url: "https://supertoolz.xyz/kitchen-commander",
  description:
    "AI-powered pantry management and recipe generation. GPT-4o vision scans fridge/pantry photos to identify ingredients, then generates recipes matching available items with cooking instructions.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Fridge and pantry photo scanning via AI vision",
    "Automatic ingredient inventory with expiry tracking",
    "AI recipe generation from available ingredients",
    "Recipe match scores based on pantry overlap",
    "Shopping list generation for missing ingredients",
  ],
};

export default function KitchenCommanderLayout({ children }: { children: React.ReactNode }) {
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
