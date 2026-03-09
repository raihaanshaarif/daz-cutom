"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/modules/Auth/LoginForm";

const LoginPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (window.location.search.includes("callbackUrl")) {
      router.replace("/login");
    }
  }, [router]);

  return <LoginForm />;
};

export default LoginPage;
