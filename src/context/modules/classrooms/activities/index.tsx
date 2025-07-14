"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  getAllActivitiesByClassroomId,
  getActivityById,
  getActivitiesByClassroomAndType,
} from "@/app/actions/classrooms/activities/get-activities";
import {
  createActivity,
  createActivityFromCSV,
  bulkCreateActivities,
  CreateActivityData,
} from "@/app/actions/classrooms/activities/create-activity";
import {
  updateActivityById,
  updateActivityParticipants,
  updateActivityVisibility,
  deleteActivityById,
  UpdateActivityData,
} from "@/app/actions/classrooms/activities/update-activity";
import {
  getSubmissionStatusByActivity,
  getActivitySubmissionSummary,
  getStudentsByClassroomId,
  StudentSubmissionStatus,
} from "@/app/actions/classrooms/activities/get-submissions";
import {
  addActivityJustification,
  updateActivityJustification,
  removeActivityJustification,
  getActivityJustifications,
  getJustificationByUserEmail,
  CreateJustificationData,
} from "@/app/actions/classrooms/activities/manage-justifications";
import {
  ClassroomActivity,
  ClassTypeT,
  Student,
  ActivitySubmissionSummary,
  JustificationDetails,
} from "@/types/classroom-activities";

const useClassroomActivities = () => {
  const [activities, setActivities] = useState<ClassroomActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [submissionStatuses, setSubmissionStatuses] = useState<StudentSubmissionStatus[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const handleGetAllActivitiesByClassroomId = async (classroomId: string) => {
    setLoading(true);
    try {
      if (!classroomId) throw new Error("Classroom ID is required");
      const allActivities = await getAllActivitiesByClassroomId(classroomId);
      if (!allActivities) throw new Error("No activities found");
      setActivities(allActivities);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar atividades. Tente novamente mais tarde.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleGetActivityById = async (id: string) => {
    try {
      if (!id) throw new Error("Activity ID is required");
      const activity = await getActivityById(id);
      if (!activity) throw new Error("Activity not found");
      return activity;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar atividade. Tente novamente mais tarde.");
      return null;
    }
  };

  const handleGetActivitiesByType = async (classroomId: string, classType: ClassTypeT) => {
    setLoading(true);
    try {
      if (!classroomId || !classType) throw new Error("Classroom ID and class type are required");
      const activities = await getActivitiesByClassroomAndType(classroomId, classType);
      if (!activities) throw new Error("No activities found");
      setActivities(activities);
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar atividades por tipo. Tente novamente mais tarde.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async (activityData: CreateActivityData) => {
    try {
      if (!activityData.classroom_id || !activityData.class_type) {
        throw new Error("Classroom ID and class type are required");
      }
      const activityCreated = await createActivity(activityData);
      if (!activityCreated) throw new Error("Activity creation failed");
      setActivities((prevActivities) => [activityCreated, ...prevActivities]);
      toast.success("Atividade criada com sucesso!");
      return activityCreated;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar atividade. Tente novamente mais tarde.");
      return null;
    }
  };

  const handleCreateActivityFromCSV = async (
    classroomId: string,
    classType: ClassTypeT,
    csvData: { email: string; timestamp: string; score: number }[]
  ) => {
    try {
      if (!classroomId || !classType || !csvData.length) {
        throw new Error("Classroom ID, class type and CSV data are required");
      }
      const activityCreated = await createActivityFromCSV(classroomId, classType, csvData);
      if (!activityCreated) throw new Error("Activity creation from CSV failed");
      setActivities((prevActivities) => [activityCreated, ...prevActivities]);
      toast.success("Atividade criada a partir do CSV com sucesso!");
      return activityCreated;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar atividade do CSV. Tente novamente mais tarde.");
      return null;
    }
  };

  const handleBulkCreateActivities = async (activitiesData: CreateActivityData[]) => {
    try {
      if (!activitiesData.length) throw new Error("Activities data is required");
      const activitiesCreated = await bulkCreateActivities(activitiesData);
      if (!activitiesCreated) throw new Error("Bulk activities creation failed");
      setActivities((prevActivities) => [...activitiesCreated, ...prevActivities]);
      toast.success(`${activitiesCreated.length} atividades criadas com sucesso!`);
      return activitiesCreated;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar atividades em lote. Tente novamente mais tarde.");
      return null;
    }
  };

  const handleUpdateActivity = async (id: string, updateData: UpdateActivityData) => {
    try {
      if (!id || !updateData) throw new Error("Activity ID and update data are required");
      const updatedActivity = await updateActivityById(id, updateData);
      if (!updatedActivity) throw new Error("Activity update failed");
      setActivities((prevActivities) =>
        prevActivities.map((activity) =>
          activity.id === updatedActivity.id ? updatedActivity : activity
        )
      );
      toast.success("Atividade atualizada com sucesso!");
      return updatedActivity;
    } catch (error) {
      console.error("Error updating activity:", error);
      toast.error("Erro ao atualizar atividade. Tente novamente mais tarde.");
      return null;
    }
  };

  const handleUpdateActivityParticipants = async (id: string, participants: string[]) => {
    try {
      if (!id || !participants) throw new Error("Activity ID and participants are required");
      const updatedActivity = await updateActivityParticipants(id, participants);
      if (!updatedActivity) throw new Error("Activity participants update failed");
      setActivities((prevActivities) =>
        prevActivities.map((activity) =>
          activity.id === updatedActivity.id ? updatedActivity : activity
        )
      );
      toast.success("Participantes da atividade atualizados com sucesso!");
      return updatedActivity;
    } catch (error) {
      console.error("Error updating activity participants:", error);
      toast.error("Erro ao atualizar participantes. Tente novamente mais tarde.");
      return null;
    }
  };

  const handleUpdateActivityVisibility = async (id: string, isVisible: boolean) => {
    try {
      if (!id) throw new Error("Activity ID is required");
      const updatedActivity = await updateActivityVisibility(id, isVisible);
      if (!updatedActivity) throw new Error("Activity visibility update failed");
      setActivities((prevActivities) =>
        prevActivities.map((activity) =>
          activity.id === updatedActivity.id ? updatedActivity : activity
        )
      );
      toast.success("Visibilidade da atividade atualizada com sucesso!");
      return updatedActivity;
    } catch (error) {
      console.error("Error updating activity visibility:", error);
      toast.error("Erro ao atualizar visibilidade. Tente novamente mais tarde.");
      return null;
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      if (!id) throw new Error("Activity ID is required");
      const success = await deleteActivityById(id);
      if (!success) throw new Error("Activity deletion failed");
      setActivities((prevActivities) =>
        prevActivities.filter((activity) => activity.id !== id)
      );
      toast.success("Atividade deletada com sucesso!");
      return true;
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast.error("Erro ao deletar atividade. Tente novamente mais tarde.");
      return false;
    }
  };

  const handleGetSubmissionStatus = async (activityId: string, classroomId: string) => {
    try {
      if (!activityId || !classroomId) throw new Error("Activity ID and classroom ID are required");
      const statuses = await getSubmissionStatusByActivity(activityId, classroomId);
      if (!statuses) throw new Error("No submission statuses found");
      setSubmissionStatuses(statuses);
      return statuses;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar status das entregas. Tente novamente mais tarde.");
      return null;
    }
  };

  const handleGetSubmissionSummary = async (activityId: string, classroomId: string) => {
    try {
      if (!activityId || !classroomId) throw new Error("Activity ID and classroom ID are required");
      const summary = await getActivitySubmissionSummary(activityId, classroomId);
      if (!summary) throw new Error("No submission summary found");
      return summary;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar resumo das entregas. Tente novamente mais tarde.");
      return null;
    }
  };

  const handleGetStudentsByClassroom = async (classroomId: string) => {
    try {
      if (!classroomId) throw new Error("Classroom ID is required");
      const studentsData = await getStudentsByClassroomId(classroomId);
      if (!studentsData) throw new Error("No students found");
      setStudents(studentsData);
      return studentsData;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar estudantes. Tente novamente mais tarde.");
      return null;
    }
  };

  const handleAddJustification = async (activityId: string, justificationData: CreateJustificationData) => {
    try {
      if (!activityId || !justificationData.user_email || !justificationData.message) {
        throw new Error("Activity ID, user email and message are required");
      }
      const updatedActivity = await addActivityJustification(activityId, justificationData);
      if (!updatedActivity) throw new Error("Justification creation failed");
      setActivities((prevActivities) =>
        prevActivities.map((activity) =>
          activity.id === updatedActivity.id ? updatedActivity : activity
        )
      );
      toast.success("Justificativa adicionada com sucesso!");
      return updatedActivity;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao adicionar justificativa. Tente novamente mais tarde.");
      return null;
    }
  };

  const handleUpdateJustification = async (
    activityId: string,
    userEmail: string,
    justificationData: Omit<CreateJustificationData, 'user_email'>
  ) => {
    try {
      if (!activityId || !userEmail || !justificationData.message) {
        throw new Error("Activity ID, user email and message are required");
      }
      const updatedActivity = await updateActivityJustification(activityId, userEmail, justificationData);
      if (!updatedActivity) throw new Error("Justification update failed");
      setActivities((prevActivities) =>
        prevActivities.map((activity) =>
          activity.id === updatedActivity.id ? updatedActivity : activity
        )
      );
      toast.success("Justificativa atualizada com sucesso!");
      return updatedActivity;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar justificativa. Tente novamente mais tarde.");
      return null;
    }
  };

  const handleRemoveJustification = async (activityId: string, userEmail: string) => {
    try {
      if (!activityId || !userEmail) throw new Error("Activity ID and user email are required");
      const updatedActivity = await removeActivityJustification(activityId, userEmail);
      if (!updatedActivity) throw new Error("Justification removal failed");
      setActivities((prevActivities) =>
        prevActivities.map((activity) =>
          activity.id === updatedActivity.id ? updatedActivity : activity
        )
      );
      toast.success("Justificativa removida com sucesso!");
      return updatedActivity;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover justificativa. Tente novamente mais tarde.");
      return null;
    }
  };

  const handleGetActivityJustifications = async (activityId: string) => {
    try {
      if (!activityId) throw new Error("Activity ID is required");
      const justifications = await getActivityJustifications(activityId);
      return justifications;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar justificativas. Tente novamente mais tarde.");
      return null;
    }
  };

  const handleGetJustificationByUser = async (activityId: string, userEmail: string) => {
    try {
      if (!activityId || !userEmail) throw new Error("Activity ID and user email are required");
      const justification = await getJustificationByUserEmail(activityId, userEmail);
      return justification;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar justificativa do usuário. Tente novamente mais tarde.");
      return null;
    }
  };

  return {
    // State
    activities,
    activitiesLoading: loading,
    submissionStatuses,
    students,

    // Activities CRUD
    handleGetAllActivitiesByClassroomId,
    handleGetActivityById,
    handleGetActivitiesByType,
    handleCreateActivity,
    handleCreateActivityFromCSV,
    handleBulkCreateActivities,
    handleUpdateActivity,
    handleUpdateActivityParticipants,
    handleUpdateActivityVisibility,
    handleDeleteActivity,

    // Submissions
    handleGetSubmissionStatus,
    handleGetSubmissionSummary,
    handleGetStudentsByClassroom,

    // Justifications
    handleAddJustification,
    handleUpdateJustification,
    handleRemoveJustification,
    handleGetActivityJustifications,
    handleGetJustificationByUser,
  };
};

export default useClassroomActivities;

export interface ClassroomActivitiesI {
  // State
  activities: ClassroomActivity[];
  activitiesLoading: boolean;
  submissionStatuses: StudentSubmissionStatus[];
  students: Student[];

  // Activities CRUD
  handleGetAllActivitiesByClassroomId: (classroomId: string) => Promise<boolean>;
  handleGetActivityById: (id: string) => Promise<ClassroomActivity | null>;
  handleGetActivitiesByType: (classroomId: string, classType: ClassTypeT) => Promise<boolean>;
  handleCreateActivity: (activityData: CreateActivityData) => Promise<ClassroomActivity | null>;
  handleCreateActivityFromCSV: (
    classroomId: string,
    classType: ClassTypeT,
    csvData: { email: string; timestamp: string; score: number }[]
  ) => Promise<ClassroomActivity | null>;
  handleBulkCreateActivities: (activitiesData: CreateActivityData[]) => Promise<ClassroomActivity[] | null>;
  handleUpdateActivity: (id: string, updateData: UpdateActivityData) => Promise<ClassroomActivity | null>;
  handleUpdateActivityParticipants: (id: string, participants: string[]) => Promise<ClassroomActivity | null>;
  handleUpdateActivityVisibility: (id: string, isVisible: boolean) => Promise<ClassroomActivity | null>;
  handleDeleteActivity: (id: string) => Promise<boolean>;

  // Submissions
  handleGetSubmissionStatus: (activityId: string, classroomId: string) => Promise<StudentSubmissionStatus[] | null>;
  handleGetSubmissionSummary: (activityId: string, classroomId: string) => Promise<ActivitySubmissionSummary | null>;
  handleGetStudentsByClassroom: (classroomId: string) => Promise<Student[] | null>;

  // Justifications
  handleAddJustification: (activityId: string, justificationData: CreateJustificationData) => Promise<ClassroomActivity | null>;
  handleUpdateJustification: (
    activityId: string,
    userEmail: string,
    justificationData: Omit<CreateJustificationData, 'user_email'>
  ) => Promise<ClassroomActivity | null>;
  handleRemoveJustification: (activityId: string, userEmail: string) => Promise<ClassroomActivity | null>;
  handleGetActivityJustifications: (activityId: string) => Promise<Record<string, JustificationDetails> | null>;
  handleGetJustificationByUser: (activityId: string, userEmail: string) => Promise<JustificationDetails | null>;
}
