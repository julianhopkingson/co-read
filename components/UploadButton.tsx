'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { uploadBook, checkDuplicateBook } from '@/lib/books';
import { useLanguage } from '@/contexts/language-context';
import { useConfirmDialog } from '@/components/ConfirmDialog';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function UploadButton() {
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useLanguage();
    const { alert } = useConfirmDialog();

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.epub')) {
            await alert(t('books.uploadError.format'));
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            await alert(t('books.uploadError.size'));
            return;
        }

        setIsLoading(true);

        try {
            // Check for duplicate book before upload
            const duplicateCheck = await checkDuplicateBook(file.name, file.size);
            if (duplicateCheck.isDuplicate) {
                await alert(t('books.uploadError.duplicate'));
                setIsLoading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            // Dynamically import epubjs only when needed
            const ePub = (await import('epubjs')).default;

            // Parse epub metadata
            const book = ePub(await file.arrayBuffer());
            const meta = await book.loaded.metadata;
            const coverUrl = await book.coverUrl();

            // Convert cover to base64
            let coverBase64 = null;
            if (coverUrl) {
                const response = await fetch(coverUrl);
                const blob = await response.blob();
                coverBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });
            }

            // Build form data
            const formData = new FormData();
            formData.append('file', file);
            if (meta.title) formData.append('title', meta.title);
            if (meta.creator) formData.append('author', meta.creator);
            if (coverBase64) formData.append('cover', coverBase64);

            await uploadBook(formData);
        } catch (error: any) {
            if (error?.digest?.includes('NEXT_REDIRECT')) {
                // Expected redirect
            } else {
                console.error('Upload error:', error);
            }
        }

        setIsLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept=".epub"
                className="hidden"
                onChange={handleChange}
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md"
            >
                {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <Upload className="h-5 w-5" />
                )}
            </button>
        </>
    );
}
