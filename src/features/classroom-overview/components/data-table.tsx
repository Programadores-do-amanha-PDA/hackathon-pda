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
import { useMemo, useState } from "react";

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
    columnHeaders?: { [key: string]: string }; // Map of column id to header name
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

// Function to determine column groups
function getColumnGroups(
    columns: Array<{ id: string; columnDef?: { accessorKey?: string; header?: unknown } }>
): ColumnGroup[] {
    const groups: ColumnGroup[] = [];
    let currentGroup: ColumnGroup | null = null;

    // Process all columns, visibility will be handled in rendering
    columns.forEach((column) => {
        const columnId = column.id;
        const accessorKey = column.columnDef?.accessorKey;
        const headerName = typeof column.columnDef?.header === 'string' ? column.columnDef.header : columnId;

        // Check if this column belongs to a group based on accessorKey
        if (accessorKey?.startsWith('presence.')) {
            if (!currentGroup || currentGroup.id !== 'presence') {
                currentGroup = {
                    id: 'presence',
                    label: 'Presença',
                    colspan: 0,
                    columns: [],
                    columnHeaders: {}
                };
                groups.push(currentGroup);
            }
            currentGroup.colspan++;
            currentGroup.columns.push(columnId);
            if (currentGroup.columnHeaders && headerName) {
                currentGroup.columnHeaders[columnId] = headerName;
            }
        } else if (columnId?.startsWith('coodesh-')) {
            if (!currentGroup || currentGroup.id !== 'coodesh') {
                currentGroup = {
                    id: 'coodesh',
                    label: 'Coodesh',
                    colspan: 0,
                    columns: [],
                    columnHeaders: {}
                };
                groups.push(currentGroup);
            }
            currentGroup.colspan++;
            currentGroup.columns.push(columnId);
            if (currentGroup.columnHeaders && headerName) {
                currentGroup.columnHeaders[columnId] = headerName;
            }
        } else if (columnId?.startsWith('project-')) {
            if (!currentGroup || currentGroup.id !== 'projects') {
                currentGroup = {
                    id: 'projects',
                    label: 'Projetos',
                    colspan: 0,
                    columns: [],
                    columnHeaders: {}
                };
                groups.push(currentGroup);
            }
            currentGroup.colspan++;
            currentGroup.columns.push(columnId);
            if (currentGroup.columnHeaders && headerName) {
                currentGroup.columnHeaders[columnId] = headerName;
            }
        } else {
            // Individual column (not grouped) - will span 2 rows
            groups.push({
                id: columnId || `column-${groups.length}`,
                label: null, // null means it's an individual column
                colspan: 1,
                columns: [columnId || `column-${groups.length}`],
                columnHeaders: { [columnId || `column-${groups.length}`]: headerName || columnId || `column-${groups.length}` }
            });
            currentGroup = null;
        }
    });

    return groups;
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

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
                pageSize: 10,
            },
        },
    });

    const allColumns = table.getAllColumns();
    const columnGroups = useMemo(() => {
        return getColumnGroups(allColumns as Array<{ id: string; columnDef?: { accessorKey?: string; header?: unknown } }>);
    }, [allColumns]); // Use actual table columns to get correct IDs

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
                                const getColumnDisplayName = (col: typeof column) => {
                                    const header = table.getHeaderGroups()[0]?.headers.find(h => h.id === col.id);
                                    if (!header || !header.column.columnDef.header) return col.id;

                                    const headerDef = header.column.columnDef.header;

                                    // If header is a function that returns JSX with SortableHeader
                                    if (typeof headerDef === 'function') {
                                        try {
                                            const result = headerDef(header.getContext());
                                            // Check if it's a SortableHeader component with children
                                            if (result && typeof result === 'object' && 'props' in result && result.props.children) {
                                                return result.props.children;
                                            }
                                        } catch {
                                            // If function execution fails, fallback to column id
                                            return col.id;
                                        }
                                    }

                                    // If header is a string, return it directly
                                    if (typeof headerDef === 'string') {
                                        return headerDef;
                                    }

                                    // Fallback to column id
                                    return col.id;
                                };

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
                                        {getColumnDisplayName(column)}
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
                            {columnGroups
                                .filter((group) => {
                                    // Filter out groups that have no visible columns
                                    return group.columns.some(columnId => {
                                        const tableColumn = table.getColumn(columnId);
                                        return tableColumn?.getIsVisible() ?? true;
                                    });
                                })
                                .map((group) => {
                                    // Calculate actual visible colspan
                                    const visibleColspan = group.columns.filter(columnId => {
                                        const tableColumn = table.getColumn(columnId);
                                        return tableColumn?.getIsVisible() ?? true;
                                    }).length;

                                    return (
                                        <TableHead
                                            key={group.id}
                                            colSpan={visibleColspan}
                                            rowSpan={group.label === null ? 2 : 1} // Individual columns span 2 rows
                                            className={`px-4 text-sm font-semibold border-r border-gray-200 last:border-r-0 min-w-[120px] ${group.label === null
                                                ? 'h-22 bg-gray-50 text-gray-500 font-medium' // Individual column styling
                                                : 'h-10 bg-gray-50 text-gray-500' // Group header styling
                                                }`}
                                        >
                                            {group.label ? (
                                                <div className="text-start font-medium">
                                                    {group.label}
                                                </div>
                                            ) : (
                                                <div className="font-medium text-gray-500 flex items-center justify-between w-full">
                                                    {(() => {
                                                        const header = table.getHeaderGroups()[0]?.headers.find(h =>
                                                            h.id === group.columns[0] && h.column.getIsVisible()
                                                        );
                                                        if (!header || header.isPlaceholder) return null;
                                                        return flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </TableHead>
                                    );
                                })}
                        </TableRow>
                        {/* Individual column headers row - only for grouped columns */}
                        <TableRow className="border-b-2 border-gray-300">
                            {table.getHeaderGroups()[0]?.headers
                                .filter(header => header.column.getIsVisible())
                                .map((header) => {
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
