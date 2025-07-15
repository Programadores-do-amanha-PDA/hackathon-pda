"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ActivityBreadcrumbProps {
  classroomName?: string;
  classroomId: string;
}

export const ActivityBreadcrumb: React.FC<ActivityBreadcrumbProps> = ({
  classroomName = "Turma",
  classroomId,
}) => {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Início", href: "/dashboard" },
    { label: "Todas as turmas", href: "/dashboard/admin" },
    { label: classroomName, href: `/dashboard/admin/classrooms/${classroomId}` },
    { label: "Atividades" },
  ];

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index === 0 && <Home className="w-4 h-4 mr-1" />}

          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}

          {index < breadcrumbItems.length - 1 && (
            <ChevronRight className="w-4 h-4" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
