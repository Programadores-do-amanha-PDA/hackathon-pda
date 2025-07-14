import { ZoomMeetingPastInstancesType } from "@/types/zoom";


export function calculatePresenceByType(studentId: string, zoomPastInstances: ZoomMeetingPastInstancesType[]) {
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
      return instance.participants?.some((participant: any) =>
        participant.user_id === studentId
      );
    }).length;

    const presencePercentage = Math.round((attendedInstances / totalInstances) * 100);

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
      default:
        presenceData.general = presencePercentage;
    }
  });

  return presenceData;
}
