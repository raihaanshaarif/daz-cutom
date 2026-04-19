"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FieldValues, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { signIn, useSession } from "next-auth/react";

// type LoginFormValues = {
//   email: string;
//   password: string;
// };

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const form = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Check for error from NextAuth redirect
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError("Invalid email or password. Please try again.");
    }
  }, [searchParams]);

  // Watch for session changes and redirect when authenticated
  useEffect(() => {
    if (status === "authenticated" && session && isLoading) {
      console.log("[LoginForm] Session detected, redirecting to dashboard");
      setIsLoading(false);
      router.push("/dashboard");
    }
  }, [status, session, isLoading, router]);

  const onSubmit = async (values: FieldValues) => {
    setIsLoading(true);
    setError(null);

    console.log("[LoginForm] Starting login process...");

    try {
      console.log("[LoginForm] Calling signIn with credentials");
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      console.log("[LoginForm] signIn result:", {
        ok: result?.ok,
        error: result?.error,
        status: result?.status,
        url: result?.url,
      });

      if (!result?.ok || result?.error) {
        console.log("[LoginForm] Login failed, setting error:", result?.error);
        setError(
          result?.error || "Invalid email or password. Please try again.",
        );
        setIsLoading(false);
        return;
      }

      console.log("[LoginForm] Login successful, waiting for session update");
      // The useEffect above will handle the redirect when session updates
    } catch (err) {
      console.error("[LoginForm] Caught error:", err);
      setError("An error occurred during login. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="space-y-6 w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full max-w-md"
          >
            <h2 className="text-3xl font-bold text-center">
              Daz Employee Login
            </h2>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <div className="flex items-center justify-center space-x-2">
              <div className="h-px w-16 bg-gray-300" />

              <div className="h-px w-16 bg-gray-300" />
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
