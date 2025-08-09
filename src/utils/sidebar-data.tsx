import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthUserWithProfileT } from "@/types/auth";
import { ClassroomT } from "@/types/classrooms";
import { LucideIcon } from "lucide-react";
// import createClassroomNavigation from "./classroom-navigation";

const createClassroomNavigation = (
  classrooms: ClassroomT[],
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

const createSidebarData = (
  user: AuthUserWithProfileT,
  userRole: string,
  classrooms: ClassroomT[],
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

export default createSidebarData;


