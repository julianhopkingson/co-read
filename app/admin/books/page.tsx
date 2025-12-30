import { getAllBooks, deleteBook } from '@/lib/admin';
import { Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ManageBooksTitle } from '@/components/T';

export default async function AdminBooksPage() {
    const books = await getAllBooks();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header with back button */}
            <div className="relative flex items-center justify-center min-h-10 mb-6">
                <div className="absolute left-0 flex items-center gap-2">
                    <Link href="/admin" className="p-3 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors shadow-md">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <ManageBooksTitle />
                </div>
            </div>

            <div className="space-y-3">
                {books.map((book) => (
                    <div key={book.id} className="flex items-center gap-3 p-4 bg-card rounded-xl border-2 border-border">
                        {book.coverUrl && (
                            <img src={book.coverUrl} alt="" className="h-14 w-10 object-cover bg-muted rounded flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{book.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{book.author}</div>
                        </div>
                        <form action={async () => {
                            'use server';
                            await deleteBook(book.id);
                        }}>
                            <button className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                ))}
            </div>
        </div>
    );
}
