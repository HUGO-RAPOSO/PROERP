"use strict";

import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";

export async function signUp(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const tenantName = formData.get("tenantName") as string;
    const tenantSlug = tenantName.toLowerCase().replace(/\s+/g, '-');

    // 1. Create Tenant
    const { data: tenant, error: tenantError } = await supabase
        .from('Tenant')
        .insert({ name: tenantName, slug: tenantSlug })
        .select()
        .single();

    if (tenantError) throw new Error(tenantError.message);

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User
    const { data: user, error: userError } = await supabase
        .from('User')
        .insert({
            name,
            email,
            password: hashedPassword,
            tenantId: tenant.id,
            role: 'ADMIN'
        })
        .select()
        .single();

    if (userError) throw new Error(userError.message);

    // 4. Enable Modules for Tenant (Default all)
    const { data: modules } = await supabase.from('Module').select('id');
    if (modules) {
        const tenantModules = modules.map(m => ({
            tenantId: tenant.id,
            moduleId: m.id,
            enabled: true
        }));
        await supabase.from('TenantModule').insert(tenantModules);
    }

    return { success: true };
}
