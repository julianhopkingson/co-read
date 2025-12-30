import { getBook, updateBookAccess } from '@/lib/books';
import Reader from '@/components/Reader';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';

export default async function ReaderPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const [book, session] = await Promise.all([
        getBook(id),
        auth()
    ]);

    if (!book) {
        notFound();
    }

    // Update last accessed time if user is logged in
    // Moved to client side to avoid revalidatePath during render issues

    return <Reader bookData={book} currentUserId={session?.user?.id} />;
}
