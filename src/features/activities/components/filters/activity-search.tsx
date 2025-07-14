"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ActivitySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ActivitySearch: React.FC<ActivitySearchProps> = ({
  value,
  onChange,
  placeholder = "Procurando por alguém?",
}) => {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-4"
      />
    </div>
  );
};
