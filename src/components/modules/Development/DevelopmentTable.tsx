"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DevelopmentSample } from "@/types";
import { cn } from "@/lib/utils";

interface DevelopmentTableProps {
  data: DevelopmentSample[];
  onEdit?: (item: DevelopmentSample) => void;
  onView?: (item: DevelopmentSample) => void;
  onDelete?: (item: DevelopmentSample) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DevelopmentTable({
  data,
  onEdit,
  onView,
  onDelete,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: DevelopmentTableProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const columns = React.useMemo<ColumnDef<DevelopmentSample>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                onClick={() => onView?.(item)}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={() => onEdit?.(item)}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete?.(item)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
      },
      {
        accessorKey: "style",
        header: "Style",
        cell: ({ row }) => (
          <div className="font-medium text-zinc-900 dark:text-zinc-100 italic">
            {row.getValue("style")}
          </div>
        ),
      },
      {
        accessorKey: "styleName",
        header: "Style Name",
        cell: ({ row }) => (
          <div className="text-sm text-zinc-700 dark:text-zinc-300">
            {row.getValue("styleName") || "---"}
          </div>
        ),
      },
      {
        accessorKey: "buyer",
        header: "Buyer",
        cell: ({ row }) => {
          const buyer = row.original.buyer;
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {buyer?.name || "N/A"}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                {row.original.brand || "Standard"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "factory",
        header: "Factory",
        cell: ({ row }) => (
          <div className="text-sm">{row.original.factory?.name || "N/A"}</div>
        ),
      },
      {
        accessorKey: "seasonName",
        header: "Season",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
            {row.getValue("seasonName")} {row.original.seasonYear}
          </div>
        ),
      },
      {
        accessorKey: "color",
        header: "Color",
        cell: ({ row }) => (
          <div className="text-sm">{row.getValue("color") || "---"}</div>
        ),
      },
      {
        accessorKey: "sizes",
        header: "Sizes",
        cell: ({ row }) => (
          <div className="text-sm">{row.getValue("sizes") || "---"}</div>
        ),
      },
      {
        accessorKey: "fabricQuality",
        header: "Fabric Quality",
        cell: ({ row }) => {
          const quality = row.getValue("fabricQuality") as string;
          return (
            <div
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                quality === "AVAILABLE"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : quality === "ACTUAL"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
              )}
            >
              {quality}
            </div>
          );
        },
      },
      {
        accessorKey: "smsStatus",
        header: "SMS Status",
        cell: ({ row }) => {
          const status = row.getValue("smsStatus") as string;
          return (
            <div
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset",
                status === "APPROVED"
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                  : status === "SUBMITTED"
                    ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                    : status === "DROPPED"
                      ? "bg-red-50 text-red-700 ring-red-600/20"
                      : "bg-amber-50 text-amber-700 ring-amber-600/20",
              )}
            >
              {status}
            </div>
          );
        },
      },
      {
        accessorKey: "smsDeadline",
        header: "SMS Deadline",
        cell: ({ row }) => {
          const date = row.getValue("smsDeadline") as string;
          if (!date) return <span className="text-zinc-400">---</span>;
          return <div className="text-xs font-medium">{formatDate(date)}</div>;
        },
      },
      {
        accessorKey: "tpReceiveDate",
        header: "TP Receive",
        cell: ({ row }) => {
          const date = row.getValue("tpReceiveDate") as string;
          if (!date) return <span className="text-zinc-400">---</span>;
          return <div className="text-xs">{formatDate(date)}</div>;
        },
      },
      {
        accessorKey: "originalSwatchDate",
        header: "Original Swatch",
        cell: ({ row }) => {
          const date = row.getValue("originalSwatchDate") as string;
          if (!date) return <span className="text-zinc-400">---</span>;
          return <div className="text-xs">{formatDate(date)}</div>;
        },
      },
      {
        accessorKey: "originalSampleDate",
        header: "Original Sample",
        cell: ({ row }) => {
          const date = row.getValue("originalSampleDate") as string;
          if (!date) return <span className="text-zinc-400">---</span>;
          return <div className="text-xs">{formatDate(date)}</div>;
        },
      },
      {
        accessorKey: "labdipReceiveDate",
        header: "Labdip Receive",
        cell: ({ row }) => {
          const date = row.getValue("labdipReceiveDate") as string;
          if (!date) return <span className="text-zinc-400">---</span>;
          return <div className="text-xs">{formatDate(date)}</div>;
        },
      },
      {
        accessorKey: "labApprovalDate",
        header: "Lab Approval",
        cell: ({ row }) => {
          const date = row.getValue("labApprovalDate") as string;
          if (!date) return <span className="text-zinc-400">---</span>;
          return <div className="text-xs">{formatDate(date)}</div>;
        },
      },
      {
        accessorKey: "printEmbStrikeOff",
        header: "Print/Emb Strike Off",
        cell: ({ row }) => {
          const date = row.getValue("printEmbStrikeOff") as string;
          if (!date) return <span className="text-zinc-400">---</span>;
          return <div className="text-xs">{formatDate(date)}</div>;
        },
      },
      {
        accessorKey: "smsSubmissionDate",
        header: "SMS Submission",
        cell: ({ row }) => {
          const date = row.getValue("smsSubmissionDate") as string;
          if (!date) return <span className="text-zinc-400">---</span>;
          return <div className="text-xs">{formatDate(date)}</div>;
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div
            className="text-xs max-w-[200px] truncate"
            title={row.getValue("description") as string}
          >
            {row.getValue("description") || "---"}
          </div>
        ),
      },
      {
        accessorKey: "composition",
        header: "Composition",
        cell: ({ row }) => (
          <div
            className="text-xs max-w-[150px] truncate"
            title={row.getValue("composition") as string}
          >
            {row.getValue("composition") || "---"}
          </div>
        ),
      },
      {
        accessorKey: "userRemarks",
        header: "User Remarks",
        cell: ({ row }) => (
          <div
            className="text-xs max-w-[150px] truncate"
            title={row.getValue("userRemarks") as string}
          >
            {row.getValue("userRemarks") || "---"}
          </div>
        ),
      },
      {
        accessorKey: "managementRemarks",
        header: "Management Remarks",
        cell: ({ row }) => (
          <div
            className="text-xs max-w-[150px] truncate"
            title={row.getValue("managementRemarks") as string}
          >
            {row.getValue("managementRemarks") || "---"}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
          const date = row.getValue("createdAt") as string;
          return (
            <div className="text-xs text-zinc-500">{formatDate(date)}</div>
          );
        },
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => {
          const date = row.getValue("updatedAt") as string;
          return (
            <div className="text-xs text-zinc-500">{formatDate(date)}</div>
          );
        },
      },
    ],
    [onEdit, onView, onDelete],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[2000px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-zinc-50/50 dark:bg-zinc-800/50"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-xs font-bold uppercase tracking-wider h-12 whitespace-nowrap"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/80 border-b border-zinc-100 dark:border-zinc-800 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-3 px-4 whitespace-nowrap"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-zinc-500 dark:text-zinc-400 italic"
                  >
                    No development samples found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modern Pagination Bar */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Showing page{" "}
          <span className="text-zinc-900 dark:text-zinc-100">
            {currentPage}
          </span>{" "}
          of{" "}
          <span className="text-zinc-900 dark:text-zinc-100">{totalPages}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-9 px-4 rounded-xl font-bold bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:scale-105"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-1.5 mx-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum = i + 1;
              if (currentPage > 3 && totalPages > 5) {
                pageNum = currentPage - 2 + i;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              }
              if (pageNum < 1) return null;
              if (pageNum > totalPages) return null;

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange?.(pageNum)}
                  className={cn(
                    "h-9 w-9 rounded-xl font-bold transition-all hover:scale-110",
                    currentPage === pageNum
                      ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800",
                  )}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-9 px-4 rounded-xl font-bold bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:scale-105"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
