import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { getTeacherLessons } from "@/lib/actions/academic";
import TeacherClassCard from "@/components/academic/TeacherClassCard";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";

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
                    <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
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

    // 3. Group Lessons by Subject + Class to avoid duplicates
    // We only need one card per "Subject-Class" pair, even if they have multiple schedule slots
    const uniqueClasses = new Map();

    lessons.forEach((lesson: any) => {
        const key = `${lesson.subjectId}-${lesson.classId}`;
        if (!uniqueClasses.has(key)) {
            uniqueClasses.set(key, lesson);
        } else {
            // Optional: Merge schedules if we wanted to show full schedule on the card
            // For now, simpler is better
        }
    });

    const groupedLessons = Array.from(uniqueClasses.values());

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Minhas Turmas</h1>
                <p className="text-gray-500 mt-1">Gerencie suas aulas e lançamentos de notas</p>
            </div>

            {groupedLessons.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">Nenhuma turma atribuída a você neste momento.</p>
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
