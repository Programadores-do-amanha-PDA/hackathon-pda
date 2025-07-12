"use client";

import { ColumnDef } from "@tanstack/react-table";
import { StudentOverview, ClassroomOverviewData } from "@/types/classroom-overview";
import { ReactNode } from "react";
import { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface SortableHeaderProps<TData, TValue> {
    column: Column<TData, TValue>;
    children: ReactNode;
    className?: string;
}

const formatPercentage = (value: number) => `${value}%`;
const formatGrade = (value: number) => value.toFixed(1);

function SortableHeader<TData, TValue>({
    column,
    children,
}: SortableHeaderProps<TData, TValue>) {
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className={"w-full h-auto p-0 has-[>svg]:px-0 font-medium justify-between hover:bg-transparent"}
        >
            <div className="flex justify-between items-center w-full">
                {children}
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
        </Button>
    );
}


export const createColumns = (data: ClassroomOverviewData): ColumnDef<StudentOverview>[] => {
    const baseColumns: ColumnDef<StudentOverview>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <SortableHeader column={column}>
                    Nome
                </SortableHeader>
            ),
            cell: ({ row }) => (
                <div >{row.getValue("name")}</div>
            ),
        },
        {
            accessorKey: "email",
            header: ({ column }) => (
                <SortableHeader column={column}>
                    Email
                </SortableHeader>
            ),
            cell: ({ row }) => (
                <div >{row.getValue("email")}</div>
            ),
        },
        {
            accessorKey: "number",
            header: ({ column }) => (
                <SortableHeader column={column}>
                    Número
                </SortableHeader>
            ),
            cell: ({ row }) => (
                <div >{row.getValue("number")}</div>
            ),
        },
        {
            accessorKey: "presence.general",
            header: ({ column }) => (
                <div className="text-center">
                    <SortableHeader column={column}>
                        Geral
                    </SortableHeader>
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center font-medium">
                    {formatPercentage(row.original.presence.general)}
                </div>
            ),
        },
        {
            accessorKey: "presence.programming",
            header: ({ column }) => (
                <div className="text-center">
                    <SortableHeader column={column}>
                        Programação
                    </SortableHeader>
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center font-medium">
                    {formatPercentage(row.original.presence.programming)}
                </div>
            ),
        },
        {
            accessorKey: "presence.english",
            header: ({ column }) => (
                <div className="text-center">
                    <SortableHeader column={column}>
                        Inglês
                    </SortableHeader>
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center font-medium">
                    {formatPercentage(row.original.presence.english)}
                </div>
            ),
        },
        {
            accessorKey: "presence.softSkills",
            header: ({ column }) => (
                <div className="text-center">
                    <SortableHeader column={column}>
                        Soft Skills
                    </SortableHeader>
                </div>
            ),
            cell: ({ row }) => (
                <div className="text-center font-medium">
                    {formatPercentage(row.original.presence.softSkills)}
                </div>
            ),
        },
    ];

    // Adicionar colunas dinâmicas dos testes Coodesh
    const coodeshColumns: ColumnDef<StudentOverview>[] = data.coodeshTests.map((test) => ({
        id: `coodesh-${test.id}`,
        accessorFn: (row) => row.coodesh[test.id],
        header: ({ column }) => (
            <div className="text-center">
                <SortableHeader column={column}>
                    {test.name.replace('Teste ', '')}
                </SortableHeader>
            </div>
        ),
        cell: ({ row }) => {
            const value = row.original.coodesh[test.id];
            return (
                <div className="text-center font-medium">
                    {value ? formatPercentage(value) : '-'}
                </div>
            );
        },
    }));

    // Adicionar colunas dinâmicas dos projetos
    const projectColumns: ColumnDef<StudentOverview>[] = data.projects.map((project) => ({
        id: `project-${project.id}`,
        accessorFn: (row) => row.projects[project.id],
        header: ({ column }) => (
            <div className="text-center">
                <SortableHeader column={column}>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-sm">
                            {project.name}
                        </span>
                    </div>
                </SortableHeader>
            </div>
        ),
        cell: ({ row }) => {
            const value = row.original.projects[project.id];
            return (
                <div className="text-center font-medium">
                    {value ? formatGrade(value) : '-'}
                </div>
            );
        },
    }));

    return [...baseColumns, ...coodeshColumns, ...projectColumns];
};

