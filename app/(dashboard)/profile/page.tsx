import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { BookOpen, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ProfilePageTitle, SignOutButton, AdminDashboardLink, BooksUploadedLabel, ContributionsLabel, RoleBadge } from '@/components/T';
import { ProfileAvatarUpload } from '@/components/ProfileAvatarUpload';

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/');

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            _count: {
                select: { books: true, posts: true, comments: true, bookAccess: true }
            }
        }
    });

    if (!user) redirect('/');

    return (
        <div className="max-w-md mx-auto space-y-6">
            <div className="relative flex items-center justify-center mb-6 min-h-10">
                <div className="absolute left-0">
                    <ProfilePageTitle />
                </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-6">
                <ProfileAvatarUpload
                    userId={user.id}
                    currentImage={user.image}
                    displayName={user.nickname || user.name || ''}
                />
                <div>
                    <h2 className="text-xl font-medium">{user.nickname || user.name}</h2>
                    <p className="text-sm text-gray-500 mb-1">@{user.name}</p>
                    <RoleBadge role={user.role} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-card p-5 rounded-xl border border-border flex flex-col items-center justify-center text-center space-y-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <span className="text-2xl font-bold">{user._count.bookAccess}</span>
                    <BooksUploadedLabel />
                </div>
                <div className="bg-card p-5 rounded-xl border border-border flex flex-col items-center justify-center text-center space-y-2">
                    <MessageCircle className="h-6 w-6 text-accent-foreground" />
                    <span className="text-2xl font-bold">{user._count.posts} / {user._count.comments}</span>
                    <ContributionsLabel />
                </div>
            </div>

            {user.role === 'ADMIN' && (
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <Link href="/admin" className="flex items-center justify-between text-primary font-medium hover:underline">
                        <AdminDashboardLink />
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            )}

            <div className="pt-2">
                <form
                    action={async () => {
                        'use server';
                        await signOut({ redirectTo: '/' });
                    }}
                >
                    <SignOutButton />
                </form>
            </div>
        </div>
    );
}
