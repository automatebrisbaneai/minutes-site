// PocketBase record types for the minutes tool (mt_ prefix)

export type MeetingStatus =
  | "draft"
  | "agenda-set"
  | "recorded"
  | "processing"
  | "done";

export interface Meeting {
  id: string;
  club_name: string;
  meeting_date: string;
  meeting_time: string;
  venue: string;
  status: MeetingStatus;
  share_code: string;
  pin: string;
  created: string;
  updated: string;
}

// Simple mode — single job record
export type JobStatus = "uploaded" | "processing" | "done" | "failed";

export interface Job {
  id: string;
  club_name: string;
  meeting_date: string;
  email: string;
  agenda_text: string;
  recording: string;
  status: JobStatus;
  transcript: string;
  minutes_content: string;
  minutes_style: "motions" | "summary";
  created: string;
  updated: string;
}

export type CommitteeRole =
  | "president"
  | "secretary"
  | "treasurer"
  | "member";

export interface CommitteeMember {
  id: string;
  meeting: string;
  name: string;
  role: CommitteeRole;
  order: number;
}

export type AgendaItemType = "decision" | "report" | "info";

export interface AgendaItem {
  id: string;
  meeting: string;
  number: number;
  title: string;
  description: string;
  item_type: AgendaItemType;
}

export interface Recording {
  id: string;
  meeting: string;
  file: string;
  transcript: string;
  duration_seconds: number;
  created: string;
}

export interface Minutes {
  id: string;
  meeting: string;
  content: string;
  style: "motions" | "summary";
  generated_at: string;
}

// Template agenda items pre-populated for every new meeting
export const TEMPLATE_AGENDA_ITEMS: Omit<AgendaItem, "id" | "meeting">[] = [
  {
    number: 1,
    title: "Open",
    description: "Record attendance and apologies. Confirm quorum.",
    item_type: "info",
  },
  {
    number: 2,
    title: "Previous Minutes",
    description: "Confirm minutes of previous meeting as a true and accurate record.",
    item_type: "decision",
  },
  {
    number: 3,
    title: "Matters Arising",
    description: "Updates on actions from the previous meeting.",
    item_type: "info",
  },
  {
    number: 4,
    title: "Reports",
    description: "Treasurer's report. Any other officer or subcommittee reports.",
    item_type: "report",
  },
];
