'use client';

import { createPost } from '@/lib/community';
import { useRef, useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useRouter } from 'next/navigation';

interface Book {
    id: string;
    title: string;
}

interface CreatePostProps {
    books: Book[];
    defaultBookId?: string;
}

export function CreatePost({ books, defaultBookId }: CreatePostProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const { t } = useLanguage();
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    return (
        <>
            <form
                ref={formRef}
                action={async (formData) => {
                    const result = await createPost(formData);
                    if (result?.error) {
                        setErrorMessage(t('error.content.tooShort') || 'Content must be at least 3 characters');
                        return;
                    }
                    formRef.current?.reset();
                    router.refresh();
                }}
                className="bg-card p-4 rounded-xl border border-border shadow-sm"
            >
                <textarea
                    name="content"
                    placeholder={t('discuss.placeholder')}
                    className="w-full bg-transparent border-none resize-none focus:ring-2 focus:ring-[#8BC34A] focus:outline-none text-base placeholder:text-muted-foreground min-h-[80px] rounded-lg"
                    required
                />
                <input type="hidden" name="bookId" value={defaultBookId || ''} />
                <div className="flex items-center justify-end mt-2 pt-2 border-t border-border/50">
                    <button
                        type="submit"
                        className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all shadow-md active:scale-[0.8] active:bg-[#8BC34A]"
                    >
                        <SendHorizontal className="h-5 w-5" />
                    </button>
                </div>
            </form>

            {/* Error Modal */}
            {errorMessage && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setErrorMessage(null)} />
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                            <p className="text-center text-lg font-medium text-gray-900 mb-6">{errorMessage}</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setErrorMessage(null)}
                                    className="py-3 px-8 rounded-xl font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600 min-w-[120px]"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
