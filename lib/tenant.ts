import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

/**
 * Gets the current tenant from the session.
 * Throws an error or redirects if the tenant is not found.
 */
export async function getCurrentTenant() {
    const session = await auth();

    if (!session?.user?.tenantId) {
        return null;
    }

    const { data: tenant, error } = await supabase
        .from('Tenant')
        .select(`
            *,
            modules:TenantModule (
                enabled,
                module:Module (*)
            )
        `)
        .eq('id', session.user.tenantId)
        .single();

    if (error) {
        console.error("Error fetching tenant:", error);
        return null;
    }

    return tenant;
}

/**
 * Ensures the user has an active session and belongs to a tenant.
 * Redirects to sign-in if not authenticated.
 */
export async function requireTenant() {
    const tenant = await getCurrentTenant();

    if (!tenant) {
        redirect("/auth/signin");
    }

    return tenant;
}

/**
 * Checks if a specific module is enabled for the current tenant.
 */
export async function isModuleEnabled(moduleName: string) {
    const tenant = await getCurrentTenant();

    if (!tenant) return false;

    return (tenant as any).modules?.some(
        (tm: any) => tm.module?.name === moduleName && tm.enabled
    );
}
