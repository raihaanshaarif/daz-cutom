"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  User,
  Calendar,
  Clock,
  Tag,
  Layers,
  FileText,
  Info,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Task } from "@/types";

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="py-3 px-4 border-b bg-gray-50/50">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
          <Icon className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-50">{children}</div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  icon: Icon,
  children,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: LucideIcon;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-center px-4 py-2.5 hover:bg-gray-50/30 transition-colors">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-gray-900 break-words">
        {children ?? value ?? <span className="text-gray-400">—</span>}
      </div>
    </div>
  );
}

export default function TaskDetails({ task }: TaskDetailsProps) {
  const fmt = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-lg shadow-md shadow-blue-200">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-none">
              Task {task.title}
            </h3>
            <div className="mt-2">
              {task.isActive ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 text-[10px] h-5 px-1.5 uppercase font-bold">
                  Active
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-gray-400 border-gray-200 text-[10px] h-5 px-1.5 uppercase font-bold"
                >
                  Inactive
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                Created on {fmt(task.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* Task Info */}
        <Section title="Task Information" icon={Info}>
          <Row label="ID" value={task.id} icon={Tag} />
          <Row label="Title" value={task.title} icon={Tag} />
          <Row label="Description" value={task.description} icon={FileText} />
          <Row label="Target Value" value={task.targetValue} icon={Layers} />
          <Row label="Assigned By" value={task.assignedBy?.name} icon={User} />
          <Row label="Assigned To" value={task.assignedTo?.name} icon={User} />
          <Row
            label="Is Active"
            value={task.isActive ? "Yes" : "No"}
            icon={Info}
          />
          <Row label="Created At" value={fmt(task.createdAt)} icon={Calendar} />
          <Row label="Updated At" value={fmt(task.updatedAt)} icon={Clock} />
        </Section>

        {/* Daily Logs */}
        <Section title="Daily Logs" icon={Layers}>
          {task.dailyLogs && task.dailyLogs.length > 0 ? (
            task.dailyLogs.map((log) => (
              <Row
                key={log.id}
                label={fmt(log.date)}
                value={`Achieved: ${log.achieved}, Target: ${log.targetValue}`}
                icon={Info}
              >
                <Badge
                  className={
                    log.status === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }
                >
                  {log.status}
                </Badge>
              </Row>
            ))
          ) : (
            <Row label="No Logs Available" value="—" />
          )}
        </Section>
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 pt-2">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Created: {fmt(task.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Updated: {fmt(task.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
