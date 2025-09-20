"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ClassroomActivity,
  Student,
  StudentSubmissionStatus
} from "@/types/classroom-activities";
import { useScrollGradient } from "../../hooks/use-scroll-gradient";
import { ActivitiesTableHeader } from "./activities-table-header";
import { ActivitiesTableRow } from "./activities-table-row";

interface ActivitiesTableProps {
  classroomId: string;
  activities: ClassroomActivity[];
  students: Student[];
  submissionStatuses: StudentSubmissionStatus[];
  onJustifyPendency: (activityId: string, studentEmail: string) => void;
  onEditJustification?: (activityId: string, studentEmail: string) => void;
  isLoading?: boolean;
}

export const ActivitiesTable: React.FC<ActivitiesTableProps> = ({
  classroomId,
  activities,
  students,
  submissionStatuses,
  onJustifyPendency,
  onEditJustification,
  isLoading = false,
}) => {
  const { scrollRef, scrollState } = useScrollGradient();

  // Debug: log dos dados recebidos
  console.log('ActivitiesTable rendered with:', {
    studentsCount: students.length,
    activitiesCount: activities.length,
    submissionStatusesCount: submissionStatuses.length,
    isLoading
  });

  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="w-full h-full">
          <div className="rounded-md border bg-background h-full flex flex-col relative">
            <div
              ref={scrollRef}
              className="flex-1 overflow-auto max-h-[calc(100vh-300px)]"
            >
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead className="sticky left-0 z-20 bg-background border-r min-w-[150px]">
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead className="sticky left-[150px] z-20 bg-background border-r min-w-[200px] hidden sm:table-cell">
                      <Skeleton className="h-4 w-32" />
                    </TableHead>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <TableHead key={index} className="text-center min-w-[120px] border-r">
                        <Skeleton className="h-8 w-full" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell className="sticky left-0 z-10 bg-background border-r">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                      <TableCell className="sticky left-[150px] z-10 bg-background border-r hidden sm:table-cell">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                      {Array.from({ length: 3 }).map((_, cellIndex) => (
                        <TableCell key={cellIndex} className="text-center border-r">
                          <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Degradê inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
          </div>
        </div>
      </TooltipProvider>
    );
  }

  if (!activities.length) {
    return (
      <TooltipProvider>
        <div className="w-full h-full">
          <div className="rounded-md border bg-background h-full flex flex-col relative">
            <div
              ref={scrollRef}
              className="flex-1 overflow-auto max-h-[calc(100vh-300px)]"
            >
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead className="sticky left-0 z-20 bg-background border-r min-w-[150px]">
                      Nome
                    </TableHead>
                    <TableHead className="sticky left-[150px] z-20 bg-background border-r min-w-[200px] hidden sm:table-cell">
                      Email
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-2xl">📋</span>
                        </div>
                        <h3 className="font-medium">Nenhuma atividade encontrada</h3>
                        <p className="text-sm">Adicione uma atividade para começar a rastrear o progresso dos estudantes.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Degradê inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none z-20" />
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full h-full">
        <div className="rounded-md border bg-background h-full flex flex-col relative">
          <div
            ref={scrollRef}
            className="flex-1 overflow-auto max-h-[calc(100vh-300px)]"
          >
            <Table>
              <ActivitiesTableHeader activities={activities} />
              <TableBody>
                {students.map((student) => (
                  <ActivitiesTableRow
                    key={student.id}
                    student={student}
                    activities={activities}
                    submissionStatuses={submissionStatuses.filter(
                      status => status.student.id === student.id &&
                        status.student.classroom_id === classroomId
                    )}
                    onJustifyPendency={onJustifyPendency}
                    onEditJustification={onEditJustification}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Degradê superior - aparece quando pode scrollar para cima */}
          <div
            className={`absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent pointer-events-none z-20 transition-opacity duration-300 ${scrollState.canScrollUp ? 'opacity-100' : 'opacity-0'
              }`}
          />

          {/* Degradê inferior - aparece quando pode scrollar para baixo */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent pointer-events-none z-20 transition-opacity duration-300 ${scrollState.canScrollDown ? 'opacity-100' : 'opacity-0'
              }`}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};
