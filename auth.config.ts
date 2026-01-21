import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const u = user as any;
                token.id = u.id;
                token.tenantId = u.tenantId;
                token.role = u.role;
                // Capture both cases just in case
                token.teacherId = u.teacherId || u.teacherid;
                token.studentId = u.studentId || u.studentid;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.tenantId = token.tenantId;
                session.user.role = token.role;
                session.user.teacherId = token.teacherId;
                session.user.studentId = token.studentId;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
    },
    session: {
        strategy: "jwt",
    },
} satisfies NextAuthConfig;
