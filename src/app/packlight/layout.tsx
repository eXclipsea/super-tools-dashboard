import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PackLight — AI Smart Packing List Generator",
  description:
    "Stop overpacking. PackLight builds a custom capsule wardrobe packing list based on your destination, trip duration, trip type, weather, laundry access, and planned activities.",
  keywords: ["smart packing list app", "AI travel packing list", "capsule wardrobe travel", "packing list generator", "PackLight app"],
  alternates: { canonical: "https://supertoolz.xyz/packlight" },
  openGraph: {
    title: "PackLight — AI Smart Packing List Generator",
    description:
      "Set your destination, weather, trip type, laundry access, and activities. Get a minimal, perfectly tailored packing list — never overpack again.",
    url: "https://supertoolz.xyz/packlight",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PackLight",
  applicationCategory: "TravelApplication",
  url: "https://supertoolz.xyz/packlight",
  description:
    "AI-powered travel packing list builder. Generates a minimal capsule wardrobe based on destination, trip duration, weather, trip type (leisure/business/adventure/formal), laundry access, and planned activities.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Destination and weather-based packing lists",
    "Trip type selector (leisure, business, adventure, formal)",
    "Laundry access toggle to reduce clothing quantities",
    "Activity-based extras (beach, hiking, gym, swimming)",
    "Categorized packing list with quantities",
  ],
};

export default function PackLightLayout({ children }: { children: React.ReactNode }) {
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
