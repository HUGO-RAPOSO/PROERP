
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getClassGradesForReport } from "@/lib/actions/academic";
import GradeReportClient from "./GradeReportClient";

export default async function GradeReportPage({ params }: { params: { classId: string } }) {
    const session = await auth();
    if (!session || !session.user) redirect('/auth/login');

    const data = await getClassGradesForReport(params.classId);

    if (!data || (data as any).error) {
        return (
            <div className="p-8 text-center bg-red-50 h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-red-600 mb-2">Erro ao Gerar Pauta</h1>
                <p className="text-gray-700 font-medium">{(data as any)?.error || "Erro desconhecido ao buscar dados."}</p>
                <p className="text-sm text-gray-500 mt-4 max-w-md">
                    Se o erro for de configuração, verifique as variáveis de ambiente no painel da Vercel.
                </p>
            </div>
        );
    }

    const { classDetails, enrollments } = data;
    const subject = classDetails.subject;

    return (
        <GradeReportClient
            classDetails={classDetails}
            enrollments={enrollments}
            subject={subject}
        />
    );
}
