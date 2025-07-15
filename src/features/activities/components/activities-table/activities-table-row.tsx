"use client";

import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { ClassroomActivity, Student, StudentSubmissionStatus } from "@/types/classroom-activities";
import { ActivitiesTableCell } from "./activities-table-cell";

interface ActivitiesTableRowProps {
  student: Student;
  activities: ClassroomActivity[];
  submissionStatuses: StudentSubmissionStatus[];
  onJustifyPendency: (activityId: string, studentEmail: string) => void;
  onEditJustification?: (activityId: string, studentEmail: string) => void;
}

const ActivitiesTableRowComponent: React.FC<ActivitiesTableRowProps> = ({
  student,
  activities,
  submissionStatuses,
  onJustifyPendency,
  onEditJustification,
}) => {
  const sortedActivities = React.useMemo(() => {
    return [...activities].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
  }, [activities]);

  const getSubmissionStatusForActivity = (activityId: string): StudentSubmissionStatus | null => {
    const submissionStatus = submissionStatuses.find(
      status => status.student.id === student.id &&
        activities.find(activity => activity.id === activityId)
    );

    if (submissionStatus) {
      return submissionStatus;
    }

    const activity = activities.find(a => a.id === activityId);
    if (!activity) return null;

    const hasSubmitted = activity.participants_email?.includes(student.email) || false;
    const justifications = activity.justifications as unknown as Record<string, {
      reason: string;
      created_by: string;
      created_at: string;
    }> | null;
    const hasJustification = justifications && justifications[student.email];

    let status: "E" | "F" | "PJ";
    if (hasSubmitted) {
      status = "E"; // Entregue
    } else if (hasJustification) {
      status = "PJ"; // Pendência Justificada
    } else {
      status = "F"; // Falta
    }

    return {
      student,
      status,
      justification: hasJustification ? {
        reason: hasJustification.reason,
        created_by: hasJustification.created_by,
        created_at: hasJustification.created_at,
      } : undefined,
      submitted_at: hasSubmitted ? (typeof activity.created_at === 'string' ? activity.created_at : activity.created_at.toISOString()) : undefined,
    };
  };

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      {/* Fixed columns */}
      <TableCell className="sticky left-0 z-10 bg-background border-r min-w-[150px] max-w-[200px] font-medium">
        <div className="truncate" title={student.name}>
          {student.name}
        </div>
      </TableCell>

      <TableCell className="sticky left-[150px] z-10 bg-background border-r min-w-[200px] max-w-[250px] hidden sm:table-cell">
        <div className="truncate text-sm text-muted-foreground" title={student.email}>
          {student.email}
        </div>
      </TableCell>

      {/* Dynamic activity columns */}
      {sortedActivities.map((activity) => {
        const submissionStatus = getSubmissionStatusForActivity(activity.id);

        return (
          <TableCell
            key={activity.id}
            className="text-center min-w-[120px] max-w-[150px] border-r"
          >
            <ActivitiesTableCell
              submissionStatus={submissionStatus}
              activityId={activity.id}
              studentEmail={student.email}
              onJustifyPendency={onJustifyPendency}
              onEditJustification={onEditJustification}
            />
          </TableCell>
        );
      })}
    </TableRow>
  );
};

export const ActivitiesTableRow = React.memo(ActivitiesTableRowComponent);
