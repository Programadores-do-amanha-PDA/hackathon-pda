import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calendar, Users, NotebookIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
    getWeeklyAttendanceData,
    getWeeklyPendenciesData,
    getActiveProjectData
} from "@/app/actions/classrooms/home-dashboard";

interface ClassroomStatusCardsProps {
    classroomId: string;
}

interface StatusCardData {
    title: string;
    value: string;
    trend: {
        value: string;
        isPositive: boolean;
    };
    href: string;
    description?: string;
    isAlert?: boolean;
    hasIcon?: boolean;
}

export async function ClassroomStatusCards({ classroomId }: ClassroomStatusCardsProps) {
    const weeklyAttendance = await getWeeklyAttendanceData(classroomId);
    const weeklyPendencies = await getWeeklyPendenciesData(classroomId);
    const activeProject = await getActiveProjectData(classroomId);

    const cards: StatusCardData[] = [
        {
            title: "Presença Semanal",
            value: `${weeklyAttendance.percentage}%`,
            trend: {
                value: `${weeklyAttendance.trend > 0 ? '+' : ''}${weeklyAttendance.trend}%`,
                isPositive: weeklyAttendance.trend > 0,
            },
            href: `/dashboard/classroom/${classroomId}/attendance`,
            hasIcon: true,
        },
        {
            title: "Pendência Semanal",
            value: `${weeklyPendencies.percentage}%`,
            trend: {
                value: `${weeklyPendencies.trend > 0 ? '+' : ''}${weeklyPendencies.trend}%`,
                isPositive: weeklyPendencies.trend < 0, // Inverted: less pendencies is better
            },
            href: `/dashboard/classroom/${classroomId}/activities`,
            hasIcon: true,
        },
    ];

    if (activeProject) {
        cards.push({
            title: `Entregas [${activeProject.module}] ${activeProject.title}`,
            value: `${activeProject.deliveryPercentage}%`,
            trend: {
                value: `Faltam ${activeProject.pendingDeliveries} entregas`,
                isPositive: activeProject.pendingDeliveries === 0,
            },
            href: `/dashboard/classrooms/${classroomId}/projects/${activeProject.id}`,
            isAlert: activeProject.pendingDeliveries > 0,
        });
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card, index) => (
                <Link key={index} href={card.href} className="group">
                    <Card className={cn(
                        "transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer",
                        card.isAlert && "bg-yellow-50 border-yellow-200"
                    )}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-800">
                                {card.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {card.value}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        {card.hasIcon ? card.trend.isPositive ? (
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-red-600" />
                                        ) : null}
                                        <span className={cn(
                                            "text-sm font-medium",
                                            card.hasIcon ? card.trend.isPositive ? "text-green-600" : "text-red-600" : "text-yellow-600 font-semibold",
                                        )}>
                                            {card.trend.value}
                                        </span>
                                    </div>
                                </div>
                                <div className="opacity-60 group-hover:opacity-80">
                                    {card.title.includes("Presença") && <Users className="h-8 w-8" />}
                                    {card.title.includes("Pendência") && <Calendar className="h-8 w-8" />}
                                    {card.title.includes("Entregas") && <NotebookIcon className="h-8 w-8" />}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))
            }
        </div >
    );
}
