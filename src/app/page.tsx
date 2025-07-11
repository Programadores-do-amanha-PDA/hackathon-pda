"use client";
import PageLoader from "@/components/shared/page-loader";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return router.push("/login");
  } else if (user) {
    return router.push("/dashboard");
  }

  return <PageLoader />;
}
