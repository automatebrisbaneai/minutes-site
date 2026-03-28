import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <p className="text-sm font-bold tracking-widest text-[var(--brand-green)] uppercase mb-2">
          CAQ Club Tool
        </p>
        <h1 className="text-3xl mb-4">Meeting Minutes</h1>
        <p className="text-lg text-[var(--text-dark)] leading-relaxed">
          Build your agenda during the month. Record your meeting. Upload the
          recording and get draft minutes back within 30 minutes.
        </p>
      </div>

      {/* Three steps */}
      <div className="space-y-6 mb-12">
        <div className="flex gap-5 items-start">
          <div className="w-10 h-10 rounded-full bg-[var(--brand-maroon)] text-white flex items-center justify-center font-bold text-lg shrink-0">
            1
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-dark)] uppercase tracking-wide mb-1">
              Build the Agenda
            </h3>
            <p className="text-[var(--text-dark)] text-sm leading-relaxed">
              Create a meeting and add agenda items as they come up over the
              month. Share the link so other committee members can add items
              too. The standard items (Open, Previous Minutes, Matters Arising,
              Reports) are pre-loaded.
            </p>
          </div>
        </div>

        <div className="flex gap-5 items-start">
          <div className="w-10 h-10 rounded-full bg-[var(--brand-maroon)] text-white flex items-center justify-center font-bold text-lg shrink-0">
            2
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-dark)] uppercase tracking-wide mb-1">
              Record the Meeting
            </h3>
            <p className="text-[var(--text-dark)] text-sm leading-relaxed">
              Place your phone in the centre of the table and hit record. The
              AI knows your agenda — when the chair says &quot;moved by Jane,
              seconded by John&quot;, it picks that up. Upload the file here
              when the meeting is done.
            </p>
          </div>
        </div>

        <div className="flex gap-5 items-start">
          <div className="w-10 h-10 rounded-full bg-[var(--brand-maroon)] text-white flex items-center justify-center font-bold text-lg shrink-0">
            3
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-dark)] uppercase tracking-wide mb-1">
              Get Draft Minutes
            </h3>
            <p className="text-[var(--text-dark)] text-sm leading-relaxed">
              Within about 30 minutes, draft minutes appear on the meeting
              page. Review, fix any{" "}
              <span className="bg-yellow-200 px-1 rounded text-xs font-mono">
                [SECRETARY TO CONFIRM]
              </span>{" "}
              markers, download as a document, and circulate.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/new"
        className="inline-block bg-[var(--brand-maroon)] text-white font-bold uppercase tracking-widest text-sm px-8 py-4 rounded hover:bg-[var(--color-maroon-hover)] transition-colors"
      >
        Create a New Meeting
      </Link>

      {/* Tips box */}
      <div className="mt-16 border border-[var(--brand-maroon)] rounded p-6 bg-white">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--brand-maroon)] mb-3">
          Tips for better minutes
        </h3>
        <ul className="text-sm text-[var(--text-dark)] space-y-2 leading-relaxed">
          <li>
            <strong>Phone placement:</strong> Centre of the table works well.
            Any phone or tablet does the job.
          </li>
          <li>
            <strong>When taking motions:</strong> Say the names clearly —
            &quot;Jane moves. John seconds.&quot; The AI listens for this.
          </li>
          <li>
            <strong>When voting:</strong> &quot;All in favour? Against?
            Carried.&quot; Out loud, clearly.
          </li>
          <li>
            <strong>Conflicts of interest:</strong> Say &quot;[Name] has
            declared a conflict and is leaving the room.&quot;
          </li>
          <li>
            <strong>File format:</strong> .m4a, .mp3, .wav, .mp4, or .mov.
            Maximum 500MB.
          </li>
        </ul>
      </div>
    </main>
  );
}
