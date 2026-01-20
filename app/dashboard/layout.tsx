import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
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
        <div className="min-h-screen bg-gray-50">
            <Sidebar userPermissions={userPermissions} userRole={userRole} />
            <div className="pl-64">
                <Header />
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
