import { ClassTypeT, ActivitySubmissionSummary, StudentSubmissionStatus } from "@/types/classroom-activities";

/**
 * Activity status
 */
export const ActivityStatus = {
  ENTREGUE: "E" as const,
  FALTA: "F" as const,
  PENDENCIA_JUSTIFICADA: "PJ" as const,
} as const;

export type ActivityStatusType = typeof ActivityStatus[keyof typeof ActivityStatus];

/**
 * GET display name
 */
export function getStatusDisplayName(status: ActivityStatusType): string {
  const statusMap = {
    [ActivityStatus.ENTREGUE]: "Entregue",
    [ActivityStatus.FALTA]: "Falta",
    [ActivityStatus.PENDENCIA_JUSTIFICADA]: "Pendência Justificada",
  };
  return statusMap[status];
}

/**
 * Get status color
 */
export function getStatusColor(status: ActivityStatusType): string {
  const colorMap = {
    [ActivityStatus.ENTREGUE]: "text-green-600 bg-green-50",
    [ActivityStatus.FALTA]: "text-red-600 bg-red-50",
    [ActivityStatus.PENDENCIA_JUSTIFICADA]: "text-yellow-600 bg-yellow-50",
  };
  return colorMap[status];
}

/**
 * Class type
 */
export function getClassTypeDisplayName(classType: ClassTypeT): string {
  const typeMap = {
    programming: "Programação",
    english: "Inglês",
    "soft-skills": "Soft Skills",
    community: "Comunidade",
  };
  return typeMap[classType];
}

/**
 * Get class type color
 */
export function getClassTypeColor(classType: ClassTypeT): string {
  const colorMap = {
    programming: "text-blue-600 bg-blue-50",
    english: "text-purple-600 bg-purple-50",
    "soft-skills": "text-orange-600 bg-orange-50",
    community: "text-green-600 bg-green-50",
  };
  return colorMap[classType];
}

/**
 * Validation utilities
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateScore(score: number): boolean {
  return !isNaN(score) && score >= 0 && score <= 10;
}

/**
 * data e tempo
 */
export function formatTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR');
}

export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * estatisticas
 */
export function calculateSubmissionRate(submitted: number, total: number): number {
  return total > 0 ? Math.round((submitted / total) * 100 * 100) / 100 : 0;
}

export function getSubmissionRateColor(rate: number): string {
  if (rate >= 80) return "text-green-600";
  if (rate >= 60) return "text-yellow-600";
  return "text-red-600";
}

export function generateSubmissionSummary(statuses: StudentSubmissionStatus[]): ActivitySubmissionSummary {
  const total = statuses.length;
  const submitted = statuses.filter(s => s.status === ActivityStatus.ENTREGUE).length;
  const missing = statuses.filter(s => s.status === ActivityStatus.FALTA).length;
  const justified = statuses.filter(s => s.status === ActivityStatus.PENDENCIA_JUSTIFICADA).length;
  const submissionRate = calculateSubmissionRate(submitted, total);

  return {
    total,
    submitted,
    missing,
    justified,
    submissionRate,
  };
}

export function sortStudentsByStatus(statuses: StudentSubmissionStatus[]): StudentSubmissionStatus[] {
  const statusOrder = {
    [ActivityStatus.ENTREGUE]: 1,
    [ActivityStatus.PENDENCIA_JUSTIFICADA]: 2,
    [ActivityStatus.FALTA]: 3,
  };

  return [...statuses].sort((a, b) => {
    const orderA = statusOrder[a.status];
    const orderB = statusOrder[b.status];

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.student.name.localeCompare(b.student.name);
  });
}

export function sortStudentsByName(statuses: StudentSubmissionStatus[]): StudentSubmissionStatus[] {
  return [...statuses].sort((a, b) => a.student.name.localeCompare(b.student.name));
}

/**
 * filtros
 */
export function filterByStatus(statuses: StudentSubmissionStatus[], status: ActivityStatusType): StudentSubmissionStatus[] {
  return statuses.filter(s => s.status === status);
}

export function filterBySearch(statuses: StudentSubmissionStatus[], searchTerm: string): StudentSubmissionStatus[] {
  const term = searchTerm.toLowerCase();
  return statuses.filter(s =>
    s.student.name.toLowerCase().includes(term) ||
    s.student.email.toLowerCase().includes(term)
  );
}

/**
 * exports
 */
export function generateCSVContent(statuses: StudentSubmissionStatus[]): string {
  const header = "Nome,Email,Status,Data de Entrega,Justificativa";
  const rows = statuses.map(status => {
    const name = status.student.name;
    const email = status.student.email;
    const statusDisplay = getStatusDisplayName(status.status);
    const submittedAt = status.submitted_at ? formatTimestamp(status.submitted_at) : "-";
    const justification = status.justification?.reason || "-";

    return `"${name}","${email}","${statusDisplay}","${submittedAt}","${justification}"`;
  });

  return [header, ...rows].join('\n');
}

/**
 * Constants
 */
export const ACTIVITY_CONSTANTS = {
  MAX_SCORE: 10,
  MIN_SCORE: 0,
  CSV_MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  DEBOUNCE_DELAY: 300, // milliseconds
  DEFAULT_PAGE_SIZE: 50,
} as const;

export function getActivityRoute(classroomId: string, activityId?: string): string {
  const base = `/dashboard/admin/classrooms/${classroomId}/activities`;
  return activityId ? `${base}/${activityId}` : base;
}

export function getClassroomRoute(classroomId: string): string {
  return `/dashboard/admin/classrooms/${classroomId}`;
}
