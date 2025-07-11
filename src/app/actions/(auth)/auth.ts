import { supabase } from "@/lib/supabase/client";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

export const getAuthUser = async (jwt: string) => {
  try {
    if (!jwt) return null;

    const {
      data: { user },
    } = await supabase.auth.getUser(jwt);

    if (!user) throw "user not found";
    return user;
  } catch (error) {
    console.error("Error fetching auth user:", error);
    return null;
  }
};

export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    return data.session;
  } catch (error) {
    console.error("Error fetching session:", error);
    return false;
  }
};

export const onAuthStateChange = (
  updateAuthState: (session: { access_token: string } | null) => Promise<void>
) => {
  return supabase.auth.onAuthStateChange(
    async (event: AuthChangeEvent, session: Session | null): Promise<void> => {
      console.log(event);
      await updateAuthState(session);
    }
  );
};
