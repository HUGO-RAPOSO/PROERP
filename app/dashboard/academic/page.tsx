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

    const { data: students } = await supabase
        .from('Student')
        .select(`
            *,
            course:Course (*),
            enrollments:Enrollment (
                *,
                subject:Subject (
                    *,
                    course:Course (name)
                )
            )
        `)
        .eq('tenantId', tenantId)
        .order('name', { ascending: true });

    const { data: classes } = await supabase
        .from('Class')
        .select(`
            *,
            teacher:Teacher (*),
            subject:Subject (*),
            enrollments:Enrollment (count)
        `)
        .eq('tenantId', tenantId);

    // Filter classes to match the Prisma _count structure if possible, or handle in component
    const formattedClasses = (classes || []).map(c => ({
        ...c,
        _count: { enrollments: (c.enrollments as any)?.[0]?.count || 0 }
    }));

    const { data: courses } = await supabase
        .from('Course')
        .select(`
            *,
            subjects:Subject (*)
        `)
        .or(`tenantId.eq.${tenantId},tenantId.is.null`)
        .order('name', { ascending: true });

    // Format courses to include counts
    const formattedCourses = (courses || []).map(c => ({
        ...c,
        _count: {
            subjects: (c.subjects as any[])?.length || 0,
            students: 0 // We'll need a different way to count students per course later
        }
    }));

    // Extract unique teachers from classes
    const { data: teachers } = await supabase.from('Teacher').select('*').eq('tenantId', tenantId);

    const { data: subjects } = await supabase
        .from('Subject')
        .select('*, course:Course(name)')
        .or(`tenantId.eq.${tenantId},tenantId.is.null`);

    return (
        <AcademicManager
            tenantId={tenantId}
            teachers={teachers || []}
            courses={formattedCourses}
            classes={formattedClasses || []}
            students={students || []}
            subjects={subjects || []}
        />
    );
}
