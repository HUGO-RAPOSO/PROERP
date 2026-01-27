
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getClassGradesForReport } from "@/lib/actions/academic";
import GradeReportClient from "./GradeReportClient";

export default async function GradeReportPage({ params }: { params: { classId: string } }) {
    const session = await auth();
    if (!session || !session.user) redirect('/auth/login');

    const data = await getClassGradesForReport(params.classId);

    if (!data) {
        return <div className="p-8 text-center text-red-600 font-bold">Turma não encontrada ou erro de acesso.</div>;
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
