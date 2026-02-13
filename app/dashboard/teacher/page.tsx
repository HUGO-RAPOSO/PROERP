import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { getTeacherLessons } from "@/lib/actions/academic";
import TeacherClassCard from "@/components/academic/TeacherClassCard";
import { redirect } from "next/navigation";
import { AlertCircle, BookOpen } from "lucide-react";

export default async function TeacherDashboard() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/auth/login");
    }

    // 1. Get the User to find the teacherId
    const { data: user, error: userError } = await supabase
        .from('User')
        .select('teacherId, role')
        .eq('email', session.user.email)
        .single();

    if (userError || !user) {
        console.error("Error fetching user for teacher dashboard:", userError);
        return (
            <div className="p-6 bg-red-50 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Erro ao carregar perfil do usuário.
            </div>
        );
    }

    if (!user.teacherId) {
        // Provide a helpful message if the user is not linked to a teacher profile
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
                <div className="bg-orange-50 p-4 rounded-full mb-4">
                    <BookOpen className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito a Professores</h2>
                <p className="text-gray-600 max-w-md">
                    Este perfil de usuário não está associado a nenhum registro de Professor.
                    Entre em contato com a administração para vincular seu usuário ao seu cadastro de professor.
                </p>
            </div>
        );
    }

    // 2. Fetch Lessons
    const result = await getTeacherLessons(user.teacherId);

    if (!result.success) {
        return (
            <div className="p-6 bg-red-50 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {result.error}
            </div>
        );
    }

    const lessons = result.data || [];

    // 3. Group Lessons by Subject + Class to avoid duplicates.
    // Sometimes a teacher might have multiple schedule slots for the same class/subject.
    // We want to show one card per logical "Class/Subject" pair.
    const uniqueClasses = new Map();

    lessons.forEach((lesson: any) => {
        // Create a unique key based on Subject ID and Class ID
        const key = `${lesson.subjectId}-${lesson.classId}`;
        if (!uniqueClasses.has(key)) {
            uniqueClasses.set(key, lesson);
        } else {
            // Optional: Logic to merge schedule strings if multiple entries exist
        }
    });

    const groupedLessons = Array.from(uniqueClasses.values());

    return (
        <div className="space-y-8 p-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Minhas Turmas</h1>
                <p className="text-gray-500 mt-1">Gerencie suas aulas, alunos e lançamentos de notas.</p>
            </div>

            {groupedLessons.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <BookOpen className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Nenhuma turma encontrada</h3>
                    <p className="text-gray-500 mt-1">Você ainda não possui turmas atribuídas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedLessons.map((lesson: any) => (
                        <TeacherClassCard key={lesson.id} lesson={lesson} />
                    ))}
                </div>
            )}
        </div>
    );
}
