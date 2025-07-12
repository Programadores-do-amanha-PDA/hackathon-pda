export interface JustificationT {
  id?: string;
  user_email: string;
  message: string;
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
  justifications: JustificationT[] | null;
}
