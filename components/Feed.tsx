import { getFeed } from '@/lib/community';
import { PostCard } from '@/components/PostCard';
import { auth } from '@/auth';
import { FeedEmptyMessage } from '@/components/T';

export default async function Feed() {
    const posts = await getFeed();
    const session = await auth();

    return (
        <div className="space-y-4">
            {posts.map((post: any) => (
                <PostCard key={post.id} post={post} currentUserId={session?.user?.id} />
            ))}
            {posts.length === 0 && <FeedEmptyMessage />}
        </div>
    );
}
