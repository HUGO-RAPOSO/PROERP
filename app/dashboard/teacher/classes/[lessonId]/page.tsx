import { auth } from "@/auth";
import { getLessonStudentsWithGrades } from "@/lib/actions/academic";
import GradeOverviewTable from "@/components/academic/GradeOverviewTable";
import { redirect } from "next/navigation";
import { ChevronLeft, GraduationCap, Printer } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface PageProps {
    params: Promise<{ lessonId: string }>;
}

export default async function ClassGradeOverviewPage({ params }: PageProps) {
    const { lessonId } = await params;
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/auth/login");
    }

    // Fetch tenantId from user to pass to client component
    const { data: user } = await supabase
        .from('User')
        .select('tenantId')
        .eq('email', session.user.email)
        .single();

    if (!user) return null;

    const result = await getLessonStudentsWithGrades(lessonId);

    if (!result.success) {
        return (
            <div className="p-8">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                    <p className="font-medium">Erro ao carregar dados da turma</p>
                    <p className="text-sm mt-1">{result.error}</p>
                </div>
                <Link href="/dashboard/teacher" className="mt-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900 font-medium">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Voltar para minhas turmas
                </Link>
            </div>
        );
    }

    const students = result.data || [];

    // Fetch lesson details for the header
    const { data: lesson } = await supabase
        .from('Lesson')
        .select(`
            *,
            subject:Subject(name, code),
            class:Class(name, course:Course(name))
        `)
        .eq('id', lessonId)
        .single();

    return (
        <div className="space-y-6 p-6">
            {/* Breadcrumb / Navigation */}
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/dashboard/teacher"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-3 transition-colors group"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Voltar para minhas turmas
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {lesson?.subject?.name || "Disciplina"}
                        <span className="text-gray-300">|</span>
                        <span className="font-normal text-gray-600">{lesson?.class?.name || "Turma"}</span>
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                            <GraduationCap className="w-4 h-4" />
                            <span>{lesson?.class?.course?.name}</span>
                        </div>
                        {lesson?.subject?.code && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span>Cód: {lesson?.subject?.code}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <Link
                    href={`/dashboard/teacher/classes/${lessonId}/print`}
                    target="_blank"
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-sm transition-all"
                >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir Pauta
                </Link>
            </div>

            {/* Main Grade Table */}
            <GradeOverviewTable
                students={students}
                lesson={lesson}
                currentTenantId={user.tenantId}
            />
        </div>
    );
}
