"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useActivities } from "./use-activities";
import { toast } from "sonner";
import {
  // ClassroomActivity,
  // Student,
  StudentSubmissionStatus
} from "@/types/classroom-activities";

interface UseActivitiesTableOptions {
  autoLoad?: boolean;
}

export function useActivitiesTable(
  classroomId: string,
  options: UseActivitiesTableOptions = {}
) {
  const { autoLoad = true } = options;
  const [initialized, setInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const {
    activities,
    students,
    isLoading,
    loadActivities,
    loadStudents,
    addJustification,
    updateJustification,
    removeJustification,
  } = useActivities(classroomId);

  const submissionStatuses = useMemo((): StudentSubmissionStatus[] => {
    if (!students.length || !activities.length) return [];

    const statuses: StudentSubmissionStatus[] = [];

    students.forEach(student => {
      activities.forEach(activity => {
        const hasSubmitted = activity.participants_email?.includes(student.email) || false;
        const justifications = (activity.justifications as unknown as Record<string, {
          reason: string;
          created_by: string;
          created_at: string;
        }>) || {};
        const hasJustification = justifications[student.email];

        let status: "E" | "F" | "PJ";
        if (hasSubmitted) {
          status = "E"; // Entregue
        } else if (hasJustification) {
          status = "PJ"; // Pendência Justificada
        } else {
          status = "F"; // Falta
        }

        statuses.push({
          student,
          status,
          justification: hasJustification ? {
            reason: hasJustification.reason,
            created_by: hasJustification.created_by,
            created_at: hasJustification.created_at,
          } : undefined,
          submitted_at: hasSubmitted ?
            (typeof activity.created_at === 'string' ? activity.created_at : activity.created_at.toISOString())
            : undefined,
        });
      });
    });

    return statuses;
  }, [students, activities]);

  // Initialize data loading
  const initializeData = useCallback(async () => {
    if (!classroomId || initialized || isInitializing) return;

    setIsInitializing(true);
    try {
      await Promise.all([
        loadActivities(),
        loadStudents(),
      ]);
      setInitialized(true);
    } catch (error) {
      console.error("Error initializing activities table data:", error);
      toast.error("Erro ao carregar dados da tabela de atividades");
    } finally {
      setIsInitializing(false);
    }
  }, [classroomId, initialized, isInitializing, loadActivities, loadStudents]);

  useEffect(() => {
    if (autoLoad && classroomId && !initialized && !isInitializing) {
      initializeData();
    }
  }, [autoLoad, classroomId, initialized, isInitializing, initializeData]);

  const handleJustifyPendency = useCallback(async (
    activityId: string,
    studentEmail: string
  ) => {
    const reason = prompt("Digite o motivo da justificativa:");
    if (!reason || !reason.trim()) return;

    try {
      await addJustification(activityId, studentEmail, reason.trim());
    } catch (error) {
      console.error("Error adding justification:", error);
      toast.error("Erro ao adicionar justificativa");
    }
  }, [addJustification]);

  const handleEditJustification = useCallback(async (
    activityId: string,
    studentEmail: string
  ) => {
    const activity = activities.find(a => a.id === activityId);
    const justifications = (activity?.justifications as unknown as Record<string, {
      reason: string;
      created_by: string;
      created_at: string;
    }>) || {};
    const currentJustification = justifications[studentEmail];

    if (!currentJustification) return;

    const newReason = prompt("Edite o motivo da justificativa:", currentJustification.reason);
    if (!newReason || !newReason.trim()) return;

    try {
      await updateJustification(activityId, studentEmail, newReason.trim());
    } catch (error) {
      console.error("Error updating justification:", error);
      toast.error("Erro ao atualizar justificativa");
    }
  }, [activities, updateJustification]);

  const handleRemoveJustification = useCallback(async (
    activityId: string,
    studentEmail: string
  ) => {
    const confirmed = confirm("Tem certeza que deseja remover esta justificativa?");
    if (!confirmed) return;

    try {
      await removeJustification(activityId, studentEmail);
    } catch (error) {
      console.error("Error removing justification:", error);
      toast.error("Erro ao remover justificativa");
    }
  }, [removeJustification]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadActivities(),
      loadStudents(),
    ]);
  }, [loadActivities, loadStudents]);

  return {
    // Data
    activities,
    students,
    submissionStatuses,

    // State
    isLoading,
    initialized,

    // Actions
    initializeData,
    refreshData,
    handleJustifyPendency,
    handleEditJustification,
    handleRemoveJustification,
  };
}
