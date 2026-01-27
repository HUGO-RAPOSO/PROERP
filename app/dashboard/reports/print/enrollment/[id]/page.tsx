import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import EnrollmentProof from "@/components/reports/EnrollmentProof";

export default async function PrintEnrollmentPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const tenantId = session.user.tenantId;

    const client = supabaseAdmin || supabase;

    // Fetch student data with course info
    const { data: student, error } = await client
        .from('Student')
        .select('*, course:Course(name)')
        .eq('id', params.id)
        .eq('tenantId', tenantId)
        .single();

    if (error || !student) {
        console.error("Print Error (Enrollment):", error);
        notFound();
    }

    const { data: tenant } = await supabase
        .from('Tenant')
        .select('name')
        .eq('id', tenantId)
        .single();

    const studentData = {
        name: student.name,
        email: student.email,
        phone: student.phone,
        courseName: student.course?.name,
        enrollmentDate: new Date(student.createdAt).toLocaleDateString(),
        enrollmentSlipNumber: student.enrollmentSlipNumber
    };

    return (
        <div className="bg-white min-h-screen">
            <EnrollmentProof student={studentData} tenantName={tenant?.name} />
        </div>
    );
}
