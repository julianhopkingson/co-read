'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

const RegisterSchema = z.object({
    password: z.string().min(4),
    name: z.string().min(2),
})

export type LoginError = { key: string; ts: number } | undefined;

export async function authenticate(
    prevState: LoginError,
    formData: FormData,
): Promise<LoginError> {
    try {
        await signIn('credentials', formData)
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { key: 'error.login.invalid', ts: Date.now() }
                default:
                    return { key: 'common.error', ts: Date.now() }
            }
        }
        throw error
    }
    return undefined;
}

export async function register(
    prevState: string | undefined,
    formData: FormData,
) {
    const validatedFields = RegisterSchema.safeParse(
        Object.fromEntries(formData.entries())
    )

    if (!validatedFields.success) {
        return 'Invalid fields. Failed to register.'
    }

    const { password, name } = validatedFields.data

    try {
        const existingUser = await prisma.user.findUnique({
            where: { name },
        })

        if (existingUser) {
            return 'Username already exists.'
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                password: hashedPassword,
                name,
                role: 'USER',
            },
        })
    } catch (error) {
        return 'Failed to create user.'
    }

    redirect('/')
}
