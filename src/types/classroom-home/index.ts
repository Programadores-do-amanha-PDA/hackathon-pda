export interface WeeklyAttendanceData {
  percentage: number;
  trend: number;
}

export interface WeeklyPendenciesData {
  percentage: number;
  trend: number;
}

export interface ActiveProjectData {
  id: string;
  title: string;
  module: string;
  deliveryPercentage: number;
  pendingDeliveries: number;
}

export interface StudentAbsence {
  name: string;
  email: string;
  consecutiveAbsences: number;
}

export interface StudentPendency {
  name: string;
  email: string;
  consecutivePendencies: number;
}