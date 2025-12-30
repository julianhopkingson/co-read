'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { deleteBook } from '@/lib/books';
import { useState } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { useConfirmDialog } from '@/components/ConfirmDialog';

interface BookCardProps {
    book: {
        id: string;
        title: string;
        author: string | null;
        coverUrl: string | null;
    };
    isAdmin: boolean;
    showDelete?: boolean;
}

export function BookCard({ book, isAdmin, showDelete = false }: BookCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { t } = useLanguage();
    const { confirm } = useConfirmDialog();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const confirmed = await confirm(t('books.confirmDelete'));
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            await deleteBook(book.id);
        } catch (error) {
            console.error('Failed to delete book:', error);
        }
        setIsDeleting(false);
    };

    return (
        <div className="relative flex flex-col gap-2">
            <Link href={`/reader/${book.id}`}>
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted shadow-sm transition-shadow hover:shadow-md border border-border/50">
                    {book.coverUrl ? (
                        <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        // Kindle-style title cover when no cover image
                        <div className="flex flex-col h-full w-full bg-gradient-to-b from-gray-50 to-gray-100 p-3">
                            {/* Top accent bar */}
                            <div className="h-2 w-full bg-primary rounded-full mb-4" />
                            {/* Title area */}
                            <div className="flex-1 flex flex-col justify-center px-1">
                                <h4 className="text-base font-bold text-gray-800 leading-snug line-clamp-4 text-center">
                                    {book.title}
                                </h4>
                                {book.author && (
                                    <p className="text-sm text-gray-500 mt-3 text-center line-clamp-2">
                                        {book.author}
                                    </p>
                                )}
                            </div>
                            {/* Bottom book icon */}
                            <div className="flex justify-center mt-auto pb-2">
                                <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M21 4H3a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1zM4 18V6h7v12H4zm9 0V6h7v12h-7z" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
            </Link>

            {/* Delete button - only visible when in edit mode */}
            {isAdmin && showDelete && (
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 disabled:opacity-50 z-10"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            )}

            <div className="space-y-1">
                <h3 className="font-medium leading-none truncate">{book.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{book.author}</p>
            </div>
        </div>
    );
}
