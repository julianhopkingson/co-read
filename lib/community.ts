'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    const content = formData.get('content') as string
    const bookId = formData.get('bookId') as string | null

    if (!content || content.length < 3) return { error: 'Content too short' }

    await prisma.post.create({
        data: {
            content,
            authorId: session.user.id,
            bookId: bookId || undefined,
        },
    })

    revalidatePath('/discuss')
}

export async function addComment(postId: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    const content = formData.get('content') as string
    if (!content) return

    await prisma.comment.create({
        data: {
            content,
            postId,
            authorId: session.user.id,
        },
    })

    revalidatePath(`/discuss/${postId}`)
}

export async function toggleLike(postId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    const existingLike = await prisma.like.findUnique({
        where: {
            postId_userId: {
                postId,
                userId: session.user.id,
            },
        },
    })

    if (existingLike) {
        await prisma.like.delete({
            where: { id: existingLike.id },
        })
    } else {
        await prisma.like.create({
            data: {
                postId,
                userId: session.user.id,
            },
        })
    }

    revalidatePath('/discuss')
    revalidatePath(`/discuss/${postId}`)
}

// ... (likes, comments, existing code)

export async function deletePost(postId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) throw new Error('Post not found')

    // Allow deletion if author or admin
    if (post.authorId !== session.user.id && session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    await prisma.post.delete({ where: { id: postId } })
    revalidatePath('/discuss')
    revalidatePath('/profile')
}

export async function deleteComment(commentId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    const comment = await prisma.comment.findUnique({ where: { id: commentId } })
    if (!comment) throw new Error('Comment not found')

    // Allow deletion if author or admin
    if (comment.authorId !== session.user.id && session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
    }

    await prisma.comment.delete({ where: { id: commentId } })
    revalidatePath(`/discuss/${comment.postId}`)
    revalidatePath('/profile')
}

export async function getFeed() {
    return await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            author: { select: { id: true, name: true, nickname: true, image: true } },
            book: { select: { title: true, id: true, coverUrl: true } },
            _count: { select: { comments: true, likes: true } },
            likes: { select: { userId: true } }, // To check if current user liked
        },
    })
}

export async function getPost(id: string) {
    return await prisma.post.findUnique({
        where: { id },
        include: {
            author: { select: { id: true, name: true, nickname: true, image: true } },
            book: { select: { title: true, id: true, coverUrl: true, author: true } },
            comments: {
                orderBy: { createdAt: 'asc' },
                include: { author: { select: { id: true, name: true, nickname: true, image: true } } },
            },
            likes: true,
            _count: { select: { likes: true } },
        },
    })
}

export async function getBookContributors(bookId: string) {
    const posts = await prisma.post.findMany({
        where: { bookId },
        select: {
            authorId: true,
            author: { select: { nickname: true, name: true } }
        }
    })

    // Aggregate by author
    const contributorMap = new Map<string, { nickname: string; count: number }>()
    for (const post of posts) {
        const existing = contributorMap.get(post.authorId)
        const displayName = post.author.nickname || post.author.name || 'Unknown'
        if (existing) {
            existing.count++
        } else {
            contributorMap.set(post.authorId, { nickname: displayName, count: 1 })
        }
    }

    // Convert to array and sort by count descending
    return Array.from(contributorMap.entries())
        .map(([id, data]) => ({ id, nickname: data.nickname, postCount: data.count }))
        .sort((a, b) => b.postCount - a.postCount)
}
