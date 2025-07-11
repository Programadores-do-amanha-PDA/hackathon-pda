"use server";
import { createClient } from "@/lib/supabase/server";

export const requestPasswordResetWithEmail = async (email: string) => {
  try {
    const PLATFORM_PATH = process.env.NEXT_PUBLIC_PLATFORM_PATH;
    if (!PLATFORM_PATH || !email)
      throw new Error("Platform base URL not specified");

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: PLATFORM_PATH.concat("/reset-password"),
    });
    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error resetting password:", error);
    return false;
  }
};

export const resendSignupConfirmationWithEmail = async (email: string) => {
  try {
    const PLATFORM_PATH = process.env.NEXT_PUBLIC_PLATFORM_PATH;
    if (!email || !PLATFORM_PATH) throw new Error("Email or PLATFORM_PATH not specific");

    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: PLATFORM_PATH,
      },
    });
    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error on resend signup confirmation:", error);
    return false;
  }
};
