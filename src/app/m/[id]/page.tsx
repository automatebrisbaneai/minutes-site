"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import pb from "@/lib/pocketbase";
import { formatDate } from "@/lib/utils";
import type {
  Meeting,
  CommitteeMember,
  AgendaItem,
  Recording,
  Minutes,
  AgendaItemType,
} from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  "agenda-set": "Agenda Set",
  recorded: "Recording Uploaded",
  processing: "Processing...",
  done: "Minutes Ready",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-200 text-gray-700",
  "agenda-set": "bg-blue-100 text-blue-800",
  recorded: "bg-yellow-100 text-yellow-800",
  processing: "bg-orange-100 text-orange-800",
  done: "bg-green-100 text-green-800",
};

const ITEM_TYPE_LABELS: Record<AgendaItemType, string> = {
  decision: "Decision",
  report: "Report",
  info: "Info",
};

export default function MeetingDashboard() {
  const params = useParams();
  const id = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [minutes, setMinutes] = useState<Minutes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // PIN gate
  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinChecking, setPinChecking] = useState(false);

  // Agenda editing state
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemType, setNewItemType] = useState<AgendaItemType>("decision");
  const [addingItem, setAddingItem] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Check sessionStorage for verified PIN on mount
  useEffect(() => {
    const key = `pin_verified_${id}`;
    if (sessionStorage.getItem(key) === "1") {
      setPinVerified(true);
    }
  }, [id]);

  async function checkPin() {
    if (!pinInput || pinInput.length !== 4) {
      setPinError("Enter your 4-digit PIN.");
      return;
    }
    setPinChecking(true);
    setPinError("");
    try {
      const mtg = await pb.collection("mt_meetings").getOne<Meeting>(id);
      if (mtg.pin === pinInput) {
        sessionStorage.setItem(`pin_verified_${id}`, "1");
        setPinVerified(true);
      } else {
        setPinError("Incorrect PIN. Try again.");
      }
    } catch {
      setPinError("Meeting not found.");
    } finally {
      setPinChecking(false);
    }
  }

  const loadData = useCallback(async () => {
    try {
      const [mtg, mtgMembers, items, recordings, mins] = await Promise.all([
        pb.collection("mt_meetings").getOne<Meeting>(id),
        pb.collection("mt_committee").getFullList<CommitteeMember>({
          filter: `meeting="${id}"`,
          sort: "order",
        }),
        pb.collection("mt_agenda_items").getFullList<AgendaItem>({
          filter: `meeting="${id}"`,
          sort: "number",
        }),
        pb.collection("mt_recordings").getFullList<Recording>({
          filter: `meeting="${id}"`,
          sort: "-created",
        }),
        pb.collection("mt_minutes").getFullList<Minutes>({
          filter: `meeting="${id}"`,
          sort: "-created",
        }),
      ]);
      setMeeting(mtg);
      setMembers(mtgMembers);
      setAgendaItems(items);
      setRecording(recordings[0] || null);
      setMinutes(mins[0] || null);
    } catch {
      setError("Meeting not found.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (pinVerified) loadData();
  }, [loadData, pinVerified]);

  async function addAgendaItem() {
    if (!newItemTitle.trim()) return;
    const nextNumber =
      agendaItems.length > 0
        ? Math.max(...agendaItems.map((i) => i.number)) + 1
        : 1;
    try {
      await pb.collection("mt_agenda_items").create({
        meeting: id,
        number: nextNumber,
        title: newItemTitle.trim(),
        description: newItemDesc.trim(),
        item_type: newItemType,
      });
      setNewItemTitle("");
      setNewItemDesc("");
      setNewItemType("decision");
      setAddingItem(false);
      await loadData();
      // Update status if still draft
      if (meeting?.status === "draft") {
        await pb.collection("mt_meetings").update(id, { status: "agenda-set" });
        setMeeting((m) => m ? { ...m, status: "agenda-set" } : m);
      }
    } catch (err) {
      console.error("Failed to add item", err);
    }
  }

  async function deleteAgendaItem(itemId: string) {
    try {
      await pb.collection("mt_agenda_items").delete(itemId);
      await loadData();
    } catch (err) {
      console.error("Failed to delete item", err);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ACCEPTED = [".m4a", ".mp3", ".wav", ".mp4", ".mov"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      alert(`File type not supported. Use: ${ACCEPTED.join(", ")}`);
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      alert("File too large. Maximum 500MB.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("meeting", id);
      formData.append("file", file);

      await pb.collection("mt_recordings").create(formData);
      await pb.collection("mt_meetings").update(id, { status: "recorded" });
      await loadData();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function downloadMinutes() {
    if (!minutes || !meeting) return;
    const blob = new Blob([minutes.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `minutes-${meeting.club_name.replace(/\s+/g, "-")}-${meeting.meeting_date}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function renderMinutesContent(content: string) {
    // Highlight [SECRETARY TO CONFIRM] markers
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

  // PIN gate screen
  if (!pinVerified) {
    return (
      <main className="max-w-sm mx-auto px-6 py-24 text-center">
        <p className="text-sm font-bold tracking-widest text-[var(--brand-green)] uppercase mb-2">
          Full Mode
        </p>
        <h1 className="text-2xl mb-2">Enter PIN</h1>
        <p className="text-sm text-gray-500 mb-8">
          Enter the 4-digit PIN you received when you created this meeting.
        </p>
        <div className="flex flex-col items-center gap-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
            onKeyDown={(e) => e.key === "Enter" && checkPin()}
            placeholder="0000"
            className="text-center text-3xl tracking-widest w-32 border-2 border-gray-300 rounded px-3 py-3 focus:outline-none focus:border-[var(--brand-maroon)]"
            autoFocus
          />
          {pinError && <p className="text-red-600 text-sm">{pinError}</p>}
          <button
            onClick={checkPin}
            disabled={pinChecking || pinInput.length !== 4}
            className="bg-[var(--brand-maroon)] text-white font-bold uppercase tracking-widest text-sm px-8 py-3 rounded hover:bg-[var(--color-maroon-hover)] disabled:opacity-50 transition-colors"
          >
            {pinChecking ? "Checking..." : "Enter"}
          </button>
        </div>
        <Link href="/" className="text-xs text-gray-400 hover:underline mt-8 inline-block">
          &larr; Home
        </Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (error || !meeting) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-red-600">{error || "Meeting not found."}</p>
        <Link href="/" className="text-[var(--brand-maroon)] hover:underline text-sm mt-4 inline-block">
          &larr; Home
        </Link>
      </main>
    );
  }

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.href}`
    : "";

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div>
        <Link href="/" className="text-sm text-[var(--brand-maroon)] hover:underline mb-4 inline-block">
          &larr; Home
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl mb-1">{meeting.club_name}</h1>
            <p className="text-sm text-gray-600">
              {formatDate(meeting.meeting_date)}
              {meeting.meeting_time && ` at ${meeting.meeting_time}`}
              {meeting.venue && ` — ${meeting.venue}`}
            </p>
          </div>
          <span
            className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${STATUS_COLORS[meeting.status] || "bg-gray-100"}`}
          >
            {STATUS_LABELS[meeting.status] || meeting.status}
          </span>
        </div>
        {/* Share link */}
        <div className="mt-3 text-xs text-gray-500">
          Share this page so committee members can add agenda items:{" "}
          <span className="font-mono text-[var(--brand-maroon)]">{shareUrl}</span>
        </div>
      </div>

      {/* 1. Agenda Builder */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold uppercase tracking-widest text-[var(--brand-maroon)]">
            Agenda
          </h2>
          <div className="flex gap-3">
            <Link
              href={`/m/${id}/agenda`}
              target="_blank"
              className="text-xs text-[var(--brand-maroon)] hover:underline"
            >
              Print agenda &rarr;
            </Link>
          </div>
        </div>

        <div className="space-y-2">
          {agendaItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 bg-white rounded border border-gray-200"
            >
              <span className="text-sm font-bold text-[var(--brand-maroon)] w-6 shrink-0">
                {item.number}.
              </span>
              <div className="flex-1 min-w-0">
                {editingItem === item.id ? (
                  <EditItemInline
                    item={item}
                    onSave={async (updates) => {
                      await pb.collection("mt_agenda_items").update(item.id, updates);
                      setEditingItem(null);
                      await loadData();
                    }}
                    onCancel={() => setEditingItem(null)}
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[var(--text-dark)]">
                        {item.title}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                        {ITEM_TYPE_LABELS[item.item_type]}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    )}
                  </>
                )}
              </div>
              {editingItem !== item.id && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setEditingItem(item.id)}
                    className="text-xs text-gray-400 hover:text-[var(--brand-maroon)]"
                  >
                    Edit
                  </button>
                  {item.number > 4 && (
                    <button
                      onClick={() => deleteAgendaItem(item.id)}
                      className="text-xs text-gray-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add item */}
        {addingItem ? (
          <div className="mt-3 p-4 bg-white rounded border border-gray-200 space-y-3">
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="Item title — write it as a specific decision to be made"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand-maroon)]"
              autoFocus
            />
            <textarea
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
              placeholder="Context or details (optional)"
              rows={2}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--brand-maroon)] resize-none"
            />
            <div className="flex items-center gap-3">
              <select
                value={newItemType}
                onChange={(e) => setNewItemType(e.target.value as AgendaItemType)}
                className="border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none focus:border-[var(--brand-maroon)]"
              >
                <option value="decision">Decision</option>
                <option value="report">Report</option>
                <option value="info">Info</option>
              </select>
              <button
                onClick={addAgendaItem}
                className="bg-[var(--brand-maroon)] text-white text-sm font-bold px-4 py-2 rounded hover:bg-[var(--color-maroon-hover)]"
              >
                Add
              </button>
              <button
                onClick={() => setAddingItem(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingItem(true)}
            className="mt-3 text-sm text-[var(--brand-maroon)] hover:underline"
          >
            + Add agenda item
          </button>
        )}

        {/* Committee members */}
        {members.length > 0 && (
          <div className="mt-4 text-xs text-gray-500">
            <strong>Attending:</strong>{" "}
            {members.map((m) => `${m.name} (${m.role})`).join(", ")}
          </div>
        )}
      </section>

      {/* 2. Recording Upload */}
      <section>
        <h2 className="text-base font-bold uppercase tracking-widest text-[var(--brand-maroon)] mb-4">
          Recording
        </h2>

        {recording ? (
          <div className="p-4 bg-white rounded border border-gray-200">
            <p className="text-sm font-bold text-green-700">Recording uploaded</p>
            <p className="text-xs text-gray-500 mt-1">
              File: {recording.file} &nbsp;&bull;&nbsp; Uploaded:{" "}
              {new Date(recording.created).toLocaleString("en-AU")}
            </p>
            {meeting.status === "recorded" && (
              <p className="text-xs text-gray-500 mt-2">
                Processing will begin shortly. Check back in about 30 minutes.
              </p>
            )}
          </div>
        ) : (
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center hover:border-[var(--brand-maroon)] transition-colors">
              {uploading ? (
                <p className="text-sm text-gray-600">Uploading...</p>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-600 mb-1">
                    Drop audio or video file here
                  </p>
                  <p className="text-xs text-gray-400">
                    .m4a, .mp3, .wav, .mp4, .mov &nbsp;&bull;&nbsp; Max 500MB
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              accept=".m4a,.mp3,.wav,.mp4,.mov"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </section>

      {/* 3. Minutes Output */}
      {minutes && (
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
                href={`/m/${id}/minutes`}
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
              <mark className="bg-yellow-200 px-1 rounded font-mono">
                [SECRETARY TO CONFIRM]
              </mark>{" "}
              markers before circulating.
            </p>
            <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-[var(--text-dark)]">
              {renderMinutesContent(minutes.content)}
            </pre>
          </div>
        </section>
      )}

      {/* Processing status */}
      {meeting.status === "processing" && !minutes && (
        <section>
          <h2 className="text-base font-bold uppercase tracking-widest text-[var(--brand-maroon)] mb-4">
            Minutes
          </h2>
          <div className="p-6 bg-orange-50 border border-orange-200 rounded text-center">
            <p className="text-sm font-bold text-orange-800">Processing...</p>
            <p className="text-xs text-orange-600 mt-1">
              Transcribing and formatting. This takes about 30 minutes for a 1-hour meeting.
              Refresh this page to check progress.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}

// Inline edit component for agenda items
function EditItemInline({
  item,
  onSave,
  onCancel,
}: {
  item: AgendaItem;
  onSave: (updates: Partial<AgendaItem>) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [itemType, setItemType] = useState<AgendaItemType>(item.item_type);

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[var(--brand-maroon)]"
        autoFocus
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[var(--brand-maroon)] resize-none"
      />
      <div className="flex gap-2 items-center">
        <select
          value={itemType}
          onChange={(e) => setItemType(e.target.value as AgendaItemType)}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="decision">Decision</option>
          <option value="report">Report</option>
          <option value="info">Info</option>
        </select>
        <button
          onClick={() => onSave({ title, description, item_type: itemType })}
          className="bg-[var(--brand-maroon)] text-white text-xs font-bold px-3 py-1 rounded hover:bg-[var(--color-maroon-hover)]"
        >
          Save
        </button>
        <button onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-700">
          Cancel
        </button>
      </div>
    </div>
  );
}
