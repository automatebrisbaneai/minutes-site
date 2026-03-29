"use client";

export default function CheatSheetPage() {
  return (
    <main className="max-w-[148mm] mx-auto px-8 py-10 print:px-0 print:py-0">
      {/* Print button — hidden when printing */}
      <div className="no-print mb-6 flex gap-4">
        <button
          onClick={() => window.print()}
          className="bg-[var(--brand-maroon)] text-white text-sm font-bold px-4 py-2 rounded hover:bg-[var(--color-maroon-hover)]"
        >
          Print
        </button>
        <a
          href="/"
          className="text-sm text-[var(--brand-maroon)] hover:underline self-center"
        >
          &larr; Back
        </a>
      </div>

      {/* Header */}
      <div className="border-b-2 border-[var(--brand-maroon)] pb-3 mb-5">
        <p className="text-xs font-bold tracking-widest text-[var(--brand-green)] uppercase mb-1">
          CAQ Club Tool
        </p>
        <h1 className="text-xl font-bold text-[var(--brand-maroon)] uppercase tracking-wide">
          Meeting Recording Cheat Sheet
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Give this to the chair. These verbal cues are what the AI listens for to produce accurate minutes.
        </p>
      </div>

      {/* Cues */}
      <div className="space-y-5 text-sm">

        <div>
          <p className="font-bold text-[var(--brand-maroon)] uppercase tracking-wide text-xs mb-1">
            Opening
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm leading-relaxed italic text-gray-700">
            &ldquo;This meeting of <strong>[Club Name]</strong> is now open. Today is <strong>[date]</strong>.
            Present are <strong>[read names in full]</strong>. Apologies received from <strong>[names]</strong>.&rdquo;
          </div>
        </div>

        <div>
          <p className="font-bold text-[var(--brand-maroon)] uppercase tracking-wide text-xs mb-1">
            Each Agenda Item
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm leading-relaxed italic text-gray-700">
            &ldquo;We&apos;re moving to Item <strong>[number]</strong>: <strong>[title]</strong>.&rdquo;
          </div>
        </div>

        <div>
          <p className="font-bold text-[var(--brand-maroon)] uppercase tracking-wide text-xs mb-1">
            Taking a Motion
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm leading-relaxed italic text-gray-700">
            &ldquo;I have a motion from <strong>[Name]</strong> that <strong>[state the resolution — what exactly is being decided]</strong>.
            Seconded by <strong>[Name]</strong>. All in favour? Against? <strong>Carried / Not carried.</strong>&rdquo;
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-1">
            If not unanimous: &ldquo;Carried <strong>[number]</strong> to <strong>[number]</strong>.&rdquo;
          </p>
        </div>

        <div>
          <p className="font-bold text-[var(--brand-maroon)] uppercase tracking-wide text-xs mb-1">
            Conflict of Interest
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm leading-relaxed italic text-gray-700">
            &ldquo;<strong>[Name]</strong> has declared a conflict of interest and is leaving the room.&rdquo;
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-1">
            When they return: &ldquo;<strong>[Name]</strong> has returned to the meeting.&rdquo;
          </p>
        </div>

        <div>
          <p className="font-bold text-[var(--brand-maroon)] uppercase tracking-wide text-xs mb-1">
            Closing
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm leading-relaxed italic text-gray-700">
            &ldquo;The next meeting will be held on <strong>[date]</strong> at <strong>[time]</strong>.
            This meeting is closed at <strong>[time]</strong>.&rdquo;
          </div>
        </div>

      </div>

      {/* Recording tips */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <p className="font-bold text-[var(--brand-maroon)] uppercase tracking-wide text-xs mb-2">
          Recording Tips
        </p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li><strong>Phone:</strong> Centre of the table, face up, away from papers</li>
          <li><strong>Best format:</strong> .m4a from iPhone Voice Memos works perfectly</li>
          <li><strong>Max size:</strong> 500MB (about 6 hours of audio)</li>
          <li><strong>Upload:</strong> After the meeting at minutes.croquetwade.com</li>
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-3 border-t border-gray-100 text-xs text-gray-400">
        CAQ Meeting Minutes Tool &bull; minutes.croquetwade.com
      </div>
    </main>
  );
}
