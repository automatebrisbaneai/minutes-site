import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm font-bold tracking-widest text-[var(--brand-green)] uppercase mb-2">
          CAQ Club Tool
        </p>
        <h1 className="text-3xl mb-4">Meeting Minutes</h1>
        <p className="text-lg text-[var(--text-dark)] leading-relaxed">
          Record your meeting. Upload the recording. Get draft minutes back within 30 minutes.
        </p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-1 gap-4 mb-10 sm:grid-cols-2">
        {/* Simple mode */}
        <Link
          href="/upload"
          className="group block border-2 border-[var(--brand-maroon)] rounded p-6 hover:bg-[var(--brand-maroon)] transition-colors"
        >
          <p className="text-xs font-bold tracking-widest text-[var(--brand-green)] uppercase mb-2 group-hover:text-white">
            Simple
          </p>
          <h2 className="text-xl font-bold text-[var(--text-dark)] mb-2 group-hover:text-white">
            Upload a Recording
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed group-hover:text-white/90">
            Enter your club name, date, and email. Upload the recording. We&apos;ll
            email you the draft minutes. No account needed.
          </p>
          <p className="text-sm font-bold text-[var(--brand-maroon)] mt-4 group-hover:text-white">
            Start here &rarr;
          </p>
        </Link>

        {/* Full mode */}
        <Link
          href="/new"
          className="group block border-2 border-gray-200 rounded p-6 hover:border-[var(--brand-maroon)] transition-colors"
        >
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
            Full mode
          </p>
          <h2 className="text-xl font-bold text-[var(--text-dark)] mb-2">
            Plan a Meeting
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Build your agenda over the month. Share with committee members to add
            items. Agenda stays attached to the minutes. Protected by a 4-digit PIN.
          </p>
          <p className="text-sm font-bold text-[var(--brand-maroon)] mt-4">
            Create a meeting &rarr;
          </p>
        </Link>
      </div>

      {/* Cheat sheet */}
      <div className="mb-10 p-5 bg-[var(--brand-cream)] border border-[var(--brand-maroon)] rounded flex items-start gap-4">
        <div className="flex-1">
          <p className="text-sm font-bold text-[var(--brand-maroon)] mb-1">
            Print the Recording Cheat Sheet
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            Give this to your chair before the meeting. It coaches the verbal cues the AI
            needs — names, motions, vote calls. One page. Makes a real difference.
          </p>
        </div>
        <Link
          href="/cheat-sheet"
          className="shrink-0 text-sm font-bold text-[var(--brand-maroon)] border border-[var(--brand-maroon)] rounded px-4 py-2 hover:bg-[var(--brand-maroon)] hover:text-white transition-colors whitespace-nowrap"
        >
          View &rarr;
        </Link>
      </div>

      {/* How it works */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
          How it works
        </h3>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-7 h-7 rounded-full bg-[var(--brand-maroon)] text-white flex items-center justify-center font-bold text-sm shrink-0">
              1
            </div>
            <p className="text-sm text-[var(--text-dark)] leading-relaxed pt-0.5">
              Print the cheat sheet. Give it to the chair. Place your phone in the centre of the table and hit record.
            </p>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-7 h-7 rounded-full bg-[var(--brand-maroon)] text-white flex items-center justify-center font-bold text-sm shrink-0">
              2
            </div>
            <p className="text-sm text-[var(--text-dark)] leading-relaxed pt-0.5">
              After the meeting, upload the recording here with your club name and date.
            </p>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-7 h-7 rounded-full bg-[var(--brand-maroon)] text-white flex items-center justify-center font-bold text-sm shrink-0">
              3
            </div>
            <p className="text-sm text-[var(--text-dark)] leading-relaxed pt-0.5">
              Within about 30 minutes, draft minutes appear on your result page and are
              emailed to you. Review, fix any{" "}
              <span className="bg-yellow-200 px-1 rounded text-xs font-mono">
                [SECRETARY TO CONFIRM]
              </span>{" "}
              markers, and circulate.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
