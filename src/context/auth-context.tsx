"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import PageLoader from "@/components/shared/page-loader";
import { getAuthUser, getSession } from "@/app/actions/(auth)/auth";
import { signOut } from "@/app/actions/(auth)";
import { AuthUserWithProfileT, JwtPayload } from "@/types/auth";
import { getProfileById } from "@/app/actions/profiles";
import { getAvatarUrlById } from "@/app/actions/profile-avatar";
import { resendSignupConfirmationWithEmail } from "@/app/actions/(auth)/emails";

interface AuthContextProps {
  user: AuthUserWithProfileT | null;
  userRole: "admin" | "employer" | "alumni" | null;
  loading: boolean;
  isAuthenticated: boolean;
  redirectToRoleDashboard: () => void;
  handleSignOut: () => Promise<void>;
  handleResendConfirmationEmail: (email: string) => Promise<boolean>;
  fetchSession: () => Promise<void>;
  updateAuthState: (session: { access_token: string } | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUserWithProfileT | null>(null);
  const [userRole, setUserRole] = useState<
    "admin" | "employer" | "alumni" | null
  >(null);
  const [loading, setLoading] = useState(true);

// Helper to check if the user is authenticated
  const isAuthenticated = !!user && !!userRole;

// Function to process JWT token
  const processJwtToken = async (accessToken: string) => {
    try {
      const decodedToken = jwtDecode<JwtPayload>(accessToken);

      if (decodedToken.user_role) {
        setUserRole(decodedToken.user_role);
        await fetchUserProfile(accessToken);
      } else {
        throw new Error("Token não contém informação de role válida");
      }
    } catch (error) {
      console.error("Erro ao processar token:", error);
      setUser(null);
      setUserRole(null);
    }
  };

// Function to fetch user profile
  const fetchUserProfile = async (accessToken: string) => {
    try {
      const authUserData = await getAuthUser(accessToken);

      if (authUserData) {
        const profile = await getProfileById(authUserData.id);
        const avatarUrl = await getAvatarUrlById(authUserData.id);

        if (profile) {
          setUser({
            ...authUserData,
            profile: { ...profile, avatarUrl },
          });
        } else {
          throw new Error("Perfil do usuário não encontrado");
        }
      } else {
        throw new Error("Usuário não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      setUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

// Update authentication state
  const updateAuthState = async (session: { access_token: string } | null) => {
    if (session) {
      await processJwtToken(session.access_token);
    } else {
      setUser(null);
      setUserRole(null);
    }
  };

// Fetch initial session
  const fetchSession = async () => {
    setLoading(true);
    try {
      const session = await getSession();
      if (!session) throw new Error("session is null");
      await updateAuthState(session);
    } catch {
      setUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

// Redirect to the role-specific dashboard
  const redirectToRoleDashboard = () => {
    if (loading || !isAuthenticated) return;

    const routes = {
      admin: "/dashboard/admin",
      employer: "/dashboard/employer",
      alumni: "/dashboard/alumni",
    };

    const targetRoute = routes[userRole] || "/";

    if (!pathname.startsWith(targetRoute)) {
      router.push(targetRoute);
    }
  };

// Handles user logout
  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut();
      setUser(null);
      setUserRole(null);
      toast.success("Usuário deslogado com sucesso!");
      router.push("/");
    } catch (error) {
      console.error("Erro ao deslogar:", error);
      toast.error("Falha ao deslogar o usuário!");
    } finally {
      setLoading(false);
    }
  };

// Resend confirmation email
  const handleResendConfirmationEmail = async (email: string) => {
    try {
      const result = await resendSignupConfirmationWithEmail(email);
      if (result) {
        toast.success("Confirmação de email reenviada com sucesso!");
        return true;
      }
      throw new Error("Falha ao reenviar confirmação");
    } catch (error) {
      console.error("Erro ao reenviar email:", error);
      toast.error("Falha ao reenviar confirmação de email!");
      return false;
    }
  };

// Effect to load initial session
  useEffect(() => {
    fetchSession();
  }, []);

// Effect for handling redirection
  useEffect(() => {
    if (!loading && isAuthenticated) {
      redirectToRoleDashboard();
    }
  }, [user, userRole, loading, pathname, isAuthenticated]);

// Display loader while loading
  if (loading) {
    return <PageLoader />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        isAuthenticated,
        redirectToRoleDashboard,
        handleSignOut,
        handleResendConfirmationEmail,
        fetchSession,
        updateAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
