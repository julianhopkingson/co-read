import { getPost } from '@/lib/community';
import { auth } from '@/auth';
import { notFound } from 'next/navigation';
import { ThreadDetailClient } from '@/components/ThreadDetailClient';

export default async function PostPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const post = await getPost(id);
    const session = await auth();

    if (!post) notFound();

    return (
        <ThreadDetailClient
            post={post}
            currentUserId={session?.user?.id}
            currentUserRole={session?.user?.role}
        />
    );
}
