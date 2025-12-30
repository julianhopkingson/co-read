import { getAdminStats } from '@/lib/admin';
import { Users, BookOpen, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AdminPageTitle, TotalUsersLabel, TotalBooksLabel, TotalPostsLabel } from '@/components/T';

export default async function AdminDashboard() {
    const stats = await getAdminStats();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header with back button */}
            <div className="relative flex items-center justify-center min-h-10 mb-6">
                <div className="absolute left-0 flex items-center gap-2">
                    <Link href="/profile" className="p-3 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors shadow-md">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <AdminPageTitle />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/users" className="block p-6 bg-card rounded-xl border border-border shadow-sm hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <TotalUsersLabel />
                            <h3 className="text-2xl font-bold">{stats.userCount}</h3>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/books" className="block p-6 bg-card rounded-xl border border-border shadow-sm hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent/20 rounded-lg text-accent-foreground">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <TotalBooksLabel />
                            <h3 className="text-2xl font-bold">{stats.bookCount}</h3>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/posts" className="block p-6 bg-card rounded-xl border border-border shadow-sm hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-secondary rounded-lg text-secondary-foreground">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <div>
                            <TotalPostsLabel />
                            <h3 className="text-2xl font-bold">{stats.postCount} / {stats.commentCount}</h3>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
