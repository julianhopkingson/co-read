'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { MessageCircle, Heart, ArrowLeft, SendHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CommentItem } from '@/components/CommentItem';
import { deletePost, toggleLike, addComment } from '@/lib/community';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { useLanguage } from '@/contexts/language-context';
import { useRouter } from 'next/navigation';

interface ThreadDetailClientProps {
    post: any;
    currentUserId?: string;
    currentUserRole?: string;
}

export function ThreadDetailClient({ post, currentUserId, currentUserRole }: ThreadDetailClientProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLiked, setIsLiked] = useState(post.likes.some((l: any) => l.userId === currentUserId));
    const [likeCount, setLikeCount] = useState(post._count.likes);
    const { confirm } = useConfirmDialog();
    const { t, locale } = useLanguage();
    const router = useRouter();
    const dateLocale = locale === 'zh' ? zhCN : enUS;

    const isAdmin = currentUserRole === 'ADMIN';
    const showDelete = isAdmin && isEditMode;

    const handleLike = async () => {
        setIsLiked(!isLiked);
        setLikeCount(likeCount + (isLiked ? -1 : 1));
        await toggleLike(post.id);
    };

    const handleDelete = async () => {
        if (await confirm(t('admin.deleteDiscussionsConfirm'))) {
            await deletePost(post.id);
            router.push('/discuss');
        }
    };

    async function submitComment(formData: FormData) {
        await addComment(post.id, formData);
        router.refresh();
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            {/* Header */}
            <div className="relative flex items-center justify-center min-h-10">
                <div className="absolute left-0 flex items-center gap-2">
                    <Link href="/discuss" className="p-3 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors shadow-md">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-serif tracking-tight leading-none translate-y-1">{t('thread.title' as any)}</h1>
                </div>
                {isAdmin && (
                    <div className="absolute right-0 mr-14">
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`p-3 rounded-full transition-colors shadow-md ${isEditMode ? 'bg-orange-500 text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                            title={isEditMode ? 'Finish Editing' : 'Edit'}
                        >
                            <Pencil className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Main Post */}
            <div className="bg-card p-6 rounded-xl border border-border relative group">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-secondary-foreground overflow-hidden">
                            {post.author.image ? (
                                <img src={post.author.image} alt={post.author.name} className="h-full w-full object-cover" />
                            ) : (
                                (post.author.nickname || post.author.name)?.slice(0, 1).toUpperCase()
                            )}
                        </div>
                        <div>
                            <p className="font-medium">{post.author.nickname || post.author.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: dateLocale })}
                            </p>
                        </div>
                    </div>
                    {showDelete && (
                        <button
                            onClick={handleDelete}
                            className="p-1 bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600 transition-colors"
                            title={t('admin.delete')}
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <p className="text-lg font-serif mb-6 whitespace-pre-wrap">{post.content}</p>

                {post.book && (
                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg mb-6 max-w-sm border border-border/50">
                        {post.book.coverUrl ? (
                            <img src={post.book.coverUrl} className="h-12 w-8 object-cover rounded-sm bg-muted" alt="" />
                        ) : (
                            <div className="h-12 w-8 bg-muted rounded-sm" />
                        )}
                        <div>
                            <p className="text-sm font-medium">{post.book.title}</p>
                            <p className="text-xs text-muted-foreground">{post.book.author}</p>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-6 pt-4 border-t border-border">
                    <button
                        onClick={handleLike}
                        className={cn("flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-red-500", isLiked && "text-red-500")}
                    >
                        <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                        {likeCount}
                    </button>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <MessageCircle className="h-5 w-5" />
                        {post.comments.length}
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground ml-1">{t('thread.comments' as any)}</h3>

                <form action={submitComment} className="flex gap-2 mb-6">
                    <input
                        name="content"
                        placeholder={t('thread.writeComment' as any)}
                        className="flex-1 bg-card border-border rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#8BC34A]"
                        required
                        autoComplete="off"
                    />
                    <button type="submit" className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 shadow-md transition-all active:scale-[0.8] active:bg-[#8BC34A]">
                        <SendHorizontal className="h-4 w-4" />
                    </button>
                </form>

                <div className="space-y-4">
                    {post.comments.map((comment: any) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUserId={currentUserId}
                            currentUserRole={currentUserRole}
                            isEditMode={isEditMode}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
