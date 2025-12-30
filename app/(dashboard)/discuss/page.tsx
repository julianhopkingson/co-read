import { getBooks } from '@/lib/books';
import { getFeed } from '@/lib/community';
import { auth } from '@/auth';
import { DiscussClient } from '@/components/DiscussClient';

export default async function DiscussPage() {
    const [books, posts, session] = await Promise.all([
        getBooks(),
        getFeed(),
        auth()
    ]);

    return (
        <DiscussClient
            books={books}
            posts={posts}
            currentUserId={session?.user?.id}
            currentUserRole={session?.user?.role}
        />
    );
}
