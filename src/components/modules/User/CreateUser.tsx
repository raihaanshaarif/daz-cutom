"use client";

import React from "react";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { register } from "@/actions/auth";
import {
  User,
  Mail,
  Lock,
  Shield,
  UserPlus,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Key,
  Fingerprint,
  Activity,
  BadgeCheck,
  BadgeInfo,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UserFormValues = {
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  isVerified: boolean;
};

export default function CreateUser() {
  const router = useRouter();

  const form = useForm<UserFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
      status: "ACTIVE",
      isVerified: false,
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    try {
      const res = await register(values);
      if (res?.id) {
        toast.success("User created successfully");
        router.push("/dashboard/user/user-list");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Modern Header Section */}
        <div className="sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 bg-zinc-50/80 backdrop-blur-md border-b border-zinc-200/50 gap-4 pt-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              User <span className="text-indigo-600">Management</span>
            </h1>
            <p className="text-zinc-500 mt-1 flex items-center gap-2 text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Provision new access and credentials for platform users
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/50 p-1.5 rounded-2xl border border-zinc-200/50 shadow-sm">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="h-10 px-4 gap-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-semibold text-sm">Cancel</span>
            </Button>
            <Button
              type="submit"
              form="create-user-form"
              disabled={form.formState.isSubmitting}
              className="h-10 px-8 bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-bold shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-indigo-500/50 rounded-xl gap-2"
            >
              {form.formState.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white/30" />
                  <span>Provisioning...</span>
                </div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-indigo-100" />
                  <span>Create User</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <Form {...form}>
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
            {/* Main Details Section */}
            <div className="lg:col-span-4">
              <form
                id="create-user-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Personal Profile */}
                <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-sm overflow-hidden rounded-3xl group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 transform transition-transform group-hover:scale-y-110" />
                  <CardHeader className="border-b border-zinc-100/80 pb-4">
                    <div className="flex items-center gap-3 text-zinc-900">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold">
                          Personal Profile
                        </CardTitle>
                        <p className="text-xs text-zinc-500 font-medium">
                          Core identification and authentication data
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-8 space-y-8 text-zinc-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-medium">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[11px] uppercase tracking-[0.1em] text-zinc-400 font-black flex items-center gap-2">
                              <Fingerprint className="w-3.5 h-3.5 text-indigo-500" />{" "}
                              Full Name *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John Doe"
                                className="h-13 bg-zinc-50/50 border-zinc-200/80 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all rounded-2xl font-semibold placeholder:text-zinc-300"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-[10px] uppercase font-bold tracking-tight" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-[11px] uppercase tracking-[0.1em] text-zinc-400 font-black flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-indigo-500" />{" "}
                              Email Address *
                            </FormLabel>
                            <FormControl>
                              <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within/input:text-indigo-500 transition-colors" />
                                <Input
                                  type="email"
                                  placeholder="john@example.com"
                                  className="pl-12 h-13 bg-zinc-50/50 border-zinc-200/80 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all rounded-2xl font-semibold placeholder:text-zinc-300 group-hover/input:bg-white"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-[10px] uppercase font-bold tracking-tight" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[11px] uppercase tracking-[0.1em] text-zinc-400 font-black flex items-center gap-2">
                            <Key className="w-3.5 h-3.5 text-indigo-500" />{" "}
                            Secure Password *
                          </FormLabel>
                          <FormControl>
                            <div className="relative group/input">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within/input:text-indigo-500 transition-colors" />
                              <Input
                                type="password"
                                placeholder="••••••••"
                                className="pl-12 h-13 bg-zinc-50/50 border-zinc-200/80 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all rounded-2xl font-semibold placeholder:text-zinc-300 group-hover/input:bg-white"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-bold tracking-tight" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </form>
            </div>

            {/* Sidebar Columns */}
            <div className="lg:col-span-3 space-y-8">
              {/* Access Control */}
              <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-sm overflow-hidden rounded-3xl group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 transform transition-transform group-hover:scale-y-110" />
                <CardHeader className="border-b border-zinc-100/80 pb-4">
                  <div className="flex items-center gap-3 text-zinc-900">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">
                        Access Control
                      </CardTitle>
                      <p className="text-xs text-zinc-500 font-medium">
                        Permissions and system status
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-8 text-zinc-900">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-3 font-medium">
                        <FormLabel className="text-[11px] uppercase tracking-[0.1em] text-zinc-400 font-black">
                          System Role
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-13 bg-zinc-50/50 border-zinc-200/80 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all rounded-2xl font-semibold">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl border-zinc-200 shadow-xl">
                            <SelectItem
                              value="USER"
                              className="focus:bg-blue-50 rounded-xl my-1 mx-1 transition-colors"
                            >
                              <span className="font-bold text-sm text-zinc-900">
                                Standard User
                              </span>
                            </SelectItem>
                            <SelectItem
                              value="ADMIN"
                              className="focus:bg-blue-50 rounded-xl my-1 mx-1 transition-colors"
                            >
                              <span className="font-bold text-sm text-zinc-900">
                                Administrator
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px] uppercase font-bold tracking-tight" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="space-y-3 font-medium">
                        <FormLabel className="text-[11px] uppercase tracking-[0.1em] text-zinc-400 font-black">
                          Account Status
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-13 bg-zinc-50/50 border-zinc-200/80 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all rounded-2xl font-semibold">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl border-zinc-200 shadow-xl">
                            <SelectItem
                              value="ACTIVE"
                              className="focus:bg-green-50 rounded-xl my-1 mx-1 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Activity className="w-3 h-3 text-green-600" />
                                <span className="font-bold text-sm text-zinc-900">
                                  Active
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="INACTIVE"
                              className="focus:bg-red-50 rounded-xl my-1 mx-1 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Activity className="w-3 h-3 text-red-600" />
                                <span className="font-bold text-sm text-zinc-900">
                                  Deactivated
                                </span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px] uppercase font-bold tracking-tight" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isVerified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-[1.5rem] border border-zinc-200/80 p-5 bg-zinc-50/50 dark:bg-zinc-900/50 transition-all hover:bg-white group/check">
                        <div className="space-y-1">
                          <FormLabel className="text-sm font-bold tracking-tight text-zinc-900 flex items-center gap-2">
                            <BadgeCheck className="w-4 h-4 text-indigo-500 group-hover/check:scale-110 transition-transform" />
                            Verify Identity
                          </FormLabel>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">
                            Skip email verification process
                          </p>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="w-6 h-6 rounded-lg border-2 border-zinc-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 transition-all"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Security Protocol Block */}
              {/* <div className="relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br from-zinc-900 to-zinc-800 text-zinc-50 shadow-2xl border border-white/5 group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full -ml-16 -mb-16 blur-3xl" />

                <div className="relative flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                    <BadgeInfo className="w-7 h-7 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">
                      Security Protocol
                    </h3>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold text-zinc-400">
                      Network Policy
                    </p>
                  </div>
                </div>

                <ul className="relative space-y-4">
                  {[
                    {
                      label: "Storage",
                      text: "Passwords must be encrypted before storage.",
                      color: "bg-indigo-500",
                    },
                    {
                      label: "Audit",
                      text: "Admins have full access to audit trails.",
                      color: "bg-blue-500",
                    },
                    {
                      label: "Auth",
                      text: "Multi-factor auth is recommended after login.",
                      color: "bg-amber-500",
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 group/li">
                      <div
                        className={`mt-1.5 w-1.5 h-1.5 rounded-full ${item.color} shadow-[0_0_8px_rgba(0,0,0,0.5)] shrink-0 group-hover/li:scale-150 transition-transform`}
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-black tracking-tighter text-zinc-500 group-hover/li:text-zinc-400 transition-colors">
                          SYSTEM {item.label}
                        </span>
                        <p className="text-[13px] text-zinc-300 font-semibold leading-snug">
                          {item.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div> */}
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
