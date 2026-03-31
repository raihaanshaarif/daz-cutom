/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Database,
  Eye,
  Edit,
  Trash2,
  FileDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Commercial } from "@/types";

interface CommercialTableProps {
  data: Commercial[];
  onEdit?: (commercial: Commercial) => void;
  onView?: (commercial: Commercial) => void;
  onDelete?: (commercial: Commercial) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function CommercialTable({
  data,
  onEdit,
  onView,
  onDelete,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: CommercialTableProps) {
  const columns = React.useMemo<ColumnDef<Commercial>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
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
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => onView?.(item)}
                title="View"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={() => onEdit?.(item)}
                title="Edit"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete?.(item)}
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
      },
      {
        id: "buyerName",
        header: "Buyer Name",
        cell: ({ row }) => {
          // Get the first available buyer name from orders
          const orders = row.original.orders as any[];
          const buyerName =
            orders?.find((o) => o.order?.buyer?.name)?.order?.buyer?.name ||
            "-";
          return (
            <div
              className="capitalize text-blue-700 font-medium"
              title={buyerName}
            >
              {buyerName}
            </div>
          );
        },
        enableSorting: false,
        enableHiding: true,
      },
      {
        accessorKey: "bookingReference",
        header: "Booking Reference",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("bookingReference")}</div>
        ),
      },
      {
        accessorKey: "invoiceNo",
        header: "Invoice No",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("invoiceNo")}</div>
        ),
      },
      {
        accessorKey: "orders",
        header: "Order Numbers",
        cell: ({ row }) => {
          const orders = row.getValue("orders") as any[];
          const orderNumbers =
            orders
              ?.map((o) => o.order?.orderNumber)
              .filter(Boolean)
              .join(", ") || "-";
          return (
            <div
              className="max-w-32 truncate text-gray-600"
              title={orderNumbers}
            >
              {orderNumbers}
            </div>
          );
        },
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
          <div>{row.getValue("quantity")?.toLocaleString() ?? "0"}</div>
        ),
      },
      {
        accessorKey: "totalPrice",
        header: "Total Price",
        cell: ({ row }) => (
          <div>${row.getValue("totalPrice")?.toLocaleString() ?? "0"}</div>
        ),
      },
      {
        accessorKey: "bookingDate",
        header: "Booking Date",
        cell: ({ row }) => {
          const date = row.getValue("bookingDate") as string;
          return <div>{date ? new Date(date).toLocaleDateString() : "-"}</div>;
        },
      },
      {
        accessorKey: "handoverDate",
        header: "Handover Date",
        cell: ({ row }) => {
          const date = row.getValue("handoverDate") as string;
          return <div>{date ? new Date(date).toLocaleDateString() : "-"}</div>;
        },
      },
      {
        accessorKey: "etd",
        header: "ETD",
        cell: ({ row }) => {
          const date = row.getValue("etd") as string;
          return <div>{date ? new Date(date).toLocaleDateString() : "-"}</div>;
        },
      },
      {
        accessorKey: "eta",
        header: "ETA",
        cell: ({ row }) => {
          const date = row.getValue("eta") as string;
          return <div>{date ? new Date(date).toLocaleDateString() : "-"}</div>;
        },
      },
      {
        accessorKey: "documentStatus",
        header: "Document Status",
        cell: ({ row }) => {
          const status = row.getValue("documentStatus") as string;
          return (
            <div className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium capitalize bg-blue-100 text-blue-800">
              {status.replace("_", " ").toLowerCase()}
            </div>
          );
        },
      },
      {
        accessorKey: "lacAmount",
        header: "LAC Value",
        cell: ({ row }) => (
          <div>${row.getValue("lacAmount")?.toLocaleString() ?? "0"}</div>
        ),
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment Status",
        cell: ({ row }) => {
          const status = row.getValue("paymentStatus") as string;
          return (
            <div className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium capitalize bg-green-100 text-green-800">
              {status.replace("_", " ").toLowerCase()}
            </div>
          );
        },
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: ({ row }) => (
          <div>${row.getValue("balance")?.toLocaleString() ?? "0"}</div>
        ),
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => {
          const remarks = row.getValue("remarks") as string;
          return (
            <div className="max-w-32 truncate text-gray-600" title={remarks}>
              {remarks || "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
          const rawDate = row.getValue("createdAt") as string;
          if (!rawDate) return <div>-</div>;
          const date = new Date(rawDate);
          return (
            <div>{isNaN(date.getTime()) ? "-" : date.toLocaleDateString()}</div>
          );
        },
      },
    ],
    [onEdit, onView, onDelete],
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const exportToExcel = () => {
    // Get visible columns (exclude select and actions)
    const visibleColumns = table
      .getAllColumns()
      .filter(
        (col) =>
          col.getIsVisible() && col.id !== "select" && col.id !== "actions",
      );

    // Get headers
    const headers = visibleColumns.map((col) => col.id);

    // Get filtered rows
    const rows = table.getFilteredRowModel().rows.map((row) => {
      return visibleColumns.map((col) => {
        const value = row.getValue(col.id);
        // Handle null/undefined
        if (value === null || value === undefined) return "";
        // Format dates
        if (col.id.toLowerCase().includes("date") && value instanceof Date) {
          return value.toLocaleDateString();
        }
        // Handle objects (like nested buyer/factory)
        if (typeof value === "object") return JSON.stringify(value);
        // Escape quotes for CSV
        return String(value).replace(/"/g, '""');
      });
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `commercials_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
            <ArrowUpDown className="w-3 h-3 text-white" />
          </div>
          <h2 className="text-xs font-medium text-gray-900">Commercials</h2>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search booking reference..."
            value={
              (table
                .getColumn("bookingReference")
                ?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table
                .getColumn("bookingReference")
                ?.setFilterValue(event.target.value)
            }
            className="h-7 w-40 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
          <Input
            placeholder="Search invoice..."
            value={
              (table.getColumn("invoiceNo")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("invoiceNo")?.setFilterValue(event.target.value)
            }
            className="h-7 w-40 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            className="h-7 px-2 text-xs border-gray-200 hover:border-blue-500 mr-1.5"
          >
            <FileDown className="mr-1 h-3 w-3" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs border-gray-200 hover:border-blue-500"
              >
                Columns <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-xs"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-gray-200/50 h-8">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="h-8 px-3 text-xs font-medium text-gray-700 uppercase tracking-wide"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-gray-200/50 hover:bg-gray-50/50 h-9"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2 text-xs">
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
                  className="h-16 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Database className="w-6 h-6 text-gray-300" />
                    <p className="text-xs">No commercials found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-3">
        <div className="text-xs text-gray-500">
          Page {currentPage} of {totalPages} ({data.length} commercials)
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-6 px-2 text-xs border-gray-200 hover:border-blue-500"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-6 px-2 text-xs border-gray-200 hover:border-blue-500"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
