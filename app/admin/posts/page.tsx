import { getAllBooksWithDiscussionCounts } from '@/lib/admin';
import { AdminPostList } from '@/components/AdminPostList';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ManagePostsTitle } from '@/components/T';

export default async function AdminPostsPage() {
    const books = await getAllBooksWithDiscussionCounts();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="relative flex items-center justify-center min-h-10 mb-6">
                <div className="absolute left-0 flex items-center gap-2">
                    <Link href="/admin" className="p-3 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors shadow-md">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <ManagePostsTitle />
                </div>
            </div>

            <AdminPostList books={books} />
        </div>
    )
}
