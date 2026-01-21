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
                token.id = user.id;
                token.tenantId = (user as any).tenantId;
                token.role = (user as any).role;
                token.teacherId = (user as any).teacherId;
                token.studentId = (user as any).studentId;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.tenantId = token.tenantId as string;
                session.user.role = token.role as string;
                session.user.teacherId = token.teacherId as string;
                session.user.studentId = token.studentId as string;
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
