import {
  getZoomMeetingById,
  getAllZoomMeetingsByClassroomId,
  updateZoomMeetingById,
  deleteZoomMeetingById,
} from "@/app/actions/classrooms/zoom/meetings";
import { ZoomMeetingType } from "@/types/zoom/meetings";
import { useState } from "react";
import { toast } from "sonner";

const useZoomMeetingsStack = () => {
  const [meetings, setMeetings] = useState<ZoomMeetingType[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetAllZoomMeetings = async (classroomId: string) => {
    try {
      setLoading(true);
      const meetingsResponse = await getAllZoomMeetingsByClassroomId(
        classroomId
      );
      if (!meetingsResponse) throw "no meetings response";
      setMeetings(meetingsResponse);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleGetZoomMeetingById = async (id: string) => {
    try {
      setLoading(true);
      const meetingResponse = await getZoomMeetingById(id);
      if (!meetingResponse) throw "no meeting response";
      return meetingResponse as ZoomMeetingType;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateZoomMeeting = async (
    id: string,
    updates: Partial<ZoomMeetingType>
  ) => {
    try {
      if (!id || !updates) {
        throw new Error("id and updates fields are required");
      }
      const updatedMeeting = await updateZoomMeetingById(id, updates);
      if (!updatedMeeting) throw new Error("no update meeting response");

      setMeetings((meetings) =>
        meetings.map((meeting) =>
          meeting.id === id ? updatedMeeting : meeting
        )
      );
      toast.success("Reunião atualizada com sucesso!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar a reunião!");
      return false;
    }
  };

  const handleDeleteZoomMeeting = async (id: string) => {
    try {
      if (!id) throw new Error("meeting id is required to delete");
      setLoading(true);
      const response = await deleteZoomMeetingById(id);
      if (!response) throw new Error("no delete meeting response");

      setMeetings((meetings) =>
        meetings.filter((meeting) => meeting.id !== id)
      );
      toast.success("Reunião deletada com sucesso!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao deletar reunião. Tente novamente mais tarde!");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    meetings,
    setMeetings,
    meetingsLoading: loading,
    handleGetAllZoomMeetings,
    handleGetZoomMeetingById,
    handleUpdateZoomMeeting,
    handleDeleteZoomMeeting,
  };
};

export default useZoomMeetingsStack;

export interface ZoomMeetingsStackI {
  meetings: ZoomMeetingType[];
  meetingsLoading: boolean;
  handleGetAllZoomMeetings: (classroomId: string) => Promise<boolean>;
  handleGetZoomMeetingById: (id: string) => Promise<false | ZoomMeetingType>;
  handleUpdateZoomMeeting: (
    id: string,
    updates: Partial<ZoomMeetingType>
  ) => Promise<boolean>;
  handleDeleteZoomMeeting: (id: string) => Promise<boolean>;
}
