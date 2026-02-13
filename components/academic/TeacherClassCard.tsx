import Link from "next/link";
import { BookOpen, Users, GraduationCap, ChevronRight } from "lucide-react";

interface TeacherClassCardProps {
    lesson: {
        id: string;
        subject: {
            name: string;
            course: {
                name: string;
            } | null;
        } | null;
        class: {
            name: string;
        } | null;
        schedule: string;
    };
}

export default function TeacherClassCard({ lesson }: TeacherClassCardProps) {
    const subjectName = lesson.subject?.name || "Disciplina desconhecida";
    const className = lesson.class?.name || "Turma desconhecida";
    const courseName = lesson.subject?.course?.name || "Curso desconhecido";

    // Format schedule for display
    let scheduleDisplay = "Sem horário definido";
    try {
        const schedules = JSON.parse(lesson.schedule);
        if (Array.isArray(schedules) && schedules.length > 0) {
            scheduleDisplay = schedules.map((s: any) => `${s.day} ${s.start}-${s.end}`).join(", ");
        }
    } catch (e) {
        // Fallback if parsing fails
    }

    return (
        <Link href={`/dashboard/teacher/classes/${lesson.id}`} className="block group">
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 h-full flex flex-col justify-between group-hover:border-emerald-500/50">
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            {className}
                        </span>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-1">
                            {subjectName}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                            <GraduationCap className="w-4 h-4 mr-1.5" />
                            <span className="line-clamp-1">{courseName}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Horário</span>
                        <span className="text-gray-600 font-medium">{scheduleDisplay}</span>
                    </div>
                    <div className="p-1.5 rounded-full bg-gray-50 text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
