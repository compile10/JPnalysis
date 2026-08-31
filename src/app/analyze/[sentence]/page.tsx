import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

  return <AnalysisContent sentence={decoded} />;
}
