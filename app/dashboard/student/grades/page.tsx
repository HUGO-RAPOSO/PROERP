"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getStudentGrades } from "@/lib/actions/academic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentGradesPage() {
    const { data: session } = useSession();
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.studentId) {
            getStudentGrades(session.user.studentId)
                .then(setEnrollments)
                .finally(() => setLoading(false));
        }
    }, [session]);

    if (!session?.user?.studentId) {
        return <div className="p-8">Acesso restrito a alunos.</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Meu Boletim</h1>

            <div className="grid gap-6">
                {loading ? (
                    <p>Carregando notas...</p>
                ) : enrollments.length === 0 ? (
                    <p>Nenhuma matrícula encontrada.</p>
                ) : (
                    enrollments.map((enr) => (
                        <Card key={enr.id}>
                            <CardHeader>
                                <CardTitle className="text-xl">
                                    {enr.class?.subject?.name} ({enr.class?.subject?.code})
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">Ano: {enr.year}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500 uppercase font-bold">P1</div>
                                        <div className="text-2xl font-bold">
                                            {enr.grades.find((g: any) => g.type === "P1")?.value || "-"}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500 uppercase font-bold">P2</div>
                                        <div className="text-2xl font-bold">
                                            {enr.grades.find((g: any) => g.type === "P2")?.value || "-"}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-primary-50 rounded-lg">
                                        <div className="text-xs text-primary-500 uppercase font-bold">Média</div>
                                        <div className="text-2xl font-bold text-primary-700">
                                            {(() => {
                                                const p1 = enr.grades.find((g: any) => g.type === "P1")?.value || 0;
                                                const p2 = enr.grades.find((g: any) => g.type === "P2")?.value || 0;
                                                return ((p1 + p2) / 2).toFixed(1);
                                            })()}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500 uppercase font-bold">Situação</div>
                                        <div className="text-lg font-bold">
                                            {(() => {
                                                const p1 = enr.grades.find((g: any) => g.type === "P1")?.value || 0;
                                                const p2 = enr.grades.find((g: any) => g.type === "P2")?.value || 0;
                                                const media = (p1 + p2) / 2;
                                                return media >= 7 ? "Aprovado" : "Em curso";
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
