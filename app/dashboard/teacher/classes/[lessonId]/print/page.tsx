import { auth } from "@/auth";
import { getLessonStudentsWithGrades } from "@/lib/actions/academic";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import PrintTrigger from "@/components/academic/PrintTrigger";

interface PageProps {
    params: Promise<{ lessonId: string }>;
}

export default async function PrintGradesPage({ params }: PageProps) {
    const { lessonId } = await params;
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/auth/login");
    }

    const { data: user } = await supabase
        .from('User')
        .select('name')
        .eq('email', session.user.email)
        .single();

    const result = await getLessonStudentsWithGrades(lessonId);

    if (!result.success) {
        return <div>Erro ao carregar dados: {result.error}</div>;
    }

    const students = result.data || [];

    const { data: lesson } = await supabase
        .from('Lesson')
        .select(`
            *,
            subject:Subject(name, code),
            class:Class(name, course:Course(name))
        `)
        .eq('id', lessonId)
        .single();

    // Sort students alphabetically
    students.sort((a: any, b: any) => (a.student?.name || "").localeCompare(b.student?.name || ""));

    return (
        <div className="bg-white p-8 min-h-screen text-black">
            {/* Header */}
            <div className="mb-8 border-b-2 border-black pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">Pauta de Avaliação</h1>
                        <div className="text-sm space-y-1">
                            <p><span className="font-bold">Curso:</span> {lesson?.class?.course?.name}</p>
                            <p><span className="font-bold">Disciplina:</span> {lesson?.subject?.name} {lesson?.subject?.code ? `(${lesson?.subject?.code})` : ''}</p>
                            <p><span className="font-bold">Turma:</span> {lesson?.class?.name}</p>
                        </div>
                    </div>
                    <div className="text-right text-sm">
                        <p><span className="font-bold">Ano Letivo:</span> {new Date().getFullYear()}</p>
                        <p><span className="font-bold">Data:</span> {new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <table className="w-full border-collapse border border-black text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black px-2 py-1 w-10 text-center">#</th>
                        <th className="border border-black px-2 py-1 text-left">Nome do Aluno</th>
                        <th className="border border-black px-2 py-1 w-16 text-center">P1</th>
                        <th className="border border-black px-2 py-1 w-16 text-center">P2</th>
                        <th className="border border-black px-2 py-1 w-16 text-center">Exame</th>
                        <th className="border border-black px-2 py-1 w-16 text-center">Rec.</th>
                        <th className="border border-black px-2 py-1 w-16 text-center">Final</th>
                        <th className="border border-black px-2 py-1 w-24 text-center">Obs</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((enrollment: any, index: number) => {
                        const getGrade = (type: string) => {
                            const g = enrollment.grades?.find((g: any) => g.type === type);
                            return g ? g.value : "-";
                        };

                        return (
                            <tr key={enrollment.id}>
                                <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                                <td className="border border-black px-2 py-1 uppercase">{enrollment.student?.name}</td>
                                <td className="border border-black px-2 py-1 text-center">{getGrade('P1')}</td>
                                <td className="border border-black px-2 py-1 text-center">{getGrade('P2')}</td>
                                <td className="border border-black px-2 py-1 text-center">{getGrade('EXAM')}</td>
                                <td className="border border-black px-2 py-1 text-center">{getGrade('RESOURCE')}</td>
                                <td className="border border-black px-2 py-1 text-center font-bold bg-gray-50">{getGrade('FINAL')}</td>
                                <td className="border border-black px-2 py-1"></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Footer / Signatures */}
            <div className="mt-16 flex justify-between items-end">
                <div className="text-center w-64 border-t border-black pt-2">
                    <p className="font-bold">{user?.name}</p>
                    <p className="text-xs">Professor(a)</p>
                </div>
                <div className="text-center w-64 border-t border-black pt-2">
                    <p className="text-xs">Coordenação Pedagógica</p>
                </div>
            </div>

            {/* Print Trigger */}
            {/* Print Trigger & Styles */}
            <PrintTrigger />
        </div>
    );
}
