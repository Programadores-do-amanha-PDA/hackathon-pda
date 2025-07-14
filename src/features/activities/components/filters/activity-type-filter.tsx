"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassTypeT } from "@/types/classroom-activities";

interface ActivityTypeFilterProps {
  value: ClassTypeT | "all";
  onChange: (value: ClassTypeT | "all") => void;
}

export const ActivityTypeFilter: React.FC<ActivityTypeFilterProps> = ({
  value,
  onChange,
}) => {
  const classTypes = [
    { value: "all", label: "Todas as atividades" },
    { value: "programming", label: "Programação" },
    { value: "english", label: "Inglês" },
    { value: "soft-skills", label: "Soft Skills" },
    { value: "community", label: "Comunidade" },
  ] as const;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filtrar por tipo" />
      </SelectTrigger>
      <SelectContent>
        {classTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
