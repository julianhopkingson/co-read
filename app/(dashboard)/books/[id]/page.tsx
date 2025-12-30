import { getBook } from '@/lib/books';
import Reader from '@/components/Reader';
import { notFound } from 'next/navigation';

export default async function ReaderPage({ params }: { params: { id: string } }) {
    const { id } = await params; // Await params in newer Next.js versions if needed, or strictly types
    const book = await getBook(id);

    if (!book) {
        notFound();
    }

    // Hide BottomNav in Reader view if possible, or Reader covers it with high z-index
    // Ideally we use a different layout, but for now we can just make Reader fullscreen

    return (
        <div className="fixed inset-0 z-[100] bg-background">
            <Reader bookData={book} />
        </div>
    );
}
