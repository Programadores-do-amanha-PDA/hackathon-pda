"use server";
import { createClient } from "@/lib/supabase/server";
import { ClassroomActivity, Student, StudentSubmissionStatus } from "@/types/classroom-activities";

export type { StudentSubmissionStatus };

export const getStudentsByClassroomId = async (
  classroomId: string
): Promise<Student[] | null> => {
  try {
    const supabase = await createClient();

    const { data: userClassrooms, error: userError } = await supabase
      .from("user_classrooms")
      .select("profiles(id, email, full_name)")
      .eq("classroom_id", classroomId);

    if (userError) throw userError;

    const students: Student[] = userClassrooms
      ?.filter(uc => uc.profiles)
      ?.map(uc => {
        const profile = uc.profiles as unknown as { id: string; email: string; full_name: string | null };
        return {
          id: profile.id,
          name: profile.full_name || profile.email,
          email: profile.email,
          classroom_id: classroomId,
          created_at: new Date().toISOString(),
          updated_at: null,
        };
      }) || [];

    return students;
  } catch (error) {
    console.error("Error fetching students:", error);
    return null;
  }
};

export const getSubmissionStatusByActivity = async (
  activityId: string,
  classroomId: string
): Promise<StudentSubmissionStatus[] | null> => {
  try {
    const supabase = await createClient();

    // busca a atividade
    const { data: activity, error: activityError } = await supabase
      .from("classroom_activities")
      .select("*")
      .eq("id", activityId)
      .single();

    if (activityError) throw activityError;

    const students = await getStudentsByClassroomId(classroomId);
    if (!students) return null;

    const activityData = activity as ClassroomActivity;
    const participantsEmails = activityData.participants_email || [];
    const justifications = (activityData.justifications as unknown as Record<string, {
      reason: string;
      created_by: string;
      created_at: string;
    }>) || {};

    const submissionStatuses: StudentSubmissionStatus[] = students.map(student => {
      const hasSubmitted = participantsEmails.includes(student.email);
      const hasJustification = justifications[student.email];

      let status: "E" | "F" | "PJ";
      if (hasSubmitted) {
        status = "E"; // Entregue
      } else if (hasJustification) {
        status = "PJ"; // Pendência Justificada
      } else {
        status = "F"; // Falta
      }

      return {
        student,
        status,
        justification: hasJustification ? {
          reason: hasJustification.reason,
          created_by: hasJustification.created_by,
          created_at: hasJustification.created_at,
        } : undefined,
        submitted_at: hasSubmitted ? (typeof activityData.created_at === 'string' ? activityData.created_at : activityData.created_at.toISOString()) : undefined,
      };
    });

    return submissionStatuses;
  } catch (error) {
    console.error("Error fetching submission status:", error);
    return null;
  }
};

export const getActivitySubmissionSummary = async (
  activityId: string,
  classroomId: string
): Promise<{
  total: number;
  submitted: number;
  missing: number;
  justified: number;
  submissionRate: number;
} | null> => {
  try {
    const submissionStatuses = await getSubmissionStatusByActivity(activityId, classroomId);
    if (!submissionStatuses) return null;

    const total = submissionStatuses.length;
    const submitted = submissionStatuses.filter(s => s.status === "E").length;
    const missing = submissionStatuses.filter(s => s.status === "F").length;
    const justified = submissionStatuses.filter(s => s.status === "PJ").length;
    const submissionRate = total > 0 ? (submitted / total) * 100 : 0;

    return {
      total,
      submitted,
      missing,
      justified,
      submissionRate: Math.round(submissionRate * 100) / 100,
    };
  } catch (error) {
    console.error("Error getting submission summary:", error);
    return null;
  }
};
