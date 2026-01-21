import NextAuth, { type DefaultSession } from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { supabase } from "@/lib/supabase";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    }),
    providers: [
        ...authConfig.providers,
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const { data: user, error } = await supabase
                    .from('User')
                    .select('*')
                    .eq('email', credentials.email)
                    .single();

                if (error || !user || !user.password) return null;

                const isValid = await bcrypt.compare(credentials.password as string, user.password);

                if (!isValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    tenantId: user.tenantId,
                    role: user.role,
                    teacherId: user.teacherId,
                    studentId: user.studentId,
                };
            }
        })
    ],
});

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            tenantId: string;
            role: string;
            teacherId?: string;
            studentId?: string;
        } & DefaultSession["user"];
    }
}
