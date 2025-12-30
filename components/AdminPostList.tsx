'use client';

import { useConfirmDialog } from '@/components/ConfirmDialog';
import { deleteBookDiscussions } from '@/lib/admin';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface AdminPostListProps {
    books: {
        id: string;
        title: string;
        author: string | null;
        coverUrl: string | null;
        totalComments: number;
        _count: {
            posts: number;
        }
    }[];
}

export function AdminPostList({ books }: AdminPostListProps) {
    const { confirm } = useConfirmDialog();
    const { t, locale } = useLanguage();

    const handleDelete = async (bookId: string) => {
        if (await confirm(t('admin.deleteDiscussionsConfirm'))) {
            await deleteBookDiscussions(bookId);
        }
    };

    return (
        <div className="space-y-3">
            {books.map((book) => (
                <div key={book.id} className="flex items-center gap-3 p-4 bg-card rounded-xl border-2 border-border">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {book.coverUrl ? (
                            <img src={book.coverUrl} alt={book.title} className="w-12 h-16 object-cover rounded border border-border/10" />
                        ) : (
                            <div className="w-12 h-16 bg-secondary rounded flex items-center justify-center text-xs text-muted-foreground">
                                No Cover
                            </div>
                        )}
                        <div>
                            <h3 className="font-medium text-lg line-clamp-1">{book.title}</h3>
                            <p className="text-sm text-muted-foreground">{book.author}</p>
                            <p className="text-sm font-medium text-primary mt-1">
                                {book._count.posts} {locale === 'zh' ? '帖子' : 'Posts'} / {book.totalComments} {locale === 'zh' ? '评论' : 'Comments'}
                            </p>
                        </div>
                    </div>

                    {book._count.posts > 0 && (
                        <button
                            onClick={() => handleDelete(book.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title={t('admin.delete')}
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
