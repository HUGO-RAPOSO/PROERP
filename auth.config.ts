import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
    // @ts-ignore
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }: any) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

            if (isOnDashboard) {
                if (isLoggedIn) {
                    // Strict Role-Based Access Control for Students
                    if (auth?.user?.role === 'STUDENT') {
                        // Allow access to Library and My Grades
                        const isLibraryPage = nextUrl.pathname.startsWith('/dashboard/library');
                        const isGradesPage = nextUrl.pathname.startsWith('/dashboard/student/grades');

                        if (!isLibraryPage && !isGradesPage) {
                            return Response.redirect(new URL('/dashboard/library', nextUrl));
                        }
                    }

                    // Strict Role-Based Access Control for Teachers
                    if (auth?.user?.role === 'TEACHER') {
                        // Allow access to Library and My Classes (Teacher Dashboard)
                        const isLibraryPage = nextUrl.pathname.startsWith('/dashboard/library');
                        const isTeacherDashboard = nextUrl.pathname === '/dashboard/teacher' || nextUrl.pathname.startsWith('/dashboard/teacher/');

                        if (!isLibraryPage && !isTeacherDashboard) {
                            return Response.redirect(new URL('/dashboard/teacher', nextUrl));
                        }
                    }
                    return true;
                }
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                if (nextUrl.pathname === '/') {
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
            }
            return true;
        },
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
