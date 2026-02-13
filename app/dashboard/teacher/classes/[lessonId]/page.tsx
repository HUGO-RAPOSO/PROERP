import { auth } from "@/auth";
import { getLessonStudentsWithGrades } from "@/lib/actions/academic";
import GradeOverviewTable from "@/components/academic/GradeOverviewTable";
import { redirect } from "next/navigation";
import { ChevronLeft, GraduationCap } from "lucide-react";
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
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                    Erro ao carregar dados da turma: {result.error}
                </div>
                <Link href="/dashboard/teacher" className="mt-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
                </Link>
            </div>
        );
    }

    const students = result.data || [];

    // Extract class/subject info from the first enrollment or fetch separately if needed
    // The action returns enrollments with nested subject data, but doesn't return the Class name directly
    // apart from what we might infer. simpler to just fetch the lesson details for the header.

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/dashboard/teacher"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-3 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Voltar para minhas turmas
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {lesson?.subject?.name || "Disciplina"}
                        <span className="text-gray-300">/</span>
                        <span className="font-normal text-gray-600">{lesson?.class?.name || "Turma"}</span>
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <GraduationCap className="w-4 h-4" />
                        <span>{lesson?.class?.course?.name}</span>
                        {lesson?.subject?.code && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span>Cód: {lesson?.subject?.code}</span>
                            </>
                        )}
                    </div>
                </div>
                <Link
                    href={`/dashboard/teacher/classes/${lessonId}/print`}
                    target="_blank"
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-sm transition-all"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Imprimir Pauta
                </Link>
            </div>

            <GradeOverviewTable
                students={students}
                lesson={lesson}
                currentTenantId={user.tenantId}
            />
        </div>
    );
}
