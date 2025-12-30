'use client';

import { useState, useRef } from 'react';
import ePub from 'epubjs';
import { Upload, FileIcon, Loader2, X } from 'lucide-react';
import { uploadBook } from '@/lib/books';
import { useLanguage } from '@/contexts/language-context';

export function BookUpload() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [metadata, setMetadata] = useState<{ title?: string; author?: string; cover?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useLanguage();

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    };

    const processFile = async (file: File) => {
        if (file.type !== 'application/epub+zip') {
            alert('Please upload an EPUB file');
            return;
        }

        setIsLoading(true);
        setFile(file);

        try {
            const book = ePub(await file.arrayBuffer());
            const meta = await book.loaded.metadata;
            const coverUrl = await book.coverUrl();

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

            setMetadata({
                title: meta.title,
                author: meta.creator,
                cover: coverBase64 || undefined,
            });
        } catch (error) {
            console.error('Error parsing epub:', error);
            setMetadata({ title: file.name.replace('.epub', '') });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;
        setIsLoading(true);

        const formData = new FormData();
        formData.append('file', file);
        if (metadata?.title) formData.append('title', metadata.title);
        if (metadata?.author) formData.append('author', metadata.author);
        if (metadata?.cover) formData.append('cover', metadata.cover);

        try {
            await uploadBook(formData);
        } catch (error: any) {
            // NEXT_REDIRECT is expected, not an actual error
            if (error?.digest?.includes('NEXT_REDIRECT')) {
                // redirect will happen, just reset states
            } else {
                console.error('Upload error:', error);
            }
        }
        // Reset form after upload attempt
        setFile(null);
        setMetadata(null);
        setIsLoading(false);
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {!file ? (
                <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".epub"
                        className="hidden"
                        onChange={handleChange}
                    />
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-secondary/50 rounded-full">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-lg font-medium">{t('books.dropzone.title')}</p>
                            <p className="text-sm text-muted-foreground mt-1">{t('books.dropzone.subtitle')}</p>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            {t('books.selectFile')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="p-4 flex gap-4">
                        <div className="relative w-20 h-28 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                            {metadata?.cover ? (
                                <img
                                    src={metadata.cover}
                                    alt="Cover"
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full">
                                    <BookIcon className="h-8 w-8 text-muted-foreground/30" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{metadata?.title || t('books.unknownTitle')}</h3>
                            <p className="text-sm text-muted-foreground truncate">{metadata?.author || t('books.unknownAuthor')}</p>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <FileIcon className="h-3 w-3" />
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setFile(null);
                                setMetadata(null);
                            }}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-4 bg-muted/30 border-t border-border">
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isLoading ? t('books.uploading') : t('books.addToLibrary')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function BookIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    )
}
