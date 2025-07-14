"use server";
import { createClient } from "@/lib/supabase/server";
import { ClassroomActivity, ClassTypeT, JustificationDetails } from "@/types/classroom-activities";

export interface UpdateActivityData {
  class_type?: ClassTypeT;
  participants_email?: string[];
  is_visible_on_schedule?: boolean;
  justifications?: Record<string, JustificationDetails>;
}

export const updateActivityById = async (
  id: string,
  updateData: UpdateActivityData
): Promise<ClassroomActivity | null> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("classroom_activities")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as ClassroomActivity;
  } catch (error) {
    console.error("Error updating activity:", error);
    return null;
  }
};

export const updateActivityParticipants = async (
  id: string,
  participants: string[]
): Promise<ClassroomActivity | null> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("classroom_activities")
      .update({
        participants_email: participants,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as ClassroomActivity;
  } catch (error) {
    console.error("Error updating activity participants:", error);
    return null;
  }
};

export const updateActivityVisibility = async (
  id: string,
  isVisible: boolean
): Promise<ClassroomActivity | null> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("classroom_activities")
      .update({
        is_visible_on_schedule: isVisible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as ClassroomActivity;
  } catch (error) {
    console.error("Error updating activity visibility:", error);
    return null;
  }
};

export const deleteActivityById = async (id: string): Promise<boolean> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("classroom_activities")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting activity:", error);
    return false;
  }
};
