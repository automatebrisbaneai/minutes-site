"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import pb from "@/lib/pocketbase";
import { formatDate } from "@/lib/utils";
import type { Job } from "@/lib/types";

export default function PrintableJobMinutes() {
  const params = useParams();
  const id = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pb.collection("mt_jobs")
      .getOne<Job>(id)
      .then(setJob)
      .finally(() => setLoading(false));
  }, [id]);

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

  if (loading) return <p className="p-8 text-gray-400">Loading...</p>;
  if (!job) return <p className="p-8 text-red-600">Not found.</p>;
  if (!job.minutes_content) {
    return (
      <main className="max-w-2xl mx-auto px-10 py-12">
        <p className="text-gray-500">Minutes not yet available.</p>
        <a href={`/r/${id}`} className="text-sm text-[var(--brand-maroon)] hover:underline mt-4 inline-block">
          &larr; Back
        </a>
      </main>
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
        <a href={`/r/${id}`} className="text-sm text-[var(--brand-maroon)] hover:underline self-center">
          &larr; Back
        </a>
      </div>

      <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 mb-6 no-print">
        Review all{" "}
        <mark className="bg-yellow-200 px-1 rounded font-mono">[SECRETARY TO CONFIRM]</mark>{" "}
        markers before printing or circulating.
      </div>

      {/* Header for print */}
      <div className="hidden print:block border-b-2 border-[var(--brand-maroon)] pb-3 mb-6">
        <h1 className="text-xl font-bold">{job.club_name}</h1>
        <p className="text-sm text-gray-600">{formatDate(job.meeting_date)}</p>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">DRAFT — not confirmed</p>
      </div>

      <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
        {renderContent(job.minutes_content)}
      </div>

      {/* Signature */}
      <div className="mt-16 pt-6 border-t border-gray-300 text-sm">
        <p className="font-bold text-[var(--brand-maroon)] uppercase tracking-wide text-xs mb-4">
          Chairperson&apos;s Confirmation
        </p>
        <p className="text-xs text-gray-500 mb-6">
          Confirmed as a true and accurate record.
        </p>
        <div className="space-y-6">
          <p className="text-sm">Name: ___________________________</p>
          <p className="text-sm">Signature: ___________________________</p>
          <p className="text-sm">Date confirmed: ___________________________</p>
        </div>
      </div>
    </main>
  );
}
