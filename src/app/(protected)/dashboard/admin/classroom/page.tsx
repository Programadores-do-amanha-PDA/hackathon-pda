import { getAllClassrooms } from "@/app/actions/classrooms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ClassroomT } from "@/types/classrooms";

export default async function ClassroomsPage() {
    const classrooms = await getAllClassrooms();

    if (!classrooms || classrooms.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-600 mb-2">
                        Nenhuma turma encontrada
                    </h2>
                    <p className="text-gray-500">
                        Não há turmas disponíveis no momento.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classrooms.map((classroom: ClassroomT) => (
                    <Card key={classroom.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{classroom.name}</CardTitle>
                                <Badge
                                    variant={
                                        classroom.status === "active"
                                            ? "default"
                                            : classroom.status === "finished"
                                                ? "secondary"
                                                : "outline"
                                    }
                                >
                                    {classroom.status === "active" && "Ativo"}
                                    {classroom.status === "finished" && "Finalizado"}
                                    {classroom.status === "created" && "Criado"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span className="capitalize">{classroom.period}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="h-4 w-4" />
                                    <span>Turma {classroom.name}</span>
                                </div>

                                <div className="pt-2">
                                    <Button asChild className="w-full">
                                        <Link href={`classroom/${classroom.id}`}>
                                            Acessar Turma
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
