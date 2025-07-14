"use server";

import { ClassroomOverviewData, StudentOverview } from "@/types/classroom-overview";
import { calculatePresenceByType } from "@/utils/calculate-presence-by-type";
import { getStudentCoodeshGrades } from "@/utils/get-student-coodesh-grades";
import { getAllCoodeshAssessment } from "./classrooms/coodesh/assessments";
import { getAllProjectsByClassroomId } from "./classrooms/projects";
import { getStudentProjectGrades } from "./classrooms/projects/get-student-project";
import { getAllZoomPastInstancesByClassroomId } from "./classrooms/zoom/meetings-past-instancies";
import { getAllProfilesFilteredByRole } from "./profiles";
import { getAllUsersClassroomsByClassroomId } from "./user-classroom";

export async function getClassroomOverviewData(classroomId: string): Promise<ClassroomOverviewData> {
  try {

    //  pegando usuários da classroom que são estudantes
    const [studentsProfiles, usersClassrooms] = await Promise.all([
      getAllProfilesFilteredByRole("student"),
      getAllUsersClassroomsByClassroomId(classroomId)
    ]);



    if (!studentsProfiles || !usersClassrooms) {
      throw new Error("Não foi possível obter os dados dos estudantes");
    }

    // pegando apenas estudantes que estão nesta classroom
    const classroomStudentIds = usersClassrooms.map(uc => uc.user_id);
    const classroomStudents = studentsProfiles.filter(student =>
      classroomStudentIds.includes(student.id)
    );


    // pegando projetos da classroom
    const classroomProjects = await getAllProjectsByClassroomId(classroomId);

    if (classroomProjects?.length) {
      console.log("projetos:", classroomProjects.map(p => ({ id: p.id, title: p.title })));
    }

    // pegando assessments do Coodesh
    const coodeshAssessments = await getAllCoodeshAssessment(classroomId);
    const coodeshAssessmentsArray = Array.isArray(coodeshAssessments) ? coodeshAssessments : [];

    if (coodeshAssessmentsArray.length) {
      console.log("📋 Assessments:", coodeshAssessmentsArray.map((a: any) => ({
        id: a.id,
        name: a.name,
        hasParticipants: !!a.participants_data?.length
      })));
    }

    // pegando instâncias passadas do Zoom para cálculo de presença
    const zoomPastInstances = await getAllZoomPastInstancesByClassroomId(classroomId);
    const zoomPastInstancesArray = Array.isArray(zoomPastInstances) ? zoomPastInstances : [];
    console.log("📹 Instâncias Zoom encontradas:", zoomPastInstancesArray.length);

    // processando dados dos estudantes
    const studentsOverview: StudentOverview[] = await Promise.all(
      classroomStudents.map(async (student, index) => {
        // calculando presença por tipo de aula
        const presenceByType = calculatePresenceByType(student.id!, zoomPastInstancesArray);

        // pegando notas dos projetos
        const projectGrades = await getStudentProjectGrades(student.id!, classroomProjects || [], student.email);

        // pegando notas do Coodesh
        const coodeshGrades = getStudentCoodeshGrades(student.id!, coodeshAssessmentsArray, student.email);
        console.log(`🧪 Notas Coodesh para ${student.full_name}:`, coodeshGrades);

        return {
          id: student.id!,
          name: student.full_name,
          email: student.email,
          number: index + 1,
          presence: presenceByType,
          coodesh: coodeshGrades,
          projects: projectGrades
        };
      })
    );

    //  dados de testes e projetos
    const coodeshTests = coodeshAssessmentsArray.map(assessment => ({
      id: assessment.id!,
      name: assessment.name
    }));

    const projects = (classroomProjects || []).map(project => ({
      id: project.id,
      name: project.title
    }));


    return {
      students: studentsOverview,
      coodeshTests,
      projects
    };

  } catch (error) {
    console.error("[DEU RUIM] Erro ao obter dados do classroom overview:", error);

    return {
      students: [],
      coodeshTests: [],
      projects: []
    };
  }
}
