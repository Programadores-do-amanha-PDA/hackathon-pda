import {
  getAllActivitiesByClassroomId,
  getActivityById,
  getActivitiesByClassroomAndType,
} from "@/app/actions/classrooms/activities/get-activities";
import {
  createActivity,
  createActivityFromCSV,
  bulkCreateActivities,
  CreateActivityData,
} from "@/app/actions/classrooms/activities/create-activity";
import {
  updateActivityById,
  updateActivityParticipants,
  updateActivityVisibility,
  deleteActivityById,
  UpdateActivityData,
} from "@/app/actions/classrooms/activities/update-activity";
import {
  getSubmissionStatusByActivity,
  getActivitySubmissionSummary,
  getStudentsByClassroomId,
} from "@/app/actions/classrooms/activities/get-submissions";
import {
  addActivityJustification,
  updateActivityJustification,
  removeActivityJustification,
  getActivityJustifications,
  getJustificationByUserEmail,
  CreateJustificationData,
} from "@/app/actions/classrooms/activities/manage-justifications";
import {
  ClassroomActivity,
  ClassTypeT,
  CSVActivityData,
  ActivitySubmissionSummary,
  StudentSubmissionStatus,
  JustificationDetails,
} from "@/types/classroom-activities";

export class ActivitiesService {
  // Activities CRUD operations
  static async getActivitiesByClassroom(classroomId: string): Promise<ClassroomActivity[] | null> {
    return await getAllActivitiesByClassroomId(classroomId);
  }

  static async getActivityById(id: string): Promise<ClassroomActivity | null> {
    return await getActivityById(id);
  }

  static async getActivitiesByType(
    classroomId: string,
    classType: ClassTypeT
  ): Promise<ClassroomActivity[] | null> {
    return await getActivitiesByClassroomAndType(classroomId, classType);
  }

  static async createActivity(activityData: CreateActivityData): Promise<ClassroomActivity | null> {
    return await createActivity(activityData);
  }

  static async createActivityFromCSV(
    classroomId: string,
    classType: ClassTypeT,
    csvData: CSVActivityData[]
  ): Promise<ClassroomActivity | null> {
    return await createActivityFromCSV(classroomId, classType, csvData);
  }

  static async bulkCreateActivities(
    activitiesData: CreateActivityData[]
  ): Promise<ClassroomActivity[] | null> {
    return await bulkCreateActivities(activitiesData);
  }

  static async updateActivity(
    id: string,
    updateData: UpdateActivityData
  ): Promise<ClassroomActivity | null> {
    return await updateActivityById(id, updateData);
  }

  static async updateActivityParticipants(
    id: string,
    participants: string[]
  ): Promise<ClassroomActivity | null> {
    return await updateActivityParticipants(id, participants);
  }

  static async updateActivityVisibility(
    id: string,
    isVisible: boolean
  ): Promise<ClassroomActivity | null> {
    return await updateActivityVisibility(id, isVisible);
  }

  static async deleteActivity(id: string): Promise<boolean> {
    return await deleteActivityById(id);
  }

  // Submissions operations
  static async getSubmissionStatus(
    activityId: string,
    classroomId: string
  ): Promise<StudentSubmissionStatus[] | null> {
    return await getSubmissionStatusByActivity(activityId, classroomId);
  }

  static async getSubmissionSummary(
    activityId: string,
    classroomId: string
  ): Promise<ActivitySubmissionSummary | null> {
    return await getActivitySubmissionSummary(activityId, classroomId);
  }

  static async getStudentsByClassroom(classroomId: string) {
    return await getStudentsByClassroomId(classroomId);
  }

  // Justifications operations
  static async addJustification(
    activityId: string,
    justificationData: CreateJustificationData
  ): Promise<ClassroomActivity | null> {
    return await addActivityJustification(activityId, justificationData);
  }

  static async updateJustification(
    activityId: string,
    userEmail: string,
    justificationData: Omit<CreateJustificationData, 'user_email'>
  ): Promise<ClassroomActivity | null> {
    return await updateActivityJustification(activityId, userEmail, justificationData);
  }

  static async removeJustification(
    activityId: string,
    userEmail: string
  ): Promise<ClassroomActivity | null> {
    return await removeActivityJustification(activityId, userEmail);
  }

  static async getActivityJustifications(
    activityId: string
  ): Promise<Record<string, JustificationDetails> | null> {
    return await getActivityJustifications(activityId) as Record<string, JustificationDetails> | null;
  }

  static async getJustificationByUser(
    activityId: string,
    userEmail: string
  ): Promise<JustificationDetails | null> {
    return await getJustificationByUserEmail(activityId, userEmail);
  }

  // Utility methods
  static calculateSubmissionRate(submitted: number, total: number): number {
    return total > 0 ? Math.round((submitted / total) * 100 * 100) / 100 : 0;
  }

  static getStatusDisplayName(status: "E" | "F" | "PJ"): string {
    const statusMap = {
      E: "Entregue",
      F: "Falta",
      PJ: "Pendência Justificada",
    };
    return statusMap[status];
  }

  static getClassTypeDisplayName(classType: ClassTypeT): string {
    const typeMap = {
      programming: "Programação",
      english: "Inglês",
      "soft-skills": "Soft Skills",
      community: "Comunidade",
    };
    return typeMap[classType];
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static formatTimestamp(timestamp: string | Date): string {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}