import { ZoomMeetingPastInstancesType } from "@/types/zoom";

export function calculatePresenceByType(studentId: string, zoomPastInstances: ZoomMeetingPastInstancesType[], studentEmail: string) {
  const presenceData = {
    general: 0,
    programming: 0,
    english: 0,
    softSkills: 0
  };

  // agrupando instâncias por tipo de aula
  const instancesByType = zoomPastInstances.reduce((acc, instance) => {
    if (!acc[instance.class_type]) {
      acc[instance.class_type] = [];
    }
    acc[instance.class_type].push(instance);
    return acc;
  }, {} as Record<string, ZoomMeetingPastInstancesType[]>);


  // calculando presença para cada tipo
  Object.keys(instancesByType).forEach(classType => {
    const instances = instancesByType[classType];
    const totalInstances = instances.length;

    if (totalInstances === 0) return;

    const attendedInstances = instances.filter((instance: ZoomMeetingPastInstancesType) => {


      if (!instance.participants || instance.participants.length === 0) {

        return false; //nenhum participante encontrado  
      }

      const hasParticipant = instance.participants.some((participant: any) => {
        const emailMatch = participant.user_email === studentEmail;
        const userIdMatch = participant.user_id === studentId;


        return emailMatch || userIdMatch;
      });

      return hasParticipant;
    }).length;

    const presencePercentage = Math.round((attendedInstances / totalInstances) * 100);

    //TODO: melhorar caso haja outros tipos
    switch (classType) {
      case 'programming':
        presenceData.programming = presencePercentage;

        break;
      case 'english':
        presenceData.english = presencePercentage;

        break;
      case 'soft-skills':
        presenceData.softSkills = presencePercentage;

        break;
      case 'community':
      case 'general':
        presenceData.general = presencePercentage;

        break;
      default:
        presenceData.general = presencePercentage;

    }
  });



  // fazendo o cálculo com base em TODAS as instâncias (independente do tipo)
  if (zoomPastInstances.length > 0) {
    const totalAttendedAcrossAllTypes = zoomPastInstances.filter(instance => {
      return instance.participants?.some((participant: any) => {
        const emailMatch = participant.user_email === studentEmail;
        const userIdMatch = participant.user_id === studentId;
        return emailMatch || userIdMatch;
      });
    }).length;

    const generalPresenceFromAll = Math.round((totalAttendedAcrossAllTypes / zoomPastInstances.length) * 100);


    // se não houver presença geral específica, usar o cálculo baseado em todas as instâncias 
    if (presenceData.general === 0) {
      presenceData.general = generalPresenceFromAll;

    }

    console.log(`presença-final calculada:`, presenceData);
    return presenceData;
  }


  return presenceData;
}
