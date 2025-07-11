"use client";
import { createContext, useContext, useEffect, useState } from "react";
import PageLoader from "@/components/shared/page-loader";
import basePathLabels from "@/utils/base-path-labels";
import { AuthUserWithProfileT } from "@/types/auth";
import { ClassroomType } from "@/types/classrooms";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ClassroomStack, { ClassroomStackI } from "../modules/classrooms";
import UserRolesStack, { UserRolesStackI } from "../modules/users/roles";
import UsersStack, { UsersStackI } from "../modules/users";
import { Sunrise, Sun, Moon, LucideIcon } from "lucide-react";
import { AppSidebar } from "@/components/shared/sidebar/app-sidebar";
import AppBar from "@/components/shared/app-bar";
import { useAuth } from "../auth-context";

// 1. Definições de Tipos
interface AdminStackContextProps {
  users: UsersStackI;
  userRoles: UserRolesStackI;
  classrooms: ClassroomStackI;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

// 2. Criação do Contexto
const AdminStackContext = createContext<AdminStackContextProps>(
  {} as AdminStackContextProps
);

// 3. Provedor de Contexto
export const AdminStackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(true);

  // 4. Hooks de Módulos
  const { user, userRole } = useAuth();
  const users = UsersStack();
  const userRoles = UserRolesStack(users.setUsers);
  const classrooms = ClassroomStack();

  // 5. Efeitos Colaterais
  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          classrooms.handleGetAllClassrooms(),
          users.handleGetAllUsersWithProfiles(),
        ]);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading || !user || !userRole) return <PageLoader />;

  // 6. Configurações de Navegação
  const classroomPeriodsIcons = {
    morning: Sunrise,
    afternoon: Sun,
    evening: Moon,
  };

  const sidebarData = createSidebarData(
    user,
    userRole,
    classrooms.classrooms,
    classroomPeriodsIcons
  );

  // 7. Contexto de Rota
  const pathLabels = createPathLabels(classrooms.classrooms);

  return (
    <AdminStackContext.Provider
      value={{
        users: users,
        userRoles: userRoles,
        classrooms: classrooms,
        loading,
        setLoading,
      }}
    >
      <AppSidebar data={sidebarData} />
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        <AppBar pathLabels={pathLabels} />
        <div className="w-full h-full flex flex-col gap-10 overflow-hidden">
          {children}
        </div>
      </div>
    </AdminStackContext.Provider>
  );
};

// 8. Funções Auxiliares
const createSidebarData = (
  user: AuthUserWithProfileT,
  userRole: string,
  classrooms: ClassroomType[],
  icons: Record<string, LucideIcon>
) => ({
  user,
  userRole,
  team: {
    name: "Administrador",
    logo: () => (
      <Avatar className="size-8">
        <AvatarImage src="/assets/logos/simbolo_pda_fundo_branco.png" />
        <AvatarFallback>PdA</AvatarFallback>
      </Avatar>
    ),
  },
  navMain: [],
  classRooms: createClassroomNavigation(classrooms, icons),
  projects: [],
});

const createClassroomNavigation = (
  classrooms: ClassroomType[],
  icons: Record<string, LucideIcon>
): {
  title: string;
  ref: string;
  url: string;
  icon?: LucideIcon;
  items: { title: string; url: string }[];
}[] => {
  return classrooms
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((classroom) => ({
      title: classroom.name,
      ref: classroom.id,
      url: `/dashboard/admin/classrooms/${classroom.id}`,
      icon: icons[classroom.period],
      items: [
        {
          title: "Visão Geral",
          url: `/dashboard/admin/classrooms/${classroom.id}/attendance`,
        },
        {
          title: "Atividades",
          url: `/dashboard/admin/classrooms/${classroom.id}/projects`,
        },
      ],
    }));
};

const createPathLabels = (classrooms: ClassroomType[]) => ({
  ...basePathLabels,
  ...Object.fromEntries(classrooms.map((c) => [c.id, c.name])),
});

// 9. Hook de Contexto
export const useAdminStackContext = () => useContext(AdminStackContext);
