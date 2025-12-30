import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `auth`, contains data about the active session.
     */
    interface Session {
        user: {
            id: string
            role: string
        } & DefaultSession["user"]
    }

    interface User {
        role: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string
        id: string
    }
}
