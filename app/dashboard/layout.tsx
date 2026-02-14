import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user?.email) {
        redirect("/auth/login");
    }

    // Fetch Employee and Role permissions
    // We try to find an employee linked effectively effectively by email
    const { data: employee } = await supabase
        .from('Employee')
        .select(`
            *,
            role:Role (
                name,
                permissions
            )
        `)
        .eq('email', session.user.email)
        .single();

    const userPermissions = (employee as any)?.role?.permissions || [];
    const userRole = session.user.role; // This is the Auth role (ADMIN/USER)

    return (
        <DashboardLayoutClient userPermissions={userPermissions} userRole={userRole}>
            {children}
        </DashboardLayoutClient>
    );
}
