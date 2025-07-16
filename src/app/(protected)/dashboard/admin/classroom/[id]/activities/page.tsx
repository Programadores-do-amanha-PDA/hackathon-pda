"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ActivitySearch } from "@/features/activities/components/filters/activity-search";
// import { ActivityTypeFilter } from "@/features/activities/components/filters/activity-type-filter";
import { ActivitiesTable } from "@/features/activities/components/activities-table";
import { JustificationModal } from "@/features/activities/components/justifications/justification-modal";
import { ActivitiesPagination } from "@/features/activities/components/pagination/activities-pagination";
import { useActivitiesTable } from "@/features/activities/hooks/use-activities-table";
import { usePagination } from "@/features/activities/hooks/use-pagination";
import { ClassTypeT } from "@/types/classroom-activities";
import { ActivityUploadModal } from "@/features/activities/components/upload/activity-upload-modal";

interface ActivitiesPageProps {
  params: {
    id: string;
  };
}

const ActivitiesPage: React.FC<ActivitiesPageProps> = ({ params }) => {
  const classroomId = params.id;
  const [searchTerm, setSearchTerm] = useState("");
  const [classTypeFilter] = useState<ClassTypeT | "all">("all");

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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

  // Estado para controlar loading durante mudança de página
  // const [isChangingPage, setIsChangingPage] = useState(false);

  // Paginação
  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems: paginatedStudents,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
  } = usePagination({
    items: filteredStudents,
    initialPageSize: 20,
  });

  // Ref para a tabela para scroll automático
  const tableRef = React.useRef<HTMLDivElement>(null);

  // Filtrar submissionStatuses baseado nos estudantes paginados
  const filteredSubmissionStatuses = useMemo(() => {
    const studentIds = new Set(paginatedStudents.map((s) => s.id));
    console.log('Filtering submissionStatuses for students:', {
      paginatedStudentsCount: paginatedStudents.length,
      currentPage,
      pageSize,
      totalItems,
      studentIds: Array.from(studentIds)
    });
    return submissionStatuses.filter((s) => studentIds.has(s.student.id));
  }, [submissionStatuses, paginatedStudents, currentPage, pageSize, totalItems]);

  // Scroll automático para o topo quando a página mudar
  React.useEffect(() => {
    console.log('useEffect currentPage changed to:', currentPage);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  // Reset paginação quando filtros mudam
  React.useEffect(() => {
    resetPagination();
  }, [searchTerm, classTypeFilter, resetPagination]);

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

  const handleDataParsed = (data: Record<string, unknown>[]) => {
    setIsUploadModalOpen(false);
    // Em breve: processar dados CSV
    console.log("Dados CSV processados:", data);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-none p-6 pb-4">
        {/* Filtros e botão de adicionar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <ActivitySearch
              value={searchTerm}
              onChange={setSearchTerm}
            />
            {/* <ActivityTypeFilter
              value={classTypeFilter}
              onChange={setClassTypeFilter}
            /> */}
          </div>
          <Button
            variant="default"
            className="gap-2 bg-amber-500 hover:bg-amber-600 text-amber-900"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Adicionar atividade
          </Button>
        </div>
      </div>

      {/* Tabela de atividades */}
      <div ref={tableRef} className="flex-1 px-6 min-h-0">
        <ActivitiesTable
          classroomId={classroomId}
          activities={filteredActivities}
          students={paginatedStudents}
          submissionStatuses={filteredSubmissionStatuses}
          onJustifyPendency={handleJustifyPendency}
          onEditJustification={handleEditJustification}
          isLoading={isLoading}
        />
      </div>

      {/* Paginação */}
      <div className="flex-none p-6 pt-4 border-t bg-background/95 backdrop-blur-sm">
        <ActivitiesPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
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
    </div>
  );
};

export default ActivitiesPage;
