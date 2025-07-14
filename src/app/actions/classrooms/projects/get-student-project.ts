
"use server";


import { getAllCorrectionsByDeliveryId } from "./corrections";
import { getAllDeliveriesByProjectId } from "./deliveries";

export async function getStudentProjectGrades(studentId: string, projects: any[], studentEmail: string) {
  const projectGrades: { [key: string]: number } = {};

  for (const project of projects) {
    try {

      const deliveries = await getAllDeliveriesByProjectId(project.id);


      if (!deliveries || deliveries.length === 0) {

        continue;
      }


      const studentDelivery = deliveries.find(delivery => {


        const hasMemberById = delivery.members.includes(studentId);
        const hasMemberByEmail = delivery.members.includes(studentEmail);


        return hasMemberById || hasMemberByEmail;
      });

      if (!studentDelivery) {

        continue;
      }

      // Obter correção da entrega
      const corrections = await getAllCorrectionsByDeliveryId(studentDelivery.id);

      if (corrections && corrections.length > 0) {
        // Pegar a correção mais recente
        const latestCorrection = corrections[0];
        const finalNote = parseFloat(latestCorrection.final_note) || 0;
        projectGrades[project.id] = finalNote;

      }
    } catch (error) {
      console.error(`  ❌ Erro ao obter nota do projeto ${project.id}:`, error);
    }
  }

  return projectGrades;
}
