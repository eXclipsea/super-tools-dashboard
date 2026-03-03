import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VoiceTask — AI Voice Memo to Task List",
  description:
    "Record a voice memo. VoiceTask transcribes it with Whisper and uses GPT-4o to extract organized, prioritized tasks with deadlines — no typing required.",
  keywords: ["voice to task AI", "voice memo task list", "AI task manager", "Whisper transcription tasks", "VoiceTask app"],
  alternates: { canonical: "https://supertoolz.xyz/voicetask" },
  openGraph: {
    title: "VoiceTask — Turn Voice Memos into Organized Tasks",
    description:
      "Record a voice memo. AI transcribes it and extracts organized, prioritized tasks with deadlines — powered by OpenAI Whisper and GPT-4o.",
    url: "https://supertoolz.xyz/voicetask",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "VoiceTask",
  applicationCategory: "ProductivityApplication",
  url: "https://supertoolz.xyz/voicetask",
  description:
    "Converts voice memos to structured task lists using OpenAI Whisper for transcription and GPT-4o for task extraction. Automatically categorizes tasks as urgent, later, or completed with priority levels.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "In-browser audio recording",
    "OpenAI Whisper speech-to-text transcription",
    "AI task extraction with priority and deadlines",
    "Urgent / later / completed task categorization",
    "Manual task entry as fallback",
  ],
};

export default function VoiceTaskLayout({ children }: { children: React.ReactNode }) {
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
