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
  MoreHorizontal,
  Database,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Contact } from "@/types";

interface ContactTableProps {
  data: Contact[];
  onEdit?: (contact: Contact) => void;
  onView?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function ContactTable({
  data,
  onEdit,
  onView,
  onDelete,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: ContactTableProps) {
  const columns = React.useMemo<ColumnDef<Contact>[]>(
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
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="lowercase">{row.getValue("email")}</div>
        ),
      },
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("company")}</div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const statusColors = {
            NEW: "bg-blue-100 text-blue-800",
            CONTACTED: "bg-yellow-100 text-yellow-800",
            RESPONDED: "bg-green-100 text-green-800",
            QUALIFIED: "bg-purple-100 text-purple-800",
            NEGOTIATING: "bg-orange-100 text-orange-800",
            CLOSED_WON: "bg-emerald-100 text-emerald-800",
            CLOSED_LOST: "bg-red-100 text-red-800",
          };

          return (
            <div
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium capitalize ${statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}
            >
              {status.replace("_", " ").toLowerCase()}
            </div>
          );
        },
      },
      {
        accessorKey: "country",
        header: "Country",
        cell: ({ row }) => {
          const country = row.getValue("country") as
            | { name: string }
            | undefined;
          return <div className="capitalize">{country?.name || "-"}</div>;
        },
      },
      {
        accessorKey: "note",
        header: "Notes",
        cell: ({ row }) => {
          const note = row.getValue("note") as string;
          return (
            <div className="max-w-32 truncate text-gray-600" title={note}>
              {note || "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "author",
        header: "Created By",
        cell: ({ row }) => {
          const author = row.getValue("author") as { name: string } | undefined;
          return <div className="capitalize">{author?.name || "-"}</div>;
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return <div>{date.toLocaleDateString()}</div>;
        },
      },
      {
        accessorKey: "updatedAt",
        header: "Updated At",
        cell: ({ row }) => {
          const date = new Date(row.getValue("updatedAt"));
          return <div>{date.toLocaleDateString()}</div>;
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const contact = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(contact.id.toString())
                  }
                >
                  Copy contact ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onView?.(contact)}>
                  View contact
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(contact)}>
                  Edit contact
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(contact)}>
                  Delete contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

  return (
    <div className="w-full">
      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
            <ArrowUpDown className="w-3 h-3 text-white" />
          </div>
          <h2 className="text-xs font-medium text-gray-900">Contacts</h2>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search emails..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="h-7 w-40 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
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
                    <p className="text-xs">No contacts found.</p>
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
          Page {currentPage} of {totalPages} ({data.length} contacts)
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
