
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLessonGradesForReport } from "@/lib/actions/academic";
import GradeReportClient from "./GradeReportClient";

export default async function GradeReportPage(props: { params: Promise<{ classId: string }> }) {
    try {
        const params = await props.params;
        const session = await auth();
        if (!session || !session.user) redirect('/auth/login');

        const response = await getLessonGradesForReport(params.classId);

        if (!response.success || !response.data) {
            return (
                <div className="p-8 text-center bg-red-50 h-screen flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Erro ao Gerar Pauta</h1>
                    <p className="text-gray-700 font-medium">{response.error || "Erro desconhecido ao buscar dados."}</p>
                    <p className="text-sm text-gray-500 mt-4 max-w-md">
                        Se o erro for de configuração, verifique as variáveis de ambiente no painel da Vercel.
                    </p>
                </div>
            );
        }

        const data = response.data;

        // SANITIZATION: Force JSON serialization to remove Date objects or complex types
        const safeData = JSON.parse(JSON.stringify(data));

        const { lessonDetails, enrollments } = safeData;
        const subject = lessonDetails?.subject;

        // Data is loading correctly, render the actual report
        return (
            <GradeReportClient
                classDetails={lessonDetails}
                enrollments={enrollments}
                subject={subject}
            />
        );
    } catch (error: any) {
        console.error("CRITICAL ERROR in GradeReportPage:", error);
        return (
            <div className="p-8 bg-red-100 h-screen flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold text-red-700 mb-4">Erro Crítico no Servidor</h1>
                <p className="text-lg text-gray-800 mb-2"><strong>Mensagem:</strong> {error?.message || "Erro desconhecido"}</p>
                <p className="text-sm text-gray-600 mb-4"><strong>Tipo:</strong> {error?.name || "Error"}</p>
                <pre className="bg-white p-4 rounded text-xs overflow-auto max-w-4xl w-full">
                    {error?.stack || JSON.stringify(error, null, 2)}
                </pre>
            </div>
        );
    }
}
