"use server";
import { createClient } from "@/lib/supabase/server";
import { ClassroomActivity, ClassTypeT } from "@/types/classroom-activities";

export interface CreateActivityData {
  classroom_id: string;
  class_type: ClassTypeT;
  participants_email: string[];
  is_visible_on_schedule?: boolean;
}

export const createActivity = async (
  activityData: CreateActivityData
): Promise<ClassroomActivity | null> => {
  try {
    const supabase = await createClient();
    
    const insertData = {
      ...activityData,
      is_visible_on_schedule: activityData.is_visible_on_schedule ?? true,
      justifications: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("classroom_activities")
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return data as ClassroomActivity;
  } catch (error) {
    console.error("Error creating activity:", error);
    return null;
  }
};

export const createActivityFromCSV = async (
  classroomId: string,
  classType: ClassTypeT,
  csvData: { email: string; timestamp: string; score: number }[]
): Promise<ClassroomActivity | null> => {
  try {
    const participantsEmail = csvData.map(row => row.email);
    
    const activityData: CreateActivityData = {
      classroom_id: classroomId,
      class_type: classType,
      participants_email: participantsEmail,
      is_visible_on_schedule: true,
    };

    return await createActivity(activityData);
  } catch (error) {
    console.error("Error creating activity from CSV:", error);
    return null;
  }
};

export const bulkCreateActivities = async (
  activities: CreateActivityData[]
): Promise<ClassroomActivity[] | null> => {
  try {
    const supabase = await createClient();
    
    const insertData = activities.map(activity => ({
      ...activity,
      is_visible_on_schedule: activity.is_visible_on_schedule ?? true,
      justifications: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("classroom_activities")
      .insert(insertData)
      .select();

    if (error) throw error;
    return data as ClassroomActivity[];
  } catch (error) {
    console.error("Error bulk creating activities:", error);
    return null;
  }
};