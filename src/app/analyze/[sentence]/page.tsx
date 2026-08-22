import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import AnalysisContent from "./AnalysisContent";

interface Props {
  params: Promise<{ sentence: string }>;
}

function tryDecodeSentence(sentence: string) {
  try {
    return decodeURIComponent(sentence);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sentence } = await params;
  const decoded = tryDecodeSentence(sentence);

  if (decoded === null) {
    return {};
  }

  return {
    title: `${decoded} — Kaitai 解体`,
  };
}

export default async function AnalyzePage({ params }: Props) {
  const { sentence } = await params;
  const decoded = tryDecodeSentence(sentence);

  if (decoded === null) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-start space-y-8">
          <AnalysisContent sentence={decoded} />
        </div>
      </main>
    </div>
  );
}
