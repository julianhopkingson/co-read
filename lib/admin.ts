'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

const CreateUserSchema = z.object({
    password: z.string().min(4),
    confirmPassword: z.string(),
    name: z.string().min(5, { message: 'error.username.min' }).max(10, { message: 'error.username.max' }).regex(/^[a-zA-Z]+$/, { message: 'error.username.format' }),
    nickname: z.string().min(5, { message: 'error.nickname.min' }).max(10, { message: 'error.nickname.max' }),
    role: z.enum(['USER', 'ADMIN']),
    image: z.instanceof(File).optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
    message: "error.password.mismatch",
    path: ["confirmPassword"],
})

const UpdateUserSchema = z.object({
    password: z.string().min(4).optional().or(z.literal('')),
    name: z.string().min(5, { message: 'error.username.min' }).max(10, { message: 'error.username.max' }).regex(/^[a-zA-Z]+$/, { message: 'error.username.format' }),
    nickname: z.string().min(5, { message: 'error.nickname.min' }).max(10, { message: 'error.nickname.max' }),
    role: z.enum(['USER', 'ADMIN']),
    userId: z.string(),
    image: z.instanceof(File).optional().or(z.literal('')),
})

async function checkAdmin() {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }
}

export async function deleteUser(userId: string) {
    await checkAdmin()
    await prisma.user.delete({ where: { id: userId } })
    revalidatePath('/admin/users')
}

export async function deleteBook(bookId: string) {
    await checkAdmin()

    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book) {
        throw new Error('Book not found')
    }

    // Delete files from disk
    try {
        if (book.fileUrl) {
            const decodedUrl = decodeURIComponent(book.fileUrl)
            const filePath = path.join(process.cwd(), 'public', ...decodedUrl.split('/').filter(Boolean))
            console.log('Admin: Deleting book file:', filePath)
            await unlink(filePath)
        }
        if (book.coverUrl) {
            const decodedCoverUrl = decodeURIComponent(book.coverUrl)
            const coverPath = path.join(process.cwd(), 'public', ...decodedCoverUrl.split('/').filter(Boolean))
            console.log('Admin: Deleting cover file:', coverPath)
            await unlink(coverPath)
        }
    } catch (e) {
        console.error('Failed to delete files:', e)
    }

    // Delete associated posts first
    await prisma.post.deleteMany({
        where: { bookId }
    })

    await prisma.book.delete({ where: { id: bookId } })
    revalidatePath('/admin/books')
}

export async function getAdminStats() {
    await checkAdmin()

    const [userCount, bookCount, postCount, commentCount] = await Promise.all([
        prisma.user.count(),
        prisma.book.count(),
        prisma.post.count(),
        prisma.comment.count(),
    ])

    return { userCount, bookCount, postCount, commentCount }
}

export async function getAllUsers() {
    await checkAdmin()
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
    })
}

export async function getAllBooks() {
    await checkAdmin()
    return await prisma.book.findMany({
        orderBy: { createdAt: 'desc' },
        include: { uploader: { select: { name: true } } },
    })
}

export async function getAllBooksWithDiscussionCounts() {
    await checkAdmin()
    const books = await prisma.book.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { posts: true }
            },
            posts: {
                select: {
                    _count: {
                        select: { comments: true }
                    }
                }
            }
        }
    })

    // Calculate total comments for each book
    return books.map(book => ({
        ...book,
        totalComments: book.posts.reduce((sum, post) => sum + post._count.comments, 0)
    }))
}

export async function deleteBookDiscussions(bookId: string) {
    await checkAdmin()
    await prisma.post.deleteMany({
        where: { bookId }
    })
    revalidatePath('/admin/posts')
}

export type FormState = {
    message?: string;
    inputs?: {
        name?: string;
        nickname?: string;
        role?: string;
    };
}

export async function createUser(
    prevState: FormState | undefined,
    formData: FormData,
): Promise<FormState | undefined> {
    await checkAdmin()

    const rawEntries = Object.fromEntries(formData.entries())
    const validatedFields = CreateUserSchema.safeParse(rawEntries)

    const inputs = {
        name: rawEntries.name as string,
        nickname: rawEntries.nickname as string,
        role: rawEntries.role as string,
    }

    if (!validatedFields.success) {
        return {
            message: validatedFields.error.issues[0]?.message || 'error.invalidFields',
            inputs
        }
    }

    const { password, name, nickname, role, image } = validatedFields.data

    try {
        const existingUser = await prisma.user.findUnique({
            where: { name },
        })

        if (existingUser) {
            return {
                message: 'error.username.exists',
                inputs
            }
        }

        let imageUrl = null
        if (image instanceof File && image.size > 0 && image.name !== 'undefined') {
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
            await mkdir(uploadDir, { recursive: true })
            const timestamp = Date.now()
            const safeName = image.name.replace(/[\\/:*?"<>|]/g, '_')
            const fileName = `${timestamp}-${safeName}`
            const filePath = path.join(uploadDir, fileName)

            const bytes = await image.arrayBuffer()
            const buffer = Buffer.from(bytes)
            await writeFile(filePath, buffer)
            imageUrl = `/uploads/avatars/${encodeURIComponent(fileName)}`
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                password: hashedPassword,
                name,
                nickname,
                role,
                image: imageUrl,
            },
        })
    } catch (error) {
        return {
            message: 'error.user.createFailed',
            inputs
        }
    }

    revalidatePath('/admin/users')
    redirect('/admin/users')
}

export async function updateUser(
    prevState: FormState | undefined,
    formData: FormData,
): Promise<FormState | undefined> {
    await checkAdmin()

    const rawEntries = Object.fromEntries(formData.entries())
    const validatedFields = UpdateUserSchema.safeParse(rawEntries)

    // Inputs for restoration
    const inputs = {
        name: rawEntries.name as string,
        nickname: rawEntries.nickname as string,
        role: rawEntries.role as string,
    }

    if (!validatedFields.success) {
        return {
            message: validatedFields.error.issues[0]?.message || 'error.invalidFields',
            inputs
        }
    }

    const { password, name, nickname, role, userId, image } = validatedFields.data

    try {
        // Check if username taken by OTHER user
        const existingUser = await prisma.user.findFirst({
            where: {
                name,
                NOT: { id: userId }
            },
        })

        if (existingUser) {
            return {
                message: 'error.username.exists',
                inputs
            }
        }

        const data: any = {
            name,
            nickname,
            role,
        }

        // Handle Avatar Upload
        if (image instanceof File && image.size > 0 && image.name !== 'undefined') {
            // Get current user to find old avatar path
            const currentUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { image: true }
            });

            // Delete old avatar file if exists
            if (currentUser?.image) {
                try {
                    const oldAvatarPath = path.join(process.cwd(), 'public', currentUser.image);
                    if (existsSync(oldAvatarPath)) {
                        await unlink(oldAvatarPath);
                        console.log('Deleted old avatar:', oldAvatarPath);
                    }
                } catch (err) {
                    console.error('Failed to delete old avatar:', err);
                    // Continue even if deletion fails
                }
            }

            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
            await mkdir(uploadDir, { recursive: true })
            const timestamp = Date.now()
            const fileName = `${userId}-${timestamp}.jpg`
            const filePath = path.join(uploadDir, fileName)

            const bytes = await image.arrayBuffer()
            const buffer = Buffer.from(bytes)
            await writeFile(filePath, buffer)
            data.image = `/uploads/avatars/${fileName}`
        }

        if (password) {
            data.password = await bcrypt.hash(password, 10)
        }

        await prisma.user.update({
            where: { id: userId },
            data,
        })
    } catch (error) {
        return {
            message: 'error.user.createFailed', // Reuse generic fail
            inputs
        }
    }

    revalidatePath('/admin/users')
    redirect('/admin/users')
}
