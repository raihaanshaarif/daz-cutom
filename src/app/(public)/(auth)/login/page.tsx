"use client";

import { Suspense } from "react";
import LoginForm from "@/components/modules/Auth/LoginForm";

function LoginPageContent() {
  return <LoginForm />;
}

const LoginPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div>Loading...</div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
};

export default LoginPage;
