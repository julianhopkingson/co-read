'use client';

import { deleteComment } from '@/lib/community';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { useLanguage } from '@/contexts/language-context';

interface CommentItemProps {
    comment: {
        id: string;
        content: string;
        createdAt: Date;
        author: {
            id?: string;
            name: string | null;
            nickname?: string | null;
            image?: string | null;
        };
        authorId?: string; // Fallback if not in author object
    };
    currentUserId?: string;
    currentUserRole?: string;
    isEditMode?: boolean;
}

export function CommentItem({ comment, currentUserId, currentUserRole, isEditMode }: CommentItemProps) {
    const { confirm } = useConfirmDialog();
    const { t, locale } = useLanguage();
    const dateLocale = locale === 'zh' ? zhCN : enUS;

    // Check if user is admin and in edit mode
    const isAdmin = currentUserRole === 'ADMIN';
    const showDelete = isAdmin && isEditMode;

    const handleDelete = async () => {
        if (await confirm(t('admin.deleteDiscussionsConfirm'))) {
            await deleteComment(comment.id);
        }
    };

    return (
        <div className="flex gap-3 px-2 group relative">
            <div className="h-8 w-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-xs font-medium overflow-hidden">
                {comment.author.image ? (
                    <img src={comment.author.image} alt={comment.author.name || ''} className="h-full w-full object-cover" />
                ) : (
                    (comment.author.nickname || comment.author.name)?.slice(0, 1).toUpperCase()
                )}
            </div>
            <div className="flex-1">
                <div className="bg-card px-4 py-2 rounded-2xl rounded-tl-none border border-border/50 inline-block min-w-[200px] relative">
                    <div className="flex justify-between items-baseline gap-4 mb-0.5">
                        <span className="text-sm font-medium">{comment.author.nickname || comment.author.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: dateLocale })}
                        </span>
                    </div>
                    <p className="text-sm text-foreground/90">{comment.content}</p>

                    {showDelete && (
                        <button
                            onClick={handleDelete}
                            className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600 transition-colors"
                            title={t('admin.delete')}
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
