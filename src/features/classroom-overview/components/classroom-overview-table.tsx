"use client";

import { ClassroomOverviewData } from "@/types/classroom-overview";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";

interface ClassroomOverviewTableProps {
    data: ClassroomOverviewData;
}

export function ClassroomOverviewTable({ data }: ClassroomOverviewTableProps) {
    const columns = createColumns(data);

    return (
        <div className="space-y-4">
            <DataTable columns={columns} data={data.students} />
        </div>
    );
}
