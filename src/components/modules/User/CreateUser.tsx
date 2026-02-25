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
  CheckCircle,
  UserPlus,
  Loader2,
} from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-2 px-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-2 shadow-md">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
            Create New User
          </h1>
          <p className="text-gray-500 text-xs">Add a new user to the system</p>
        </div>

        <div className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-4 lg:p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Basic Information Section */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h2 className="text-sm font-medium text-gray-900">
                      Basic Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-gray-700 flex items-center gap-2">
                            <User className="w-3.5 h-3.5" />
                            Full Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter full name"
                              className="h-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-gray-700 flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" />
                            Email Address *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter email address"
                              className="h-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Password */}
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-gray-700 flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5" />
                            Password *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter password"
                              className="h-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Account Settings Section */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-md flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h2 className="text-sm font-medium text-gray-900">
                      Account Settings
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Role */}
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-gray-700 flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5" />
                            User Role *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USER">User</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Status */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-gray-700 flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Account Status *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* isVerified */}
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="isVerified"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-gray-300"
                            />
                          </FormControl>
                          <FormLabel className="text-xs font-medium text-gray-700">
                            Mark as verified user
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
                  >
                    {form.formState.isSubmitting && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Create User
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
