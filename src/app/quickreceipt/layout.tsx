import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuickReceipt — AI Receipt Scanner & Expense Tracker",
  description:
    "Point your camera at any receipt. QuickReceipt uses GPT-4o vision to instantly read, categorize, and track your expenses — no manual entry required. Free to use online.",
  keywords: ["AI receipt scanner", "expense tracker app", "receipt OCR AI", "GPT-4o receipt", "automatic expense categorization"],
  alternates: { canonical: "https://supertoolz.xyz/quickreceipt" },
  openGraph: {
    title: "QuickReceipt — AI Receipt Scanner & Expense Tracker",
    description:
      "Snap a photo of any receipt. AI reads it, categorizes it, and tracks your spending automatically. Powered by GPT-4o.",
    url: "https://supertoolz.xyz/quickreceipt",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "QuickReceipt",
  applicationCategory: "FinanceApplication",
  url: "https://supertoolz.xyz/quickreceipt",
  description:
    "An AI-powered receipt scanning and expense tracking tool. Uses GPT-4o vision to extract store name, date, total, and line items from receipt photos, then categorizes spending automatically.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Camera or file upload receipt scanning",
    "AI extraction of store name, date, total, and items",
    "Automatic expense categorization (Food, Shopping, Healthcare, etc.)",
    "Monthly spending summaries and trends",
    "Persistent receipt history",
  ],
};

export default function QuickReceiptLayout({ children }: { children: React.ReactNode }) {
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
