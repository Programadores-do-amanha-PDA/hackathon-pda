"use server";
import { createClient } from "@/lib/supabase/server";
import {
  ZoomMeetingPastInstancesType,
  ZoomMeetingType,
} from "@/types/zoom/meetings";

const getAllZoomMeetingsByClassroomId = async (classroomId: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_zoom_meetings")
      .select()
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching all classroom zoom meetings:", error);
    return false;
  }
};

const getZoomMeetingById = async (meetingId: string) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_zoom_meetings")
      .select()
      .eq("id", meetingId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching zoom meeting by ID:", error);
    return false;
  }
};

const createZoomMeetingByClassroomId = async (
  meetingData: Partial<ZoomMeetingType>
) => {
  try {
    const supabase = await createClient();

    if (
      !meetingData.classroom_id ||
      !meetingData.topic ||
      !meetingData.start_time
    ) {
      throw new Error(
        "Missing required fields: classroom_id, topic, or start_time"
      );
    }

    const { data, error } = await supabase
      .from("classroom_zoom_meetings")
      .insert(meetingData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating zoom meeting:", error);
    return false;
  }
};

const updateZoomMeetingById = async (
  meetingId: string,
  updates: Partial<ZoomMeetingType>
) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_zoom_meetings")
      .update(updates)
      .eq("id", meetingId)
      .select()
      .single();

    if (error) throw error;
    return data as ZoomMeetingType;
  } catch (error) {
    console.error("Error updating zoom meeting:", error);
    return false;
  }
};

const updateZoomMeetingPastInstanceByMeetingId = async (
  meetingId: string | string,
  pastInstanceId: string,
  updates: Partial<ZoomMeetingPastInstancesType>
) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("classroom_zoom_meetings")
      .update(updates)
      .eq("id", meetingId)
      .eq(
        "past_instances->uuid",
        encodeURIComponent(encodeURIComponent(pastInstanceId))
      )
      .select()
      .single();

    if (error) throw error;
    return data as ZoomMeetingType;
  } catch (error) {
    console.error("Error updating zoom meeting:", error);
    return false;
  }
};

const deleteZoomMeetingById = async (meetingId: string) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("classroom_zoom_meetings")
      .delete()
      .eq("id", meetingId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting zoom meeting:", error);
    return false;
  }
};

export {
  getAllZoomMeetingsByClassroomId,
  getZoomMeetingById,
  createZoomMeetingByClassroomId,
  updateZoomMeetingById,
  updateZoomMeetingPastInstanceByMeetingId,
  deleteZoomMeetingById,
};
