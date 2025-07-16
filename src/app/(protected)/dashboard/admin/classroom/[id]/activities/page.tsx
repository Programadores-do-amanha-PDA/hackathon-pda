"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ActivitySearch } from "@/features/activities/components/filters/activity-search";
import { ActivityTypeFilter } from "@/features/activities/components/filters/activity-type-filter";
import { ActivitiesTable } from "@/features/activities/components/activities-table";
import { JustificationModal } from "@/features/activities/components/justifications/justification-modal";
import { useActivitiesTable } from "@/features/activities/hooks/use-activities-table";
import { ClassTypeT } from "@/types/classroom-activities";
import { ActivityUploadModal } from "@/features/activities/components/upload/activity-upload-modal";
import { CSVPreview } from "@/features/activities/components/upload/csv-preview"; // IMPORTADO

interface ActivitiesPageProps {
  classroomId: string;
  classroomName?: string;
}

const ActivitiesPage: React.FC<ActivitiesPageProps> = ({ classroomId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [classTypeFilter, setClassTypeFilter] = useState<ClassTypeT | "all">("all");

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [justificationModal, setJustificationModal] = useState({
    isOpen: false,
    activityId: "",
    studentEmail: "",
    studentName: "",
    mode: "create" as "create" | "edit",
    initialReason: "",
  });

  const {
    activities,
    students,
    submissionStatuses,
    isLoading,
    handleJustifyPendency: originalHandleJustifyPendency,
    handleEditJustification: originalHandleEditJustification,
  } = useActivitiesTable(classroomId);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return term
      ? students.filter(
          (student) =>
            student.name.toLowerCase().includes(term) ||
            student.email.toLowerCase().includes(term)
        )
      : students;
  }, [students, searchTerm]);

  const filteredActivities = useMemo(() => {
    return classTypeFilter === "all"
      ? activities
      : activities.filter((a) => a.class_type === classTypeFilter);
  }, [activities, classTypeFilter]);

  const filteredSubmissionStatuses = useMemo(() => {
    const studentIds = new Set(filteredStudents.map((s) => s.id));
    return submissionStatuses.filter((s) => studentIds.has(s.student.id));
  }, [submissionStatuses, filteredStudents]);

  const handleJustifyPendency = (activityId: string, studentEmail: string) => {
    const student = students.find((s) => s.email === studentEmail);
    setJustificationModal({
      isOpen: true,
      activityId,
      studentEmail,
      studentName: student?.name || studentEmail,
      mode: "create",
      initialReason: "",
    });
  };

  const handleEditJustification = (activityId: string, studentEmail: string) => {
    const student = students.find((s) => s.email === studentEmail);
    const activity = activities.find((a) => a.id === activityId);
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

  // 🔄 Quando o arquivo CSV for processado
  const handleDataParsed = (data: any[]) => {
    setCsvData(data);
    setIsUploadModalOpen(false);
    setIsPreviewOpen(true);
  };

  // 🔒 Quando clicar em "Salvar" no preview
  const handleSavePreview = () => {
    // Em breve: salvar dados na tabela
    console.log("Salvar dados CSV na tabela:", csvData);
    setIsPreviewOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Filtros e botão de adicionar */}
      <div className="flex justify-between items-center">
        <ActivitySearch
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <Button
          variant="default"
          className="gap-2"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Adicionar atividade
        </Button>
      </div>

      {/* Filtro por tipo */}
      <div className="flex justify-start">
        <ActivityTypeFilter
          value={classTypeFilter}
          onChange={setClassTypeFilter}
        />
      </div>

      {/* Tabela de atividades */}
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

      {/* Modal de justificativa */}
      <JustificationModal
        isOpen={justificationModal.isOpen}
        onClose={() =>
          setJustificationModal((prev) => ({ ...prev, isOpen: false }))
        }
        onSubmit={handleJustificationSubmit}
        studentName={justificationModal.studentName}
        mode={justificationModal.mode}
        initialReason={justificationModal.initialReason}
      />

      {/* Modal de upload CSV */}
      <ActivityUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDataParsed={handleDataParsed}
      />

      {/* Modal de preview CSV */}
      <CSVPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onSave={handleSavePreview}
        data={csvData}
      />
    </div>
  );
};

export default ActivitiesPage;
