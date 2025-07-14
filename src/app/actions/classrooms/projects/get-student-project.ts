
"use server";


import { getAllCorrectionsByDeliveryId } from "./corrections";
import { getAllDeliveriesByProjectId } from "./deliveries";

export async function getStudentProjectGrades(studentId: string, projects: any[], studentEmail: string) {
  const projectGrades: { [key: string]: number } = {};

  for (const project of projects) {
    try {
      console.log(`  📋 Verificando projeto: ${project.title} (${project.id})`);


      const deliveries = await getAllDeliveriesByProjectId(project.id);


      if (!deliveries || deliveries.length === 0) {
        console.log(`  ⚠️  Nenhuma entrega encontrada para o projeto ${project.title}`);
        continue;
      }


      const studentDelivery = deliveries.find(delivery => {
        console.log(`  🔍 Verificando entrega ${delivery.id}:`);
        console.log(`  👥 Membros da entrega:`, delivery.members);

        const hasMemberById = delivery.members.includes(studentId);
        const hasMemberByEmail = delivery.members.includes(studentEmail);


        return hasMemberById || hasMemberByEmail;
      });

      if (!studentDelivery) {
        console.log(`  ⚠️  Estudante ${studentEmail} (${studentId}) não encontrado nas entregas do projeto ${project.title}`);
        continue;
      }

      // Obter correção da entrega
      const corrections = await getAllCorrectionsByDeliveryId(studentDelivery.id);

      if (corrections && corrections.length > 0) {
        // Pegar a correção mais recente
        const latestCorrection = corrections[0];
        const finalNote = parseFloat(latestCorrection.final_note) || 0;
        projectGrades[project.id] = finalNote;
        console.log(`  📊 Nota final: ${finalNote}`);
      } else {
        console.log(`  ⚠️  Nenhuma correção encontrada para a entrega ${studentDelivery.id}`);
      }
    } catch (error) {
      console.error(`  ❌ Erro ao obter nota do projeto ${project.id}:`, error);
    }
  }

  return projectGrades;
}
