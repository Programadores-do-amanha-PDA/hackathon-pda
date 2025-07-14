"use client";

import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClassroomActivity } from "@/types/classroom-activities";

interface ActivitiesTableHeaderProps {
  activities: ClassroomActivity[];
}

export const ActivitiesTableHeader: React.FC<ActivitiesTableHeaderProps> = ({
  activities,
}) => {
  const sortedActivities = React.useMemo(() => {
    return [...activities].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
  }, [activities]);

  const formatActivityDate = (date: Date | string) => {
    const activityDate = new Date(date);
    const today = new Date();

    if (activityDate.toDateString() === today.toDateString()) {
      return "Hoje";
    }

    return activityDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatActivityType = (type: string | null) => {
    if (!type) return "Geral";

    const typeMap = {
      programming: "Programação",
      english: "Inglês",
      "soft-skills": "Soft Skills",
      community: "Comunidade",
    };

    return typeMap[type as keyof typeof typeMap] || type;
  };

  // Tipos disponíveis para o dropdown
  const classTypes = [
    { value: "programming", label: "Programação" },
    { value: "english", label: "Inglês" },
    { value: "soft-skills", label: "Soft Skills" },
    { value: "community", label: "Comunidade" },
  ];

  // Estado local para seleção visual do tipo (apenas UI, não salva no banco)
  const [selectedTypes, setSelectedTypes] = React.useState<Record<string, string>>({});

  const handleTypeChange = (activityId: string, value: string) => {
    setSelectedTypes((prev) => ({ ...prev, [activityId]: value }));
  };

  return (
    <TableHeader className="sticky top-0 z-10 bg-background">
      <TableRow>
        {/* Fixed columns */}
        <TableHead className="sticky left-0 z-20 bg-background border-r min-w-[150px] max-w-[200px]">
          Nome
        </TableHead>
        <TableHead className="sticky left-[150px] z-20 bg-background border-r min-w-[200px] max-w-[250px] hidden sm:table-cell">
          Email
        </TableHead>

        {/* Dynamic activity columns */}
        {sortedActivities.map((activity) => (
          <TableHead key={activity.id} className="text-center min-w-[120px] max-w-[150px] border-r px-2 py-2">
            <div className="flex flex-col items-center gap-2">
              {/* Data da atividade */}
              <span className="text-sm font-medium text-gray-900">
                {formatActivityDate(activity.created_at)}
              </span>

              {/* Dropdown de tipo de atividade */}
              <select
                className="text-xs font-medium w-full bg-white border border-gray-200 rounded px-2 py-1 cursor-pointer text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedTypes[activity.id] || activity.class_type || "programming"}
                onChange={e => handleTypeChange(activity.id, e.target.value)}
              >
                {classTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};
