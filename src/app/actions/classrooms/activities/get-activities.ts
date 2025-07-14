"use server";
import { createClient } from "@/lib/supabase/server";
import { ClassroomActivity } from "@/types/classroom-activities";

export const getAllActivitiesByClassroomId = async (
  classroomId: string
): Promise<ClassroomActivity[] | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_activities")
      .select("*")
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ClassroomActivity[];
  } catch (error) {
    console.error("Error fetching activities:", error);
    return null;
  }
};

export const getActivityById = async (
  id: string
): Promise<ClassroomActivity | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_activities")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as ClassroomActivity;
  } catch (error) {
    console.error("Error fetching activity:", error);
    return null;
  }
};

export const getActivitiesByClassroomAndType = async (
  classroomId: string,
  classType: string
): Promise<ClassroomActivity[] | null> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_activities")
      .select("*")
      .eq("classroom_id", classroomId)
      .eq("class_type", classType)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ClassroomActivity[];
  } catch (error) {
    console.error("Error fetching activities by type:", error);
    return null;
  }
};