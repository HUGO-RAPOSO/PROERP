import { formatDate } from "@/lib/utils";

interface Enrollment {
    student: {
        name: string;
        email: string | null;
    };
    class: {
        name: string;
    };
    year: number;
}

export default function RecentEnrollments({ enrollments }: { enrollments: Enrollment[] }) {
    return (
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Matrículas Recentes</h3>
                <button className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                    Ver Todas
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-50 text-left">
                            <th className="pb-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Aluno</th>
                            <th className="pb-4 text-sm font-bold text-gray-400 uppercase tracking-wider">Turma</th>
                            <th className="pb-4 text-sm font-bold text-gray-400 uppercase tracking-wider text-right">Ano</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {enrollments.map((enrollment, index) => (
                            <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                            {enrollment.student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{enrollment.student.name}</p>
                                            <p className="text-xs text-gray-500">{enrollment.student.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 text-sm text-gray-600 font-medium">
                                    {enrollment.class.name}
                                </td>
                                <td className="py-4 text-sm text-gray-900 font-bold text-right">
                                    {enrollment.year}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
