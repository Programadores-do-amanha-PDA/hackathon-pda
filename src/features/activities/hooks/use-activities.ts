"use client";

import { useCallback } from "react";
import useClassroomActivities from "@/context/modules/classrooms/activities";
import { ClassTypeT } from "@/types/classroom-activities";

export function useActivities(classroomId: string) {
  const {
    activities,
    activitiesLoading,
    students,
    submissionStatuses,
    handleGetAllActivitiesByClassroomId,
    handleGetStudentsByClassroom,
    handleGetSubmissionStatus,
    handleAddJustification,
    handleUpdateJustification,
    handleRemoveJustification,
    handleCreateActivityFromCSV,
    handleCreateActivity,
    handleUpdateActivity,
    handleDeleteActivity,
  } = useClassroomActivities();

  const loadActivities = useCallback(async () => {
    if (!classroomId) return false;
    return await handleGetAllActivitiesByClassroomId(classroomId);
  }, [classroomId, handleGetAllActivitiesByClassroomId]);

  const loadStudents = useCallback(async () => {
    if (!classroomId) return null;
    return await handleGetStudentsByClassroom(classroomId);
  }, [classroomId, handleGetStudentsByClassroom]);

  const loadSubmissionStatuses = useCallback(async (activityId: string) => {
    if (!classroomId || !activityId) return null;
    return await handleGetSubmissionStatus(activityId, classroomId);
  }, [classroomId, handleGetSubmissionStatus]);

  const createActivity = useCallback(async (
    classType: ClassTypeT,
    participants: string[]
  ) => {
    if (!classroomId) return null;
    return await handleCreateActivity({
      classroom_id: classroomId,
      class_type: classType,
      participants_email: participants,
      is_visible_on_schedule: true,
    });
  }, [classroomId, handleCreateActivity]);

  const createActivityFromCSV = useCallback(async (
    classType: ClassTypeT,
    csvData: { email: string; timestamp: string; score: number }[]
  ) => {
    if (!classroomId) return null;
    return await handleCreateActivityFromCSV(classroomId, classType, csvData);
  }, [classroomId, handleCreateActivityFromCSV]);

  const addJustification = useCallback(async (
    activityId: string,
    studentEmail: string,
    reason: string,
    createdBy?: string
  ) => {
    return await handleAddJustification(activityId, {
      user_email: studentEmail,
      message: reason,
      created_by: createdBy || "system",
    });
  }, [handleAddJustification]);

  const updateJustification = useCallback(async (
    activityId: string,
    studentEmail: string,
    reason: string,
    createdBy?: string
  ) => {
    return await handleUpdateJustification(activityId, studentEmail, {
      message: reason,
      created_by: createdBy || "system",
    });
  }, [handleUpdateJustification]);

  const removeJustification = useCallback(async (
    activityId: string,
    studentEmail: string
  ) => {
    return await handleRemoveJustification(activityId, studentEmail);
  }, [handleRemoveJustification]);

  const updateActivity = useCallback(async (
    activityId: string,
    updates: {
      class_type?: ClassTypeT;
      participants_email?: string[];
      is_visible_on_schedule?: boolean;
    }
  ) => {
    return await handleUpdateActivity(activityId, updates);
  }, [handleUpdateActivity]);

  const deleteActivity = useCallback(async (activityId: string) => {
    return await handleDeleteActivity(activityId);
  }, [handleDeleteActivity]);

  return {
    // State
    activities,
    students,
    submissionStatuses,
    isLoading: activitiesLoading,

    // Actions
    loadActivities,
    loadStudents,
    loadSubmissionStatuses,
    createActivity,
    createActivityFromCSV,
    addJustification,
    updateJustification,
    removeJustification,
    updateActivity,
    deleteActivity,
  };
}
