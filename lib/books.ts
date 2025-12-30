'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import { redirect } from 'next/navigation'

// Check if a book with the same original filename and size already exists
export async function checkDuplicateBook(originalFileName: string, fileSize: number): Promise<{ isDuplicate: boolean; existingTitle?: string }> {
    const existingBook = await prisma.book.findFirst({
        where: {
            originalFileName,
            fileSize
        },
        select: {
            title: true
        }
    });

    if (existingBook) {
        return { isDuplicate: true, existingTitle: existingBook.title };
    }
    return { isDuplicate: false };
}

export async function uploadBook(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error('Not authenticated')
    }

    // Only admin can upload books
    if (session.user.role !== 'ADMIN') {
        throw new Error('Only admins can upload books')
    }

    const file = formData.get('file') as File
    const cover = formData.get('cover') as string
    const title = formData.get('title') as string
    const author = formData.get('author') as string

    if (!file) {
        throw new Error('No file provided')
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileSize = buffer.length
    const originalFileName = file.name

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'books')
    const coverDir = path.join(process.cwd(), 'public', 'uploads', 'covers')
    await mkdir(uploadDir, { recursive: true })
    await mkdir(coverDir, { recursive: true })

    // Use single timestamp for both book and cover
    const timestamp = Date.now()
    const safeName = file.name.replace(/[\\/:*?"<>|]/g, '_')
    const fileName = `${timestamp}-${safeName}`
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)
    const fileUrl = `/uploads/books/${encodeURIComponent(fileName)}`

    let coverUrl = null
    if (cover && cover.startsWith('data:image')) {
        const coverData = cover.replace(/^data:image\/\w+;base64,/, '')
        const coverBuffer = Buffer.from(coverData, 'base64')
        const coverName = `${timestamp}-cover.jpg`
        const coverPath = path.join(coverDir, coverName)
        await writeFile(coverPath, coverBuffer)
        coverUrl = `/uploads/covers/${coverName}`
    }

    await prisma.book.create({
        data: {
            title: title || file.name.replace('.epub', ''),
            author: author || 'Unknown Author',
            fileUrl,
            fileSize,
            originalFileName,
            coverUrl,
            uploaderId: session.user.id,
        },
    })

    revalidatePath('/books')
    redirect('/books')
}

export async function deleteBook(bookId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error('Not authenticated')
    }

    // Only admin can delete books
    if (session.user.role !== 'ADMIN') {
        throw new Error('Only admins can delete books')
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book) {
        throw new Error('Book not found')
    }

    // Delete files from disk
    try {
        if (book.fileUrl) {
            // fileUrl is like "/uploads/books/filename.epub" (URL encoded)
            // Decode URI and construct proper path
            const decodedUrl = decodeURIComponent(book.fileUrl)
            const filePath = path.join(process.cwd(), 'public', ...decodedUrl.split('/').filter(Boolean))
            console.log('Deleting book file:', filePath)
            await unlink(filePath)
        }
        if (book.coverUrl) {
            const decodedCoverUrl = decodeURIComponent(book.coverUrl)
            const coverPath = path.join(process.cwd(), 'public', ...decodedCoverUrl.split('/').filter(Boolean))
            console.log('Deleting cover file:', coverPath)
            await unlink(coverPath)
        }
    } catch (e) {
        console.error('Failed to delete files:', e)
    }

    // Delete associated posts first (this will cascade to comments and likes)
    await prisma.post.deleteMany({
        where: { bookId }
    })

    await prisma.book.delete({ where: { id: bookId } })
    revalidatePath('/books')
}

export async function getBooks(userId?: string) {
    // Determine if we need to include userAccess based on userId
    const books = await prisma.book.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            uploader: { select: { name: true } },
            // Only include userAccess if userId is provided
            ...(userId ? {
                userAccess: {
                    where: { userId },
                    select: { accessedAt: true }
                }
            } : {})
        }
    }) as any[]

    // Sort by user's accessedAt (if exists) or createdAt
    if (userId) {
        books.sort((a: any, b: any) => {
            const aTime = a.userAccess?.[0]?.accessedAt?.getTime() ?? a.createdAt.getTime()
            const bTime = b.userAccess?.[0]?.accessedAt?.getTime() ?? b.createdAt.getTime()

            return bTime - aTime
        })
    }

    return books
}

export async function getBook(id: string) {
    const book = await prisma.book.findUnique({
        where: { id },
    })
    return book
}

export async function updateBookAccess(bookId: string, userId: string) {
    // Use any cast to avoid type errors if generated client is stale
    await (prisma as any).userBookAccess.upsert({
        where: {
            userId_bookId: { userId, bookId }
        },
        create: {
            userId,
            bookId,
            accessedAt: new Date()
        },
        update: {
            accessedAt: new Date()
        }
    })

    revalidatePath('/books')
}
