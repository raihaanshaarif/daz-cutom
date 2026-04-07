"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ClipboardList,
  Database,
  ArrowLeft,
  Zap,
  Target,
  UserPlus,
  FileText,
  BadgeInfo,
  Calendar,
} from "lucide-react";
import { User } from "@/types";
import { useSession } from "next-auth/react";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  targetValue: z.string().min(1, "Target value is required"),
  assignedToId: z.string().min(1, "Please select an assignee"),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function CreateTaskForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const { authFetch } = useAuthFetch();
  const [users, setUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      targetValue: "",
      assignedToId: "",
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/user`);
        if (res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : data?.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, [authFetch]);

  const onSubmit = async (data: TaskFormValues) => {
    setSubmitting(true);
    try {
      const assignedById = session?.user?.id;
      if (!assignedById) {
        toast.error("You must be logged in to create a task");
        setSubmitting(false);
        return;
      }
      const payload = {
        title: data.title,
        description: data.description,
        targetValue: Number(data.targetValue),
        assignedToId: Number(data.assignedToId),
        assignedById: Number(assignedById),
      };
      const res = await authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create task");

      toast.success("Task created successfully");
      router.push("/dashboard/admin/task/all-task");
    } catch (err) {
      toast.error("Failed to create task");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Modern Header Section */}
        <div className="sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 bg-zinc-50/80 backdrop-blur-md border-b border-zinc-200/50 gap-4 pt-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Create <span className="text-blue-600">Task</span>
            </h1>
            <p className="text-zinc-500 mt-1 flex items-center gap-2 text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Assign a new performance target or operational task to a team
              member
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
              form="create-task-form"
              disabled={submitting}
              className="h-10 px-8 bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-blue-500/50 rounded-xl gap-2"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-blue-100" />
                  <span>Assign Task</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
          {/* Main Details Section */}
          <div className="lg:col-span-4">
            <Form {...form}>
              <form
                id="create-task-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Task Identification */}
                <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-sm overflow-hidden rounded-3xl group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 transform transition-transform group-hover:scale-y-110" />
                  <CardHeader className="border-b border-zinc-100/80 pb-4">
                    <div className="flex items-center gap-3 text-zinc-900">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold">
                          Task Identification
                        </CardTitle>
                        <p className="text-xs text-zinc-500 font-medium">
                          Define the core objective and details
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-8 space-y-6 text-zinc-900">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[11px] uppercase tracking-[0.1em] text-zinc-400 font-black flex items-center gap-2">
                            <Target className="w-3.5 h-3.5 text-blue-500" />{" "}
                            Task Title *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Monthly Sales Growth Target"
                              className="h-13 bg-zinc-50/50 border-zinc-200/80 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all rounded-2xl font-semibold placeholder:text-zinc-300"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-bold tracking-tight" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[11px] uppercase tracking-[0.1em] text-zinc-400 font-black flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-blue-500" />{" "}
                            Description & Context
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Provide detailed instructions or success criteria..."
                              className="min-h-[160px] bg-zinc-50/50 border-zinc-200/80 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all resize-none p-5 rounded-2xl font-medium placeholder:text-zinc-300"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-bold tracking-tight" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Assignment & Target */}
                <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-sm overflow-hidden rounded-3xl group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 transform transition-transform group-hover:scale-y-110" />
                  <CardHeader className="border-b border-zinc-100/80 pb-4">
                    <div className="flex items-center gap-3 text-zinc-900">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold">
                          Assignment & Target
                        </CardTitle>
                        <p className="text-xs text-zinc-500 font-medium">
                          Set ownership and measurable goals
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-8 space-y-8 text-zinc-900">
                    <FormField
                      control={form.control}
                      name="assignedToId"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[11px] uppercase tracking-[0.1em] text-zinc-400 font-black flex items-center gap-2">
                            <UserPlus className="w-3.5 h-3.5 text-emerald-500" />{" "}
                            Assigned Employee *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-13 bg-zinc-50/50 border-zinc-200/80 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all rounded-2xl font-semibold">
                                <SelectValue placeholder="Select team member" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-zinc-200 shadow-xl">
                              {users.map((user) => (
                                <SelectItem
                                  key={user.id}
                                  value={user.id.toString()}
                                  className="focus:bg-emerald-50 rounded-xl my-1 mx-1 transition-colors"
                                >
                                  <span className="font-bold text-sm text-zinc-900">
                                    {user.name}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[10px] uppercase font-bold tracking-tight" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="targetValue"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-[11px] uppercase tracking-[0.1em] text-zinc-400 font-black flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-emerald-500" />{" "}
                            Target Numeric Value *
                          </FormLabel>
                          <FormControl>
                            <div className="relative group/input">
                              <Input
                                type="number"
                                min={1}
                                placeholder="0"
                                className="pl-11 h-13 bg-zinc-50/50 border-zinc-200/80 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all rounded-2xl font-mono font-bold placeholder:text-zinc-300 group-hover/input:bg-white"
                                {...field}
                              />
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/input:text-emerald-500 font-black">
                                #
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-[10px] uppercase font-bold tracking-tight" />
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight flex items-center gap-1.5 ml-1">
                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                            Numeric targets enable automated performance
                            tracking
                          </p>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </form>
            </Form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-8">
            {/* Creation Logic Card */}
            <div className="relative overflow-hidden p-8 rounded-[2rem] bg-gradient-to-br from-zinc-900 to-zinc-800 text-zinc-50 shadow-2xl border border-white/5 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full -ml-16 -mb-16 blur-3xl" />

              <div className="relative flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                  <BadgeInfo className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    Assignment Logic
                  </h3>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                    System Verified Guidelines
                  </p>
                </div>
              </div>

              <div className="relative space-y-6">
                <ul className="space-y-4">
                  {[
                    {
                      label: "Board",
                      text: "Tasks are globally tracked in the performance board.",
                      color: "bg-blue-500",
                    },
                    {
                      label: "Alert",
                      text: "Assignees will receive an immediate dashboard notification.",
                      color: "bg-emerald-500",
                    },
                    {
                      label: "Target",
                      text: "Target values must be greater than zero for validation.",
                      color: "bg-amber-500",
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 group/li">
                      <div
                        className={`mt-1.5 w-1.5 h-1.5 rounded-full ${item.color} shadow-[0_0_8px_rgba(0,0,0,0.5)] shrink-0 group-hover/li:scale-150 transition-transform`}
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-black tracking-tighter text-zinc-500 group-hover/li:text-zinc-400 transition-colors uppercase italic">
                          {item.label}
                        </span>
                        <p className="text-[13px] text-zinc-300 font-semibold leading-snug">
                          {item.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center font-black text-[10px] text-zinc-400 font-mono">
                        {(session?.user?.name || "AD")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-black tracking-widest text-zinc-500">
                          Authorized By
                        </span>
                        <span className="text-[11px] font-bold text-zinc-200">
                          {"System Administrator"}
                        </span>
                      </div>
                    </div>
                    <Calendar className="w-4 h-4 text-zinc-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
