"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ActivitySearch } from "../components/filters/activity-search";
import { ActivityTypeFilter } from "../components/filters/activity-type-filter";
import { ActivitiesTable } from "../components/activities-table";
import { JustificationModal } from "../components/justifications/justification-modal";
import { useActivitiesTable } from "../hooks/use-activities-table";
import { ClassTypeT } from "@/types/classroom-activities";

interface ActivitiesPageProps {
  classroomId: string;
  classroomName?: string;
}

export const ActivitiesPage: React.FC<ActivitiesPageProps> = ({
  classroomId,
  // classroomName,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [classTypeFilter, setClassTypeFilter] = useState<ClassTypeT | "all">("all");

  const [justificationModal, setJustificationModal] = useState<{
    isOpen: boolean;
    activityId: string;
    studentEmail: string;
    studentName: string;
    mode: "create" | "edit";
    initialReason?: string;
  }>({
    isOpen: false,
    activityId: "",
    studentEmail: "",
    studentName: "",
    mode: "create",
  });

  // Activities data
  const {
    activities,
    students,
    submissionStatuses,
    isLoading,
    handleJustifyPendency: originalHandleJustifyPendency,
    handleEditJustification: originalHandleEditJustification,
  } = useActivitiesTable(classroomId);

  const filteredStudents = useMemo(() => {
    let filtered = students;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(term) ||
          student.email.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [students, searchTerm]);

  const filteredActivities = useMemo(() => {
    if (classTypeFilter === "all") {
      return activities;
    }
    return activities.filter((activity) => activity.class_type === classTypeFilter);
  }, [activities, classTypeFilter]);

  const filteredSubmissionStatuses = useMemo(() => {
    const studentIds = new Set(filteredStudents.map(s => s.id));

    return submissionStatuses.filter(
      (status) =>
        studentIds.has(status.student.id)
    );
  }, [submissionStatuses, filteredStudents]);

  const handleJustifyPendency = (activityId: string, studentEmail: string) => {
    const student = students.find(s => s.email === studentEmail);
    setJustificationModal({
      isOpen: true,
      activityId,
      studentEmail,
      studentName: student?.name || studentEmail,
      mode: "create",
    });
  };

  const handleEditJustification = (activityId: string, studentEmail: string) => {
    const student = students.find(s => s.email === studentEmail);
    const activity = activities.find(a => a.id === activityId);
    const justifications = activity?.justifications as Record<string, { reason: string }> | null;
    const currentReason = justifications?.[studentEmail]?.reason || "";

    setJustificationModal({
      isOpen: true,
      activityId,
      studentEmail,
      studentName: student?.name || studentEmail,
      mode: "edit",
      initialReason: currentReason,
    });
  };

  const handleJustificationSubmit = async () => {
    const { activityId, studentEmail, mode } = justificationModal;

    if (mode === "create") {
      await originalHandleJustifyPendency(activityId, studentEmail);
    } else {
      await originalHandleEditJustification(activityId, studentEmail);
    }
  };

  const handleAddActivity = () => {
    // TODO: implementar lógica para modal
    console.log("Add activity clicked");
  };

  return (
    <div className="space-y-6">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button onClick={handleAddActivity} className="w-fit">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar atividade
        </Button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <ActivitySearch
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <ActivityTypeFilter
          value={classTypeFilter}
          onChange={setClassTypeFilter}
        />
      </div>

      {/* Table Section */}
      <div className="border rounded-lg">
        <ActivitiesTable
          classroomId={classroomId}
          activities={filteredActivities}
          students={filteredStudents}
          submissionStatuses={filteredSubmissionStatuses}
          onJustifyPendency={handleJustifyPendency}
          onEditJustification={handleEditJustification}
          isLoading={isLoading}
        />
      </div>

      {/* Justification Modal */}
      <JustificationModal
        isOpen={justificationModal.isOpen}
        onClose={() => setJustificationModal(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleJustificationSubmit}
        studentName={justificationModal.studentName}
        mode={justificationModal.mode}
        initialReason={justificationModal.initialReason}
      />
    </div>
  );
};
