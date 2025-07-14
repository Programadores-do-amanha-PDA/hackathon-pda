export interface JustificationT {
  id?: string;
  user_email: string;
  message: string;
}

export interface JustificationDetails {
  reason: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export type ClassTypeT =
  | "programming"
  | "english"
  | "soft-skills"
  | "community";

export interface ClassroomActivity {
  id: string;
  classroom_id: string;
  class_type: ClassTypeT | null;
  participants_email: string[] | null;
  is_visible_on_schedule: boolean | null;
  created_at: Date | string;
  updated_at: Date | string | null;
  justifications: Record<string, JustificationDetails> | null;
}

export interface ActivitySubmission {
  id: string;
  activity_id: string;
  user_email: string;
  status: "pending" | "completed" | "late" | "justified";
  submitted_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string | null;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  classroom_id: string;
  created_at: Date | string;
  updated_at: Date | string | null;
}

export interface ActivitySubmissionSummary {
  total: number;
  submitted: number;
  missing: number;
  justified: number;
  submissionRate: number;
}

export interface StudentSubmissionStatus {
  student: Student;
  status: "E" | "F" | "PJ"; // Entregue, Falta, Pendência Justificada
  justification?: {
    reason: string;
    created_by: string;
    created_at: string;
  };
  submitted_at?: string;
}

export interface CSVActivityData {
  email: string;
  timestamp: string;
  score: number;
}

export interface JustificationDetails {
  reason: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}
