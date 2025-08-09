import { getClassroomOverviewData } from "@/app/actions/classroom-overview";
import { ClassroomOverviewTable } from "@/features/classroom-overview/components/classroom-overview-table";

interface ClassroomAttendancePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ClassroomAttendancePage({ params }: ClassroomAttendancePageProps) {
    const { id } = await params;
    const data = await getClassroomOverviewData(id);

    return (
        <div className='flex flex-col gap-4 p-8'>
            <ClassroomOverviewTable data={data} />
        </div>
    );
}
