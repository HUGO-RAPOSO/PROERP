import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import StudentList from "@/components/academic/StudentList";
import ClassGrid from "@/components/academic/ClassGrid";
import AcademicManager from "./AcademicManager";

export default async function AcademicPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const tenantId = session.user.tenantId;
    const client = supabaseAdmin || supabase;

    // Fetch all academic data in parallel to eliminate waterfalls
    const [
        { data: students },
        { data: classes },
        { data: courses },
        { data: teachers },
        { data: subjects },
        { data: accounts },
        { data: rooms }
    ] = await Promise.all([
        client.from('Student').select('*, course:Course (*), enrollments:Enrollment (*, subject:Subject (*, course:Course (name))), turma:Class(name)').eq('tenantId', tenantId).order('name', { ascending: true }),
        client.from('Class').select(`
            *,
            lessons:Lesson (
                *,
                subject:Subject (*),
                teacher:Teacher (name),
                room:Room (name)
            ),
            students:Student (count)
        `).eq('tenantId', tenantId),
        client.from('Course').select('*, subjects:Subject (*)').or(`tenantId.eq.${tenantId},tenantId.is.null`).order('name', { ascending: true }),
        client.from('Teacher').select('*').eq('tenantId', tenantId),
        client.from('Subject').select('*, course:Course(name)').or(`tenantId.eq.${tenantId},tenantId.is.null`),
        client.from('Account').select('*').eq('tenantId', tenantId),
        client.from('Room').select('*').eq('tenantId', tenantId).order('name', { ascending: true })
    ]);

    // Format classes to match the expected structure
    const formattedTurmas = (classes || []).map(c => ({
        ...c,
        _count: { students: (c.students as any)?.[0]?.count || 0 }
    }));

    // Format courses to include counts
    const formattedCourses = (courses || []).map(c => ({
        ...c,
        _count: {
            subjects: (c.subjects as any[])?.length || 0,
            students: 0 // We'll need a different way to count students per course later
        }
    }));

    return (
        <AcademicManager
            tenantId={tenantId}
            teachers={teachers || []}
            courses={formattedCourses}
            classes={formattedTurmas || []}
            students={students || []}
            subjects={subjects || []}
            accounts={accounts || []}
            rooms={rooms || []}
        />
    );
}
