"use server";

import { ClassroomOverviewData } from "@/types/classroom-overview";

export async function getClassroomOverviewData(): Promise<ClassroomOverviewData> {
  // Por enquanto, vamos retornar dados mockados para teste
  // Depois implementaremos a integração real com Supabase
  
  const mockData: ClassroomOverviewData = {
    students: [
      {
        id: "1",
        name: "João Silva",
        email: "joao@email.com",
        number: 1,
        presence: {
          general: 85,
          programming: 90,
          english: 80,
          softSkills: 75
        },
        coodesh: {
          "test-1": 85,
          "test-2": 92
        },
        projects: {
          "mp-1": 8.5,
          "mp-2": 9.2,
          "p-1": 8.8,
          "pi-1": 7.5
        }
      },
      {
        id: "2",
        name: "Maria Santos",
        email: "maria@email.com",
        number: 2,
        presence: {
          general: 92,
          programming: 95,
          english: 88,
          softSkills: 90
        },
        coodesh: {
          "test-1": 78,
          "test-2": 86
        },
        projects: {
          "mp-1": 9.0,
          "mp-2": 8.8,
          "p-1": 9.5,
          "pi-1": 8.2
        }
      },
      {
        id: "3",
        name: "Pedro Costa",
        email: "pedro@email.com",
        number: 3,
        presence: {
          general: 78,
          programming: 85,
          english: 72,
          softSkills: 80
        },
        coodesh: {
          "test-1": 90,
          "test-2": 75
        },
        projects: {
          "mp-1": 7.5,
          "mp-2": 8.0,
          "p-1": 8.5,
          "pi-1": 7.2
        }
      },
      {
        id: "4",
        name: "Ana Oliveira",
        email: "ana@email.com",
        number: 4,
        presence: {
          general: 95,
          programming: 98,
          english: 92,
          softSkills: 96
        },
        coodesh: {
          "test-1": 88,
          "test-2": 94
        },
        projects: {
          "mp-1": 9.5,
          "mp-2": 9.8,
          "p-1": 9.0,
          "pi-1": 8.5
        }
      },
      {
        id: "5",
        name: "Carlos Ferreira",
        email: "carlos@email.com",
        number: 5,
        presence: {
          general: 82,
          programming: 87,
          english: 76,
          softSkills: 84
        },
        coodesh: {
          "test-1": 82,
          "test-2": 89
        },
        projects: {
          "project-1": 8.2,
          "project-2": 8.7
        }
      }
    ],
    coodeshTests: [
      { id: "test-1", name: "123" },
      { id: "test-2", name: "Teste React" }
    ],
    projects: [
      { id: "mp-1", name: "MP1" },
      { id: "mp-2", name: "MP1" },
      { id: "p-1", name: "P0" },
      { id: "pi-1", name: "PI0" }
    ]
  };

  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockData;
}
