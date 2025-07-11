"use client";
import Image from "next/image";

import BinaryRainBackground from "@/components/shared/binary-rain-background";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { RequestResetPasswordForm } from "@/features/auth/components/request-reset-password-form";
import { useAuth } from "@/hooks/use-auth";

export default function ResetPasswordPage() {
  const { user } = useAuth();

  return (
    <div className="w-full h-full flex gap-6 bg-muted p-6 md:p-10">
      <div className="flex h-full w-full flex-col justify-center items-center gap-6">
        {!user ? <RequestResetPasswordForm /> : <ResetPasswordForm />}
      </div>
      <div className="flex w-full h-full flex-col">
        <div className="flex w-full h-full items-center justify-center text-primary-foreground rounded-xl relative bg-primary/50 overflow-clip">
          <BinaryRainBackground color="#000000" opacity={0.1} speed={30} />
          <Image
            src="/assets/images/login/woman-login-art.png"
            alt="Programadores do Amanhã"
            width={500}
            height={500}
            className="size-96 z-10"
            priority
          />
        </div>
      </div>
    </div>
  );
}
