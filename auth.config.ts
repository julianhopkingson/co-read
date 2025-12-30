import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: '/',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/books') || nextUrl.pathname.startsWith('/discuss');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // If logged in and on login page, redirect to books
                if (nextUrl.pathname === '/') {
                    return Response.redirect(new URL('/books', nextUrl));
                }
            }
            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            // console.log("SESSION CALLBACK", session)
            return session;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
