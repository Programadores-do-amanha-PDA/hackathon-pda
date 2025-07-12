"use client";

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
import { ChevronDown, Eye } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
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

interface ColumnGroup {
    id: string;
    label: string | null; // null means it's an individual column that spans 2 rows
    colspan: number;
    columns: string[];
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    // Function to determine column groups
    const getColumnGroups = (columns: ColumnDef<TData, TValue>[]): ColumnGroup[] => {
        const groups: ColumnGroup[] = [];
        let currentGroup: ColumnGroup | null = null;

        columns.forEach((column) => {
            const columnId = column.id || (column as ColumnDef<TData, TValue> & { accessorKey?: string }).accessorKey;

            // Check if this column belongs to a group
            if (columnId?.startsWith('presence.')) {
                if (!currentGroup || currentGroup.id !== 'presence') {
                    currentGroup = {
                        id: 'presence',
                        label: 'Presença',
                        colspan: 0,
                        columns: []
                    };
                    groups.push(currentGroup);
                }
                currentGroup.colspan++;
                currentGroup.columns.push(columnId);
            } else if (columnId?.startsWith('coodesh-')) {
                if (!currentGroup || currentGroup.id !== 'coodesh') {
                    currentGroup = {
                        id: 'coodesh',
                        label: 'Coodesh',
                        colspan: 0,
                        columns: []
                    };
                    groups.push(currentGroup);
                }
                currentGroup.colspan++;
                currentGroup.columns.push(columnId);
            } else if (columnId?.startsWith('project-')) {
                if (!currentGroup || currentGroup.id !== 'projects') {
                    currentGroup = {
                        id: 'projects',
                        label: 'Projetos',
                        colspan: 0,
                        columns: []
                    };
                    groups.push(currentGroup);
                }
                currentGroup.colspan++;
                currentGroup.columns.push(columnId);
            } else {
                // Individual column (not grouped) - will span 2 rows
                groups.push({
                    id: columnId || `column-${groups.length}`,
                    label: null, // null means it's an individual column
                    colspan: 1,
                    columns: [columnId || `column-${groups.length}`]
                });
                currentGroup = null;
            }
        });

        return groups;
    };

    const columnGroups = getColumnGroups(columns);

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
        initialState: {
            pagination: {
                pageSize: 50,
            },
        },
    });

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-2">
                    <Input
                        placeholder="Procurando por alguém?"
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("name")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm h-10"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto h-10">
                            <Eye className="mr-2 h-4 w-4" />
                            Visualização
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel>Colunas</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                        useEyeIcon
                                    >
                                        {getColumnDisplayName(column.id)}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        {/* Group headers row */}
                        <TableRow className="border-b-2 border-gray-300 bg-gray-50">
                            {columnGroups.map((group) => (
                                <TableHead
                                    key={group.id}
                                    colSpan={group.colspan}
                                    rowSpan={group.label === null ? 2 : 1} // Individual columns span 2 rows
                                    className={`px-4 text-sm font-semibold border-r border-gray-200 last:border-r-0 min-w-[120px] ${group.label === null
                                        ? 'h-22 bg-gray-50 text-gray-500 font-medium' // Individual column styling
                                        : 'h-10 bg-gray-50 text-gray-500' // Group header styling
                                        }`}
                                >
                                    {group.label ? (
                                        <div className="text-start font-medium ">
                                            {group.label}
                                        </div>
                                    ) : (
                                        // Render individual column header directly
                                        <div className="font-medium text-gray-500 flex items-center justify-between w-full">
                                            {(() => {
                                                const header = table.getHeaderGroups()[0]?.headers.find(h => h.id === group.columns[0]);
                                                if (!header || header.isPlaceholder) return null;
                                                return flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                );
                                            })()}
                                        </div>
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                        {/* Individual column headers row - only for grouped columns */}
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-b-2 border-gray-300">
                                {headerGroup.headers.map((header) => {
                                    // Skip rendering if this column is individual (already rendered in first row)
                                    const isIndividualColumn = columnGroups.some(group =>
                                        group.label === null && group.columns.includes(header.id)
                                    );

                                    if (isIndividualColumn) {
                                        return null;
                                    }

                                    return (
                                        <TableHead
                                            key={header.id}
                                            className="h-12 px-4 text-center text-sm font-medium text-gray-500 bg-gray-50 border-r border-gray-200 last:border-r-0 min-w-[120px]"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
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
                                    className="border-b border-gray-200 hover:bg-gray-50/50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="px-4 py-3 text-sm text-gray-900 border-r border-gray-100 last:border-r-0 min-w-[120px]"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-gray-500 px-4 py-3"
                                >
                                    Nenhum resultado encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex-1 text-sm text-gray-600">
                    Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{" "}
                    {Math.min(
                        (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                        table.getFilteredRowModel().rows.length
                    )}{" "}
                    de {table.getFilteredRowModel().rows.length} estudante(s)
                </div>
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-700">
                        Página {table.getState().pagination.pageIndex + 1} de{" "}
                        {table.getPageCount()}
                    </p>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                            className="h-8 px-3"
                        >
                            Primeira
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="h-8 px-3"
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="h-8 px-3"
                        >
                            Próxima
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                            className="h-8 px-3"
                        >
                            Última
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getColumnDisplayName(columnId: string): string {
    const displayNames: Record<string, string> = {
        name: "Nome",
        email: "Email",
        number: "Número",
        "presence.general": "Presença Geral",
        "presence.programming": "Programação",
        "presence.english": "Inglês",
        "presence.softSkills": "Soft Skills",
    };

    if (displayNames[columnId]) {
        return displayNames[columnId];
    }

    if (columnId.startsWith("coodesh-")) {
        return "Teste Coodesh";
    }

    if (columnId.startsWith("project-")) {
        return "Projeto";
    }

    return columnId;
}
