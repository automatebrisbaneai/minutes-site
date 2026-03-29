"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import pb from "@/lib/pocketbase";
import { generateShareCode, generatePin } from "@/lib/utils";
import { TEMPLATE_AGENDA_ITEMS, type CommitteeRole } from "@/lib/types";

interface CommitteeMemberRow {
  name: string;
  role: CommitteeRole;
}

const ROLES: { value: CommitteeRole; label: string }[] = [
  { value: "president", label: "President" },
  { value: "secretary", label: "Secretary" },
  { value: "treasurer", label: "Treasurer" },
  { value: "member", label: "Committee Member" },
];

export default function NewMeetingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdPin, setCreatedPin] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const [clubName, setClubName] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [venue, setVenue] = useState("");
  const [members, setMembers] = useState<CommitteeMemberRow[]>([
    { name: "", role: "president" },
    { name: "", role: "secretary" },
    { name: "", role: "treasurer" },
    { name: "", role: "member" },
  ]);

  function addMember() {
    setMembers([...members, { name: "", role: "member" }]);
  }

  function removeMember(i: number) {
    setMembers(members.filter((_, idx) => idx !== i));
  }

  function updateMember(i: number, field: keyof CommitteeMemberRow, value: string) {
    const updated = [...members];
    updated[i] = { ...updated[i], [field]: value };
    setMembers(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clubName || !meetingDate) {
      setError("Club name and date are required.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const pin = generatePin();

      // Create meeting
      const meeting = await pb.collection("mt_meetings").create({
        club_name: clubName,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        venue: venue,
        status: "draft",
        share_code: generateShareCode(),
        pin,
      });

      // Create committee members
      const validMembers = members.filter((m) => m.name.trim());
      await Promise.all(
        validMembers.map((m, i) =>
          pb.collection("mt_committee").create({
            meeting: meeting.id,
            name: m.name.trim(),
            role: m.role,
            order: i,
          })
        )
      );

      // Create template agenda items
      await Promise.all(
        TEMPLATE_AGENDA_ITEMS.map((item) =>
          pb.collection("mt_agenda_items").create({
            meeting: meeting.id,
            ...item,
          })
        )
      );

      // Show PIN before redirecting
      setCreatedPin(pin);
      setCreatedId(meeting.id);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
      setSaving(false);
    }
  }

  // PIN confirmation screen — shown after meeting is created
  if (createdPin && createdId) {
    return (
      <main className="max-w-xl mx-auto px-6 py-12">
        <div className="text-center">
          <p className="text-sm font-bold tracking-widest text-[var(--brand-green)] uppercase mb-2">
            Meeting Created
          </p>
          <h1 className="text-2xl mb-6">Write down your PIN</h1>

          <div className="inline-block bg-[var(--brand-cream)] border-2 border-[var(--brand-maroon)] rounded-lg px-12 py-8 mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Your PIN</p>
            <p className="text-5xl font-bold tracking-widest text-[var(--brand-maroon)]">
              {createdPin}
            </p>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-8 max-w-sm mx-auto">
            You&apos;ll need this PIN to access your meeting dashboard. Save it somewhere — it&apos;s the only way back in if you lose the link.
          </p>

          <button
            onClick={() => router.push(`/m/${createdId}`)}
            className="bg-[var(--brand-maroon)] text-white font-bold uppercase tracking-widest text-sm px-8 py-3 rounded hover:bg-[var(--color-maroon-hover)] transition-colors"
          >
            Go to Meeting Dashboard &rarr;
          </button>
        </div>
      </main>
    );
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
          Full Mode
        </p>
        <h1 className="text-2xl">New Meeting</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Meeting details */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--brand-maroon)]">
            Meeting Details
          </h2>

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
                Date <span className="text-red-600">*</span>
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
              <label className="block text-sm font-bold mb-1">Time</label>
              <input
                type="text"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                placeholder="e.g. 10:00 AM"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand-maroon)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Venue</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. Clubhouse"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand-maroon)]"
            />
          </div>
        </section>

        {/* Committee members */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--brand-maroon)]">
            Committee Members
          </h2>
          <p className="text-xs text-gray-500">
            Names are used by the AI to identify speakers in the recording.
          </p>

          {members.map((m, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={m.name}
                onChange={(e) => updateMember(i, "name", e.target.value)}
                placeholder="Full name"
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand-maroon)]"
              />
              <select
                value={m.role}
                onChange={(e) => updateMember(i, "role", e.target.value as CommitteeRole)}
                className="border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-[var(--brand-maroon)]"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              {members.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMember(i)}
                  className="text-gray-400 hover:text-red-600 text-lg leading-none"
                >
                  &times;
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addMember}
            className="text-sm text-[var(--brand-maroon)] hover:underline"
          >
            + Add member
          </button>
        </section>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[var(--brand-maroon)] text-white font-bold uppercase tracking-widest text-sm px-6 py-3 rounded hover:bg-[var(--color-maroon-hover)] disabled:opacity-50 transition-colors"
        >
          {saving ? "Creating..." : "Create Meeting"}
        </button>
      </form>
    </main>
  );
}
