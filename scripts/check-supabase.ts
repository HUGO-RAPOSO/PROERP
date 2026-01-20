import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase URL or Anon Key");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log("Checking connection for:", supabaseUrl);
    const { data, error } = await supabase.from('tenant').select('*');
    if (error) {
        console.error("Error fetching tenants:", error);
    } else {
        console.log("Tenants found:", data?.length || 0);
        if (data && data.length > 0) {
            console.log("First tenant ID:", data[0].id);
        } else {
            console.log("Table 'Tenant' exists but is empty.");
        }
    }
}

check();
