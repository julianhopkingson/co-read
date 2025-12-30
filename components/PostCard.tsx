'use client';

import { Heart, MessageCircle, BookOpen, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toggleLike, deletePost } from '@/lib/community';
import { useOptimistic, startTransition } from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { useLanguage } from '@/contexts/language-context';

interface PostProps {
    post: any;
    currentUserId?: string;
    currentUserRole?: string;
    isEditMode?: boolean;
}

export function PostCard({ post, currentUserId, currentUserRole, isEditMode }: PostProps) {
    const isLikedInitial = post.likes.some((l: any) => l.userId === currentUserId);
    const { confirm } = useConfirmDialog();
    const { t, locale } = useLanguage();
    const dateLocale = locale === 'zh' ? zhCN : enUS;

    const [optimisticLike, addOptimisticLike] = useOptimistic(
        { isLiked: isLikedInitial, count: post._count.likes },
        (state, newLikeState: boolean) => ({
            isLiked: newLikeState,
            count: state.count + (newLikeState ? 1 : -1),
        })
    );

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        startTransition(() => {
            addOptimisticLike(!optimisticLike.isLiked);
        });
        await toggleLike(post.id);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (await confirm(t('admin.deleteDiscussionsConfirm'))) {
            await deletePost(post.id);
        }
    };

    const isAdmin = currentUserRole === 'ADMIN';
    const showDelete = isAdmin && isEditMode;

    // Check if user is author (post.author.id might need to be fetched)
    // We updated getFeed to include author.id


    return (
        <Link href={`/discuss/${post.id}`} className="block bg-card p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-colors shadow-sm relative group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-secondary-foreground overflow-hidden">
                        {post.author.image ? (
                            <img src={post.author.image} alt={post.author.name} className="h-full w-full object-cover" />
                        ) : (
                            (post.author.nickname || post.author.name)?.slice(0, 1).toUpperCase()
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium leading-none">{post.author.nickname || post.author.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: dateLocale })}
                        </p>
                    </div>
                </div>
            </div>

            <p className="text-base leading-relaxed text-foreground/90 font-serif mb-4 whitespace-pre-wrap">
                {post.content}
            </p>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-muted-foreground">
                    <button
                        onClick={handleLike}
                        className={cn(
                            "flex items-center gap-1.5 text-sm transition-colors hover:text-red-500",
                            optimisticLike.isLiked && "text-red-500"
                        )}
                    >
                        <Heart className={cn("h-4 w-4", optimisticLike.isLiked && "fill-current")} />
                        <span>{optimisticLike.count}</span>
                    </button>
                    <div className="flex items-center gap-1.5 text-sm">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post._count.comments}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {post.book && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary/30 rounded-full text-[10px] text-muted-foreground max-w-[160px]">
                            {post.book.coverUrl ? (
                                <img src={post.book.coverUrl} alt={post.book.title} className="h-4 w-3 object-cover rounded-sm flex-shrink-0" />
                            ) : (
                                <BookOpen className="h-3 w-3 flex-shrink-0" />
                            )}
                            <span className="truncate">{post.book.title}</span>
                        </div>
                    )}
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
            </div>
        </Link>
    );
}
