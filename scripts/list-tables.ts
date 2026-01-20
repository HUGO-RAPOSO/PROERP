import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase URL or Anon Key");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
    console.log("Listing tables for:", supabaseUrl);
    // There isn't a direct way to list tables via JS SDK without RPC or querying system tables
    // But we can try to query a common table or use a query that fails with a list of suggestions if hints are enabled

    // Alternative: Use the service role key to query postgres system tables if enabled
    const { data, error } = await supabase.rpc('get_tables'); // Custom RPC if it exists
    if (error) {
        console.error("RPC failed, trying raw query via REST API... (might fail if not authorized)");
        const { data: rawData, error: rawError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');

        if (rawError) {
            console.error("Failed to query information_schema:", rawError);
        } else {
            console.log("Tables found:", rawData.map(t => t.table_name));
        }
    } else {
        console.log("Tables from RPC:", data);
    }
}

listTables();
