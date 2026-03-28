"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import pb from "@/lib/pocketbase";
import type { Meeting, Minutes } from "@/lib/types";

export default function PrintableMinutes() {
  const params = useParams();
  const id = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [minutes, setMinutes] = useState<Minutes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [mtg, mins] = await Promise.all([
        pb.collection("mt_meetings").getOne<Meeting>(id),
        pb.collection("mt_minutes").getFullList<Minutes>({
          filter: `meeting="${id}"`,
          sort: "-created",
        }),
      ]);
      setMeeting(mtg);
      setMinutes(mins[0] || null);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <p className="p-8 text-gray-400">Loading...</p>;
  if (!meeting) return <p className="p-8 text-red-600">Meeting not found.</p>;
  if (!minutes)
    return (
      <main className="max-w-2xl mx-auto px-10 py-12">
        <p className="text-gray-500">Minutes not yet available.</p>
        <a
          href={`/m/${id}`}
          className="text-sm text-[var(--brand-maroon)] hover:underline mt-4 inline-block"
        >
          &larr; Back to meeting
        </a>
      </main>
    );

  // Render content with SECRETARY TO CONFIRM highlights
  function renderContent(content: string) {
    const parts = content.split(/(\[SECRETARY TO CONFIRM[^\]]*\])/g);
    return parts.map((part, i) =>
      part.startsWith("[SECRETARY TO CONFIRM") ? (
        <mark key={i} className="bg-yellow-200 px-1 no-print-mark">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-10 py-12 print:px-0 print:py-0">
      <div className="no-print mb-6 flex gap-4">
        <button
          onClick={() => window.print()}
          className="bg-[var(--brand-maroon)] text-white text-sm font-bold px-4 py-2 rounded hover:bg-[var(--color-maroon-hover)]"
        >
          Print
        </button>
        <a
          href={`/m/${id}`}
          className="text-sm text-[var(--brand-maroon)] hover:underline self-center"
        >
          &larr; Back to meeting
        </a>
      </div>

      <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 mb-6 no-print">
        Review all{" "}
        <mark className="bg-yellow-200 px-1 rounded font-mono">
          [SECRETARY TO CONFIRM]
        </mark>{" "}
        markers before printing or circulating. These are items where the AI was uncertain.
      </div>

      {/* Minutes content — rendered as pre-formatted text */}
      <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
        {renderContent(minutes.content)}
      </div>

      {/* Signature line */}
      <div className="mt-16 pt-6 border-t border-gray-300 text-sm">
        <p className="font-bold text-[var(--brand-maroon)] uppercase tracking-wide text-xs mb-4">
          Chairperson&apos;s Confirmation
        </p>
        <p className="text-xs text-gray-500 mb-6">
          Confirmed as a true and accurate record.
        </p>
        <div className="space-y-6">
          <div>
            <p className="text-sm">Name: ___________________________</p>
          </div>
          <div>
            <p className="text-sm">Signature: ___________________________</p>
          </div>
          <div>
            <p className="text-sm">Date confirmed: ___________________________</p>
          </div>
        </div>
      </div>
    </main>
  );
}
