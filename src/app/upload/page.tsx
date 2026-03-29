"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import pb from "@/lib/pocketbase";

const ACCEPTED_EXTS = [".m4a", ".mp3", ".wav", ".mp4", ".mov"];
const MAX_SIZE_BYTES = 500 * 1024 * 1024;

export default function UploadPage() {
  const router = useRouter();

  const [clubName, setClubName] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [email, setEmail] = useState("");
  const [agendaText, setAgendaText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.substring(f.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPTED_EXTS.includes(ext)) {
      setError(`File type not supported. Use: ${ACCEPTED_EXTS.join(", ")}`);
      return;
    }
    if (f.size > MAX_SIZE_BYTES) {
      setError("File too large. Maximum 500MB.");
      return;
    }
    setError("");
    setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f) return;
    const fakeEvent = { target: { files: [f] } } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(fakeEvent);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clubName || !meetingDate || !email) {
      setError("Club name, date, and email are required.");
      return;
    }
    if (!file) {
      setError("Please select a recording file.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("club_name", clubName);
      formData.append("meeting_date", meetingDate);
      formData.append("email", email);
      formData.append("agenda_text", agendaText);
      formData.append("recording", file);
      formData.append("status", "uploaded");

      const job = await pb.collection("mt_jobs").create(formData);
      router.push(`/r/${job.id}`);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
      setUploading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-12">
      <Link
        href="/"
        className="text-sm text-[var(--brand-maroon)] hover:underline mb-8 inline-block"
      >
        &larr; Back
      </Link>

      <div className="mb-8">
        <p className="text-sm font-bold tracking-widest text-[var(--brand-green)] uppercase mb-1">
          Simple Mode
        </p>
        <h1 className="text-2xl mb-2">Upload a Recording</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Fill in the details, upload your recording, and we&apos;ll email you draft minutes within about 30 minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Club + date */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">
              Club Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="e.g. Laurel Bank Croquet Club"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand-maroon)]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">
                Meeting Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand-maroon)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="secretary@club.org"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand-maroon)]"
                required
              />
            </div>
          </div>
        </div>

        {/* Agenda context */}
        <div>
          <label className="block text-sm font-bold mb-1">
            Agenda or Context{" "}
            <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            value={agendaText}
            onChange={(e) => setAgendaText(e.target.value)}
            placeholder="Paste your agenda here, or any notes about what was discussed. The AI uses this to make the minutes more accurate."
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand-maroon)] resize-none"
          />
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-bold mb-2">
            Recording <span className="text-red-600">*</span>
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded p-8 text-center cursor-pointer hover:border-[var(--brand-maroon)] transition-colors"
          >
            {file ? (
              <div>
                <p className="text-sm font-bold text-[var(--brand-maroon)]">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm font-bold text-gray-600 mb-1">
                  Drop file here or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  .m4a, .mp3, .wav, .mp4, .mov &bull; Max 500MB
                </p>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".m4a,.mp3,.wav,.mp4,.mov"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-[var(--brand-maroon)] text-white font-bold uppercase tracking-widest text-sm px-6 py-3 rounded hover:bg-[var(--color-maroon-hover)] disabled:opacity-50 transition-colors"
        >
          {uploading ? "Uploading..." : "Upload Recording"}
        </button>
      </form>

      {/* Cheat sheet reminder */}
      <div className="mt-10 p-4 bg-[var(--brand-cream)] border border-[var(--brand-maroon)] rounded text-sm">
        <p className="font-bold text-[var(--brand-maroon)] mb-1">Haven&apos;t recorded yet?</p>
        <p className="text-gray-700 text-sm">
          Print the{" "}
          <Link href="/cheat-sheet" className="text-[var(--brand-maroon)] underline">
            Recording Cheat Sheet
          </Link>{" "}
          first. It coaches the chair to say the right things so the AI produces better minutes.
        </p>
      </div>
    </main>
  );
}
