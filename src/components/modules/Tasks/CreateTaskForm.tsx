"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList, Database } from "lucide-react";
import { User } from "@/types";
import { useSession } from "next-auth/react";

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
  const [users, setUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/v1/user");
        if (res.ok) {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : data?.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

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
      console.log(payload);
      const res = await fetch("http://localhost:5001/api/v1/task", {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-2 px-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-2 shadow-md">
            <ClipboardList className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-0.5">
            Create Task
          </h1>
          <p className="text-gray-500 text-xs">
            Assign a new task to a team member
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                  <Database className="w-3 h-3 text-white" />
                </div>
                <h2 className="text-xs font-medium text-gray-900">
                  Task Information
                </h2>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("title")}
                    placeholder="Enter task title"
                    className="h-8 text-xs"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    {...register("description")}
                    placeholder="Enter task description (optional)"
                    className="text-xs resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Target Value */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">
                      Target Value <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register("targetValue")}
                      type="number"
                      min={1}
                      placeholder="e.g. 100"
                      className="h-8 text-xs"
                    />
                    {errors.targetValue && (
                      <p className="text-xs text-red-500">
                        {errors.targetValue.message}
                      </p>
                    )}
                  </div>

                  {/* Assign To */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">
                      Assign To <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(val) => setValue("assignedToId", val)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem
                            key={user.id}
                            value={user.id.toString()}
                            className="text-xs"
                          >
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.assignedToId && (
                      <p className="text-xs text-red-500">
                        {errors.assignedToId.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-8 text-xs"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 h-8 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {submitting ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
