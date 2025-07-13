import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getClassroomsById } from "@/app/actions/classrooms";
import PageLoader from "@/components/shared/page-loader";
import { ClassroomStatusCards } from '@/features/classroom-home/components/classroom-status-cards';
import { ConsecutiveAbsencesTable } from '@/features/classroom-home/components/consecutive-absences-table';
import { ConsecutivePendenciesTable } from '@/features/classroom-home/components/consecutive-pendencies-table';

interface ClassroomHomePageProps {
    params: Promise<{ classroom_id: string }>;
}

export default async function ClassroomHomePage({ params }: ClassroomHomePageProps) {
    const { classroom_id } = await params;

    const classroom = await getClassroomsById(classroom_id);

    if (!classroom) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <Suspense fallback={<PageLoader />}>
                <div className="space-y-8">
                    <ClassroomStatusCards classroomId={classroom_id} />

                    <div className="space-y-8">
                        <ConsecutiveAbsencesTable classroomId={classroom_id} />
                        <ConsecutivePendenciesTable classroomId={classroom_id} />
                    </div>
                </div>
            </Suspense>
        </div>
    );
}
