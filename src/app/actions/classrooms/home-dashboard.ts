"use server";

import { cache } from 'react';
import { createClient } from "@/lib/supabase/server";
import { getWeekStartAndEnd, getPreviousWeekStartAndEnd, isDateInRange } from "@/utils/date-utils";
import { calculatePercentage, calculateTrend , calculateAttendancePercentage } from "@/utils/math-utils";
import { ActiveProjectData, WeeklyAttendanceData, WeeklyPendenciesData, StudentAbsence, StudentPendency } from "@/types/classroom-home";

const getCachedSupabaseClient = cache(async () => {
  return await createClient();
});

export async function getWeeklyAttendanceData(classroomId: string): Promise<WeeklyAttendanceData> {
  try {
    const supabase = await getCachedSupabaseClient();
    
    // Calculate date ranges
    const now = new Date();
    const currentWeek = getWeekStartAndEnd(now);
    const previousWeek = getPreviousWeekStartAndEnd(currentWeek.start);
    
    // Get total students in classroom
    const studentsData = await getClassroomStudentsWithCount(supabase, classroomId);
    const totalStudents = studentsData.count;
    
    if (totalStudents === 0) {
      return { percentage: 0, trend: 0 };
    }
    
    // Get meeting instances for both weeks
    const [currentWeekMeetings, previousWeekMeetings] = await Promise.all([
      supabase
        .from('classroom_zoom_meeting_past_instancies')
        .select('participants')
        .eq('classroom_id', classroomId)
        .eq('is_visible_on_schedule', true)
        .gte('start_time', currentWeek.start.toISOString())
        .lte('start_time', currentWeek.end.toISOString()),
      supabase
        .from('classroom_zoom_meeting_past_instancies')
        .select('participants')
        .eq('classroom_id', classroomId)
        .eq('is_visible_on_schedule', true)
        .gte('start_time', previousWeek.start.toISOString())
        .lte('start_time', previousWeek.end.toISOString())
    ]);
    
    // Calculate attendance percentages
    const currentWeekAttendance = calculateAttendancePercentage(
      currentWeekMeetings.data || [],
      totalStudents
    );
    const previousWeekAttendance = calculateAttendancePercentage(
      previousWeekMeetings.data || [],
      totalStudents
    );
    
    // Calculate trend
    const trend = calculateTrend(currentWeekAttendance, previousWeekAttendance);
    
    return {
      percentage: Math.round(currentWeekAttendance),
      trend,
    };
  } catch (error) {
    console.error("Error fetching weekly attendance data:", error);
    return { percentage: 0, trend: 0 };
  }
}

export async function getWeeklyPendenciesData(classroomId: string): Promise<WeeklyPendenciesData> {
  try {
    const supabase = await getCachedSupabaseClient();
    
    // Calculate date ranges
    const now = new Date();
    const currentWeek = getWeekStartAndEnd(now);
    const previousWeek = getPreviousWeekStartAndEnd(currentWeek.start);
    
    // Get total students in classroom
    const studentsData = await getClassroomStudentsWithCount(supabase, classroomId);
    const totalStudents = studentsData.count;
    
    if (totalStudents === 0) {
      return { percentage: 0, trend: 0 };
    }
    
    // Get all projects for filtering
    const { data: allProjects } = await supabase
      .from('classroom_projects')
      .select('id, schedule_date')
      .eq('classroom_id', classroomId)
      .not('schedule_date', 'is', null);
    
    if (!allProjects || allProjects.length === 0) {
      return { percentage: 0, trend: 0 };
    }
    
    // Filter projects by delivery deadlines
    const currentWeekProjects = filterProjectsByDeadlineWeek(allProjects, currentWeek);
    const previousWeekProjects = filterProjectsByDeadlineWeek(allProjects, previousWeek);
    
    // Calculate pendencies for both weeks with a single query
    const [currentWeekPendencies, previousWeekPendencies] = await calculateWeeklyPendencies(
      supabase,
      currentWeekProjects,
      previousWeekProjects,
      totalStudents
    );
    
    // Calculate trend (negative trend is good for pendencies)
    const trend = calculateTrend(currentWeekPendencies, previousWeekPendencies);
    
    return {
      percentage: Math.round(currentWeekPendencies),
      trend,
    };
  } catch (error) {
    console.error("Error fetching weekly pendencies data:", error);
    return { percentage: 0, trend: 0 };
  }
}

export async function getStudentsWithConsecutiveAbsences(classroomId: string): Promise<StudentAbsence[]> {
  try {
    const supabase = await getCachedSupabaseClient();
    
    // Get students and recent meetings data
    const [studentsData, meetingsData] = await Promise.all([
      getClassroomStudentsWithCount(supabase, classroomId),
      getRecentMeetings(supabase, classroomId)
    ]);
    
    if (studentsData.students.length === 0 || meetingsData.length === 0) {
      return [];
    }
    
    // Analyze attendance patterns for each student
    const studentsWithAbsences = studentsData.students
      .map(student => analyzeStudentAttendance(student, meetingsData))
      .filter(result => result.consecutiveAbsences >= 2)
      .sort((a, b) => b.consecutiveAbsences - a.consecutiveAbsences);
    
    return studentsWithAbsences;
  } catch (error) {
    console.error("Error fetching students with consecutive absences:", error);
    return [];
  }
}

export async function getActiveProjectData(classroomId: string): Promise<ActiveProjectData | null> {
  try {
    const supabase = await getCachedSupabaseClient();
    const now = new Date();
    
    // Get all projects with schedule dates
    const { data: projects } = await supabase
      .from('classroom_projects')
      .select('id, title, module, schedule_date')
      .eq('classroom_id', classroomId)
      .not('schedule_date', 'is', null);
    
    if (!projects || projects.length === 0) {
      return null;
    }
    
    // Find currently active project
    const activeProject = findActiveProject(projects, now);
    if (!activeProject) {
      return null;
    }
    
    // Get student count and delivery statistics
    const [studentsData, deliveryStats] = await Promise.all([
      getClassroomStudentsWithCount(supabase, classroomId),
      getProjectDeliveryStats(supabase, activeProject.id)
    ]);
    
    const studentCount = studentsData.count;
    
    if (studentCount === 0) {
      return null;
    }
    
    const deliveryPercentage = calculatePercentage(deliveryStats.delivered, studentCount);
    const pendingDeliveries = studentCount - deliveryStats.delivered;
    
    return {
      id: activeProject.id,
      title: activeProject.title || 'Projeto sem título',
      module: activeProject.module || 'Módulo não informado',
      deliveryPercentage,
      pendingDeliveries,
    };
  } catch (error) {
    console.error("Error fetching active project data:", error);
    return null;
  }
}

export async function getStudentsWithConsecutivePendencies(classroomId: string): Promise<StudentPendency[]> {
  try {
    const supabase = await getCachedSupabaseClient();
    
    // Get students and ended projects data
    const [studentsData, endedProjects] = await Promise.all([
      getClassroomStudentsWithCount(supabase, classroomId),
      getEndedProjects(supabase, classroomId)
    ]);
    
    if (studentsData.students.length === 0 || endedProjects.length === 0) {
      return [];
    }
    
    // Analyze delivery patterns for all students at once
    const studentsWithPendencies = await analyzeStudentDeliveries(
      supabase,
      studentsData.students,
      endedProjects
    );
    
    return studentsWithPendencies
      .filter(result => result.consecutivePendencies >= 2)
      .sort((a, b) => b.consecutivePendencies - a.consecutivePendencies);
  } catch (error) {
    console.error("Error fetching students with consecutive pendencies:", error);
    return [];
  }
}


// Helper functions
function filterProjectsByDeadlineWeek(
  projects: { id: string; schedule_date: unknown }[],
  week: { start: Date; end: Date }
): { id: string }[] {
  return projects.filter(project => {
    const scheduleDate = project.schedule_date as { end_date?: string };
    if (!scheduleDate?.end_date) return false;
    
    const endDate = new Date(scheduleDate.end_date);
    return isDateInRange(endDate, week.start, week.end);
  });
}

async function calculateWeeklyPendencies(
  supabase: Awaited<ReturnType<typeof createClient>>,
  currentWeekProjects: { id: string }[],
  previousWeekProjects: { id: string }[],
  totalStudents: number
): Promise<[number, number]> {
  // Combinar todos os IDs de projetos das duas semanas
  const allProjectIds = [
    ...currentWeekProjects.map(p => p.id),
    ...previousWeekProjects.map(p => p.id)
  ];
  
  if (allProjectIds.length === 0) return [0, 0];
  
  // Fazer uma única consulta para todas as entregas
  const { data: deliveries } = await supabase
    .from('classroom_project_deliveries')
    .select('project_id')
    .in('project_id', allProjectIds);
  
  // Contar entregas por projeto
  const deliveryCountByProject = new Map<string, number>();
  deliveries?.forEach(delivery => {
    const count = deliveryCountByProject.get(delivery.project_id) || 0;
    deliveryCountByProject.set(delivery.project_id, count + 1);
  });
  
  // Calcular pendências para semana atual
  const currentWeekExpectedDeliveries = currentWeekProjects.length * totalStudents;
  const currentWeekActualDeliveries = currentWeekProjects.reduce((total, project) => {
    return total + (deliveryCountByProject.get(project.id) || 0);
  }, 0);
  const currentWeekPendencies = calculatePercentage(
    currentWeekExpectedDeliveries - currentWeekActualDeliveries,
    currentWeekExpectedDeliveries
  );
  
  // Calcular pendências para semana anterior
  const previousWeekExpectedDeliveries = previousWeekProjects.length * totalStudents;
  const previousWeekActualDeliveries = previousWeekProjects.reduce((total, project) => {
    return total + (deliveryCountByProject.get(project.id) || 0);
  }, 0);
  const previousWeekPendencies = calculatePercentage(
    previousWeekExpectedDeliveries - previousWeekActualDeliveries,
    previousWeekExpectedDeliveries
  );
  
  return [currentWeekPendencies, previousWeekPendencies];
}

function findActiveProject(
  projects: { id: string; title: string; module: string; schedule_date: unknown }[],
  currentDate: Date
): { id: string; title: string; module: string } | null {
  return projects.find(project => {
    const scheduleDate = project.schedule_date as { start_date?: string; end_date?: string };
    if (!scheduleDate?.start_date || !scheduleDate?.end_date) return false;
    
    const startDate = new Date(scheduleDate.start_date);
    const endDate = new Date(scheduleDate.end_date);
    
    return isDateInRange(currentDate, startDate, endDate);
  }) || null;
}

async function getProjectDeliveryStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string
): Promise<{ delivered: number }> {
  const { count: deliveredCount } = await supabase
    .from('classroom_project_deliveries')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId);
  
  return { delivered: deliveredCount || 0 };
}

const getClassroomStudentsWithCount = cache(async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  classroomId: string
): Promise<{
  students: Array<{ user_id: string; profile: { full_name: string; email: string } }>;
  count: number;
}> => {
  const { data: students, count } = await supabase
    .from('user_classrooms')
    .select(`
      user_id,
      profiles!inner(
        full_name,
        email
      )
    `, { count: 'exact' })
    .eq('classroom_id', classroomId);
  
  const processedStudents = (students || []).map(student => ({
    user_id: student.user_id,
    profile: Array.isArray(student.profiles) ? student.profiles[0] : student.profiles as { full_name: string; email: string }
  })).filter(student => student.profile);
  
  return {
    students: processedStudents,
    count: count || 0
  };
});

const getRecentMeetings = cache(async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  classroomId: string,
  limit: number = 10
): Promise<Array<{ participants: { user_id?: string; email?: string }[] }>> => {
  const { data: meetings } = await supabase
    .from('classroom_zoom_meeting_past_instancies')
    .select('participants')
    .eq('classroom_id', classroomId)
    .eq('is_visible_on_schedule', true)
    .order('start_time', { ascending: false })
    .limit(limit);
  
  return (meetings || []).map(meeting => ({
    participants: meeting.participants as { user_id?: string; email?: string }[]
  }));
});

function analyzeStudentAttendance(
  student: { user_id: string; profile: { full_name: string; email: string } },
  meetings: Array<{ participants: { user_id?: string; email?: string }[] }>
): StudentAbsence {
  let consecutiveAbsences = 0;
  let maxConsecutiveAbsences = 0;
  
  // Check attendance in meetings (from most recent to oldest)
  for (const meeting of meetings) {
    const attended = meeting.participants?.some(p => 
      p.user_id === student.user_id || p.email === student.profile.email
    );
    
    if (!attended) {
      consecutiveAbsences++;
    } else {
      maxConsecutiveAbsences = Math.max(maxConsecutiveAbsences, consecutiveAbsences);
      consecutiveAbsences = 0;
    }
  }
  
  // Check if current streak is the highest
  maxConsecutiveAbsences = Math.max(maxConsecutiveAbsences, consecutiveAbsences);
  
  return {
    name: student.profile.full_name || 'Nome não informado',
    email: student.profile.email || 'Email não informado',
    consecutiveAbsences: maxConsecutiveAbsences,
  };
}

const getEndedProjects = cache(async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  classroomId: string,
  limit: number = 10
): Promise<Array<{ id: string; title: string }>> => {
  const { data: projects } = await supabase
    .from('classroom_projects')
    .select('id, title, schedule_date')
    .eq('classroom_id', classroomId)
    .not('schedule_date', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  const now = new Date();
  
  return (projects || [])
    .filter(project => {
      const scheduleDate = project.schedule_date as { end_date?: string };
      if (!scheduleDate?.end_date) return false;
      
      const endDate = new Date(scheduleDate.end_date);
      return endDate < now;
    })
    .map(project => ({
      id: project.id,
      title: project.title || 'Projeto sem título'
    }));
});

async function analyzeStudentDeliveries(
  supabase: Awaited<ReturnType<typeof createClient>>,
  students: Array<{ user_id: string; profile: { full_name: string; email: string } }>,
  projects: Array<{ id: string; title: string }>
): Promise<StudentPendency[]> {
  if (students.length === 0 || projects.length === 0) {
    return [];
  }

  const projectIds = projects.map(p => p.id);

  // Buscar todas as entregas de todos os alunos para todos os projetos de uma vez
  const { data: deliveries } = await supabase
    .from('classroom_project_deliveries')
    .select('project_id, members')
    .in('project_id', projectIds);

  // Criar um mapa de entregas por aluno e projeto para consulta rápida
  const deliveryMap = new Map<string, Set<string>>();
  
  deliveries?.forEach(delivery => {
    const members = delivery.members as string[];
    members?.forEach(memberId => {
      if (!deliveryMap.has(memberId)) {
        deliveryMap.set(memberId, new Set());
      }
      deliveryMap.get(memberId)!.add(delivery.project_id);
    });
  });

  // Analisar cada aluno
  return students.map(student => {
    const studentDeliveries = deliveryMap.get(student.user_id) || new Set();
    let consecutivePendencies = 0;
    let maxConsecutivePendencies = 0;
    
    // Check deliveries for projects (from most recent to oldest)
    for (const project of projects) {
      const delivered = studentDeliveries.has(project.id);
      
      if (!delivered) {
        consecutivePendencies++;
      } else {
        maxConsecutivePendencies = Math.max(maxConsecutivePendencies, consecutivePendencies);
        consecutivePendencies = 0;
      }
    }
    
    // Check if current streak is the highest
    maxConsecutivePendencies = Math.max(maxConsecutivePendencies, consecutivePendencies);
    
    return {
      name: student.profile.full_name || 'Nome não informado',
      email: student.profile.email || 'Email não informado',
      consecutivePendencies: maxConsecutivePendencies,
    };
  });
}


