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
  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="w-full overflow-auto">
          <div className="rounded-md border">
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
        </div>
      </TooltipProvider>
    );
  }

  if (!activities.length) {
    return (
      <TooltipProvider>
        <div className="w-full overflow-auto">
          <div className="rounded-md border">
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
                  <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                    Nenhuma atividade encontrada para esta turma.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full overflow-auto">
        <div className="rounded-md border">
          <Table>
            <ActivitiesTableHeader activities={activities} />
            <TableBody>
              {students
                .filter(student => student.classroom_id === classroomId)
                .map((student) => (
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
      </div>
    </TooltipProvider>
  );
};
