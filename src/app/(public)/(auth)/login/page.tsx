"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import LoginForm from "@/components/modules/Auth/LoginForm";

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      window.location.href = callbackUrl;
    }
  }, [status, searchParams]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Redirecting to dashboard...</div>
      </div>
    );
  }

  return <LoginForm />;
};

export default LoginPage;
