"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import pb from "@/lib/pocketbase";
import { formatDate } from "@/lib/utils";
import type { Job } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  uploaded: "Received — waiting to process",
  processing: "Processing...",
  done: "Minutes Ready",
  failed: "Processing Failed",
};

const STATUS_COLORS: Record<string, string> = {
  uploaded: "bg-yellow-100 text-yellow-800",
  processing: "bg-orange-100 text-orange-800",
  done: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function ResultPage() {
  const params = useParams();
  const id = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    pb.collection("mt_jobs")
      .getOne<Job>(id)
      .then(setJob)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  function downloadMinutes() {
    if (!job) return;
    const blob = new Blob([job.minutes_content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `minutes-${job.club_name.replace(/\s+/g, "-")}-${job.meeting_date}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function renderContent(content: string) {
    const parts = content.split(/(\[SECRETARY TO CONFIRM[^\]]*\])/g);
    return parts.map((part, i) =>
      part.startsWith("[SECRETARY TO CONFIRM") ? (
        <mark key={i} className="bg-yellow-200 px-1 rounded text-xs font-mono">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-gray-400">Loading...</p>
      </main>
    );
  }

  if (notFound || !job) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-red-600 mb-4">Job not found.</p>
        <Link href="/" className="text-sm text-[var(--brand-maroon)] hover:underline">
          &larr; Home
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div>
        <Link href="/" className="text-sm text-[var(--brand-maroon)] hover:underline mb-4 inline-block">
          &larr; Home
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl mb-1">{job.club_name}</h1>
            <p className="text-sm text-gray-600">{formatDate(job.meeting_date)}</p>
          </div>
          <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${STATUS_COLORS[job.status] || "bg-gray-100"}`}>
            {STATUS_LABELS[job.status] || job.status}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">Job ID: {job.id}</p>
      </div>

      {/* Waiting state */}
      {(job.status === "uploaded" || job.status === "processing") && (
        <div className="p-6 bg-orange-50 border border-orange-200 rounded text-center">
          {job.status === "uploaded" ? (
            <>
              <p className="text-sm font-bold text-orange-800">Recording received</p>
              <p className="text-xs text-orange-600 mt-1">
                Processing will begin shortly. Come back in about 30 minutes.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-orange-800">Processing...</p>
              <p className="text-xs text-orange-600 mt-1">
                Transcribing and formatting your minutes. This takes about 30 minutes for a 1-hour meeting.
              </p>
            </>
          )}
          <p className="text-xs text-gray-500 mt-3">
            Refresh this page to check progress, or check your email at <strong>{job.email}</strong>.
          </p>
        </div>
      )}

      {/* Failed state */}
      {job.status === "failed" && (
        <div className="p-6 bg-red-50 border border-red-200 rounded">
          <p className="text-sm font-bold text-red-800 mb-1">Processing failed</p>
          <p className="text-xs text-red-600">
            Something went wrong. Please contact Wade with your job ID: <strong>{job.id}</strong>
          </p>
        </div>
      )}

      {/* Minutes ready */}
      {job.status === "done" && job.minutes_content && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold uppercase tracking-widest text-[var(--brand-maroon)]">
              Draft Minutes
            </h2>
            <div className="flex gap-3">
              <button
                onClick={downloadMinutes}
                className="text-xs text-[var(--brand-maroon)] hover:underline"
              >
                Download .md
              </button>
              <Link
                href={`/r/${id}/minutes`}
                target="_blank"
                className="text-xs text-[var(--brand-maroon)] hover:underline"
              >
                Printable view &rarr;
              </Link>
            </div>
          </div>

          <div className="bg-white rounded border border-gray-200 p-6">
            <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 mb-4">
              Review all{" "}
              <mark className="bg-yellow-200 px-1 rounded font-mono">[SECRETARY TO CONFIRM]</mark>{" "}
              markers before circulating.
            </p>
            <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-[var(--text-dark)]">
              {renderContent(job.minutes_content)}
            </pre>
          </div>
        </section>
      )}
    </main>
  );
}
