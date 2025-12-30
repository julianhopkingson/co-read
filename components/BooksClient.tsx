'use client';

import { useState } from 'react';
import { BookCard } from '@/components/BookCard';
import { UploadButton } from '@/components/UploadButton';
import { EditButton } from '@/components/EditButton';
import { BooksPageTitle, EmptyLibraryMessage } from '@/components/T';

interface Book {
    id: string;
    title: string;
    author: string | null;
    coverUrl: string | null;
}

interface BooksClientProps {
    books: Book[];
    isAdmin: boolean;
}

export function BooksClient({ books, isAdmin }: BooksClientProps) {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header with title, edit button and upload button */}
            <div className="relative flex items-center justify-center mb-6 min-h-10">
                <div className="absolute left-0">
                    <BooksPageTitle />
                </div>
                {isAdmin && (
                    <div className="absolute right-0 mr-14 flex items-center gap-3">
                        <UploadButton />
                        <EditButton
                            isEditing={isEditing}
                            onClick={() => setIsEditing(!isEditing)}
                        />
                    </div>
                )}
            </div>

            {/* Book grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {books.map((book) => (
                    <BookCard
                        key={book.id}
                        book={book}
                        isAdmin={isAdmin}
                        showDelete={isEditing}
                    />
                ))}
            </div>

            {books.length === 0 && <EmptyLibraryMessage />}
        </div>
    );
}
