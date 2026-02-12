import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import StudentList from "@/components/academic/StudentList";
import ClassGrid from "@/components/academic/ClassGrid";
import AcademicManager from "./AcademicManager";

export default async function AcademicPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const tenantId = session.user.tenantId;

    // Fetch all academic data in parallel to eliminate waterfalls
    const [
        { data: students },
        { data: classes },
        { data: courses },
        { data: teachers },
        { data: subjects },
        { data: accounts }
    ] = await Promise.all([
        supabase.from('Student').select('*, course:Course (*), enrollments:Enrollment (*, subject:Subject (*, course:Course (name)))').eq('tenantId', tenantId).order('name', { ascending: true }),
        supabase.from('Class').select('*, teacher:Teacher (*), subject:Subject (*), enrollments:Enrollment (count)').eq('tenantId', tenantId),
        supabase.from('Course').select('*, subjects:Subject (*)').or(`tenantId.eq.${tenantId},tenantId.is.null`).order('name', { ascending: true }),
        supabase.from('Teacher').select('*').eq('tenantId', tenantId),
        supabase.from('Subject').select('*, course:Course(name)').or(`tenantId.eq.${tenantId},tenantId.is.null`),
        supabase.from('Account').select('*').eq('tenantId', tenantId)
    ]);

    // Format classes to match the expected structure
    const formattedClasses = (classes || []).map(c => ({
        ...c,
        _count: { enrollments: (c.enrollments as any)?.[0]?.count || 0 }
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
            classes={formattedClasses || []}
            students={students || []}
            subjects={subjects || []}
            accounts={accounts || []}
        />
    );
}
