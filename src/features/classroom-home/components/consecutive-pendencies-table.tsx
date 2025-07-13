import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { getStudentsWithConsecutivePendencies } from "@/app/actions/classrooms/home-dashboard";

interface ConsecutivePendenciesTableProps {
    classroomId: string;
}

export async function ConsecutivePendenciesTable({ classroomId }: ConsecutivePendenciesTableProps) {
    const studentsWithConsecutivePendencies = await getStudentsWithConsecutivePendencies(classroomId);

    if (studentsWithConsecutivePendencies.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4 ">
            <div className="flex justify-between items-center mx-2">
                <h2 className="text-lg font-semibold text-gray-500 leading-0">
                    {studentsWithConsecutivePendencies.length} Estudantes estão com pendências consecutivas
                </h2>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/classroom/${classroomId}/activities`}>
                        Tela de Atividades
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-left">Nome</TableHead>
                                <TableHead className="text-left">Email</TableHead>
                                <TableHead className="text-center">Pendências consecutivas</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {studentsWithConsecutivePendencies.map((student, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell className="text-gray-600">{student.email}</TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                            {student.consecutivePendencies}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
