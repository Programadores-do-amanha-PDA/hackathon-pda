"use client";
import { createContext, useContext, useEffect, useState } from "react";
import PageLoader from "@/components/shared/page-loader";
import basePathLabels from "@/utils/path-labels/base";
import { ClassroomT } from "@/types/classrooms";
import ClassroomStack, { ClassroomStackI } from "../modules/classrooms";
import UserRolesStack, { UserRolesStackI } from "../modules/users/roles";
import UsersStack, { UsersStackI } from "../modules/users";
import { Sunrise, Sun, Moon } from "lucide-react";
import { AppSidebar } from "@/components/shared/sidebar/app-sidebar";
import AppBar from "@/components/shared/app-bar";
import { useAuth } from "../auth-context";
import createSidebarData from "@/utils/sidebar-data";

interface AdminStackContextProps {
  users: UsersStackI;
  userRoles: UserRolesStackI;
  classrooms: ClassroomStackI;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const AdminStackContext = createContext<AdminStackContextProps>(
  {} as AdminStackContextProps
);

export const AdminStackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(true);

  const { user, userRole } = useAuth();
  const users = UsersStack();
  const userRoles = UserRolesStack(users.setUsers);
  const classrooms = ClassroomStack();

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

const createPathLabels = (classrooms: ClassroomT[]) => ({
  ...basePathLabels,
  ...Object.fromEntries(classrooms.map((c) => [c.id, c.name])),
});

export const useAdminStackContext = () => useContext(AdminStackContext);
