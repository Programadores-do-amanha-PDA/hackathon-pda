"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StudentSubmissionStatus } from "@/types/classroom-activities";
import { Pencil } from "lucide-react";

interface ActivitiesTableCellProps {
  submissionStatus: StudentSubmissionStatus | null;
  activityId: string;
  studentEmail: string;
  onJustifyPendency: (activityId: string, studentEmail: string) => void;
  onEditJustification?: (activityId: string, studentEmail: string) => void;
  isLoading?: boolean;
}

export const ActivitiesTableCell: React.FC<ActivitiesTableCellProps> = ({
  submissionStatus,
  activityId,
  studentEmail,
  onJustifyPendency,
  onEditJustification,
  isLoading = false,
}) => {
  const getStatusDisplay = () => {
    if (!submissionStatus) {
      return {
        text: "F",
        color: "text-red-600",
        bgColor: "bg-red-50",
        tooltip: "Falta - Não entregue",
        showJustifyButton: true,
      };
    }

    switch (submissionStatus.status) {
      case "E":
        return {
          text: "E",
          color: "text-green-600",
          bgColor: "bg-green-50",
          tooltip: `Entregue${submissionStatus.submitted_at ? ` em ${formatDate(submissionStatus.submitted_at)}` : ''}`,
          showJustifyButton: false,
        };
      case "PJ":
        return {
          text: "PJ",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          tooltip: `Pendência Justificada${submissionStatus.justification ? `: ${submissionStatus.justification.reason}` : ''}`,
          showJustifyButton: false,
          showEditButton: true,
        };
      case "F":
        return {
          text: "F",
          color: "text-red-600",
          bgColor: "bg-red-50",
          tooltip: "Falta - Não entregue",
          showJustifyButton: true,
        };
      default:
        return {
          text: "F",
          color: "text-red-600",
          bgColor: "bg-red-50",
          tooltip: "Status desconhecido",
          showJustifyButton: true,
        };
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";

    const submissionDate = new Date(date);
    return submissionDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleJustifyClick = () => {
    onJustifyPendency(activityId, studentEmail);
  };

  const handleEditJustificationClick = () => {
    if (onEditJustification) {
      onEditJustification(activityId, studentEmail);
    }
  };

  const statusDisplay = getStatusDisplay();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-10">
        <div className="animate-pulse bg-gray-200 rounded w-6 h-6"></div>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="group flex items-center justify-center p-2 cursor-pointer relative">
          <span className={`
            text-sm font-bold ${statusDisplay.color}
            hover:opacity-80 transition-opacity
          `}>
            {statusDisplay.text}
          </span>

          {/* Ícone de editar - aparece apenas ao hover da célula */}
          {(statusDisplay.showJustifyButton || statusDisplay.showEditButton) && (
            <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-gray-200"
                onClick={statusDisplay.showJustifyButton ? handleJustifyClick : handleEditJustificationClick}
                disabled={isLoading}
              >
                <Pencil className="h-3 w-3 text-gray-500" />
              </Button>
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[250px]">
        <div className="space-y-1">
          <p className="font-medium">{statusDisplay.tooltip}</p>
          {submissionStatus && submissionStatus.submitted_at && (
            <p className="text-xs">
              Data: {formatDate(submissionStatus.submitted_at)}
            </p>
          )}
          {submissionStatus && submissionStatus.justification && (
            <p className="text-xs">
              Por: {submissionStatus.justification.created_by}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Estudante: {studentEmail}
          </p>
          <p className="text-xs text-muted-foreground">
            Atividade: {String(activityId).slice(0, 8)}...
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
