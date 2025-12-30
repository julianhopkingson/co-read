import { getBooks } from '@/lib/books';
import { auth } from '@/auth';
import { BooksClient } from '@/components/BooksClient';

export default async function BooksPage() {
    const session = await auth();
    const books = await getBooks(session?.user?.id);
    const isAdmin = session?.user?.role === 'ADMIN';

    return <BooksClient books={books} isAdmin={isAdmin} />;
}
