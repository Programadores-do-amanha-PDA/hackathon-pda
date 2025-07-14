"use server";
import { createClient } from "@/lib/supabase/server";
import { ClassroomActivity } from "@/types/classroom-activities";

export interface CreateJustificationData {
  user_email: string;
  message: string;
  created_by?: string;
}

interface JustificationStoredData {
  reason: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export const addActivityJustification = async (
  activityId: string,
  justificationData: CreateJustificationData
): Promise<ClassroomActivity | null> => {
  try {
    const supabase = await createClient();

    // buscar atividade atual
    const { data: activity, error: fetchError } = await supabase
      .from("classroom_activities")
      .select("justifications")
      .eq("id", activityId)
      .single();

    if (fetchError) throw fetchError;

    // atualizar justificações
    const currentJustifications = (activity?.justifications as Record<string, JustificationStoredData>) || {};
    const updatedJustifications = {
      ...currentJustifications,
      [justificationData.user_email]: {
        reason: justificationData.message,
        created_by: justificationData.created_by || "system",
        created_at: new Date().toISOString(),
      }
    };

    const { data, error } = await supabase
      .from("classroom_activities")
      .update({
        justifications: updatedJustifications,
        updated_at: new Date().toISOString()
      })
      .eq("id", activityId)
      .select()
      .single();

    if (error) throw error;
    return data as ClassroomActivity;
  } catch (error) {
    console.error("Error adding justification:", error);
    return null;
  }
};

export const updateActivityJustification = async (
  activityId: string,
  userEmail: string,
  justificationData: Omit<CreateJustificationData, 'user_email'>
): Promise<ClassroomActivity | null> => {
  try {
    const supabase = await createClient();

    // busca atividade atual
    const { data: activity, error: fetchError } = await supabase
      .from("classroom_activities")
      .select("justifications")
      .eq("id", activityId)
      .single();

    if (fetchError) throw fetchError;

    const currentJustifications = (activity?.justifications as Record<string, JustificationStoredData>) || {};

    if (!currentJustifications[userEmail]) {
      throw new Error("Justification not found for this user");
    }

    // atualiza justificação existente
    const updatedJustifications = {
      ...currentJustifications,
      [userEmail]: {
        ...currentJustifications[userEmail],
        reason: justificationData.message,
        created_by: justificationData.created_by || "system",
        updated_at: new Date().toISOString(),
      }
    };

    const { data, error } = await supabase
      .from("classroom_activities")
      .update({
        justifications: updatedJustifications,
        updated_at: new Date().toISOString()
      })
      .eq("id", activityId)
      .select()
      .single();

    if (error) throw error;
    return data as ClassroomActivity;
  } catch (error) {
    console.error("Error updating justification:", error);
    return null;
  }
};

export const removeActivityJustification = async (
  activityId: string,
  userEmail: string
): Promise<ClassroomActivity | null> => {
  try {
    const supabase = await createClient();

    // busca atividade atual
    const { data: activity, error: fetchError } = await supabase
      .from("classroom_activities")
      .select("justifications")
      .eq("id", activityId)
      .single();

    if (fetchError) throw fetchError;

    const currentJustifications = (activity?.justifications as Record<string, JustificationStoredData>) || {};

    // remove justificação de um usuário
    const updatedJustifications = { ...currentJustifications };
    delete updatedJustifications[userEmail];

    const { data, error } = await supabase
      .from("classroom_activities")
      .update({
        justifications: Object.keys(updatedJustifications).length > 0 ? updatedJustifications : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", activityId)
      .select()
      .single();

    if (error) throw error;
    return data as ClassroomActivity;
  } catch (error) {
    console.error("Error removing justification:", error);
    return null;
  }
};

export const getActivityJustifications = async (
  activityId: string
): Promise<Record<string, JustificationStoredData> | null> => {
  try {
    const supabase = await createClient();

    const { data: activity, error } = await supabase
      .from("classroom_activities")
      .select("justifications")
      .eq("id", activityId)
      .single();

    if (error) throw error;
    return (activity?.justifications as Record<string, JustificationStoredData>) || {};
  } catch (error) {
    console.error("Error fetching justifications:", error);
    return null;
  }
};

export const getJustificationByUserEmail = async (
  activityId: string,
  userEmail: string
): Promise<JustificationStoredData | null> => {
  try {
    const justifications = await getActivityJustifications(activityId);
    if (!justifications) return null;

    return justifications[userEmail] || null;
  } catch (error) {
    console.error("Error fetching user justification:", error);
    return null;
  }
};
