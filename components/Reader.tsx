'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ePub from 'epubjs';
import { Book } from '@prisma/client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { updateBookAccess } from '@/lib/books';

interface ReaderProps {
    bookData: Book;
    currentUserId?: string;
}

// ... (ReadingProgress, themeStyles, helpers omitted for brevity if not changed)

interface ReadingProgress {
    location: string | null;
    theme: 'light' | 'dark' | 'sepia';
    fontSize: number;
    updatedAt: number;
}

const themeStyles = {
    light: {
        bg: 'bg-white',
        viewerBg: '#ffffff',
        text: 'text-gray-900',
        textColor: '#1a1a1a',
        border: 'border-gray-200'
    },
    sepia: {
        bg: 'bg-[#f6f1d1]',
        viewerBg: '#f6f1d1',
        text: 'text-[#5f4b32]',
        textColor: '#5f4b32',
        border: 'border-[#d9d0b0]'
    },
    dark: {
        bg: 'bg-[#1a1a1a]',
        viewerBg: '#1a1a1a',
        text: 'text-gray-100',
        textColor: '#e5e5e5',
        border: 'border-gray-700'
    },
};

// Helper functions for localStorage
function getProgressKey(bookId: string): string {
    return `reading-progress-${bookId}`;
}

function loadProgress(bookId: string): ReadingProgress | null {
    try {
        const stored = localStorage.getItem(getProgressKey(bookId));
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Failed to load reading progress:', e);
    }
    return null;
}

function saveProgress(bookId: string, progress: ReadingProgress): void {
    try {
        localStorage.setItem(getProgressKey(bookId), JSON.stringify(progress));
    } catch (e) {
        console.error('Failed to save reading progress:', e);
    }
}

export default function Reader({ bookData, currentUserId }: ReaderProps) {
    const viewerRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<any>(null);
    const [rendition, setRendition] = useState<any>(null);
    const [isReady, setIsReady] = useState(false);

    // Initial access update
    useEffect(() => {
        if (currentUserId && bookData.id) {
            updateBookAccess(bookData.id, currentUserId).catch(console.error);
        }
    }, [bookData.id, currentUserId]);

    // Load saved progress or use defaults
    const savedProgress = typeof window !== 'undefined' ? loadProgress(bookData.id) : null;
    const [fontSize, setFontSize] = useState(savedProgress?.fontSize ?? 100);
    const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>(savedProgress?.theme ?? 'light');
    const [currentLocation, setCurrentLocation] = useState<string | null>(savedProgress?.location ?? null);

    // Apply theme to rendition
    const applyTheme = useCallback((rend: any, themeName: 'light' | 'dark' | 'sepia') => {
        if (!rend) return;

        const style = themeStyles[themeName];
        rend.themes.override('color', style.textColor);
        rend.themes.override('background', style.viewerBg);
        rend.themes.override('background-color', style.viewerBg);
        rend.themes.select(themeName);
    }, []);

    // Save progress whenever it changes
    const persistProgress = useCallback((location?: string) => {
        const progress: ReadingProgress = {
            location: location ?? currentLocation,
            theme,
            fontSize,
            updatedAt: Date.now(),
        };
        saveProgress(bookData.id, progress);
    }, [bookData.id, currentLocation, theme, fontSize]);

    useEffect(() => {
        if (!viewerRef.current) return;

        const book = ePub(bookData.fileUrl);
        bookRef.current = book;

        const rend = book.renderTo(viewerRef.current, {
            width: '100%',
            height: '100%',
            flow: 'paginated',
            spread: 'none',
        });

        // Register all themes
        rend.themes.register('light', {
            body: {
                color: '#1a1a1a !important',
                background: '#ffffff !important',
                'background-color': '#ffffff !important'
            }
        });
        rend.themes.register('dark', {
            body: {
                color: '#e5e5e5 !important',
                background: '#1a1a1a !important',
                'background-color': '#1a1a1a !important'
            }
        });
        rend.themes.register('sepia', {
            body: {
                color: '#5f4b32 !important',
                background: '#f6f1d1 !important',
                'background-color': '#f6f1d1 !important'
            }
        });

        // Display from saved location or start
        const startLocation = savedProgress?.location || undefined;
        rend.display(startLocation).then(() => {
            applyTheme(rend, theme);
            rend.themes.fontSize(`${fontSize}%`);
            setIsReady(true);
        });

        // Listen for location changes
        rend.on('relocated', (location: any) => {
            const cfi = location.start.cfi;
            setCurrentLocation(cfi);
        });

        setRendition(rend);

        return () => {
            if (bookRef.current) {
                bookRef.current.destroy();
            }
        };
    }, [bookData.fileUrl, theme, fontSize]); // Added dependencies to re-render if needed but mostly stable

    // Save on page turn
    useEffect(() => {
        if (isReady && currentLocation) {
            persistProgress(currentLocation);
        }
    }, [currentLocation, isReady]);

    // Save on settings change
    useEffect(() => {
        if (isReady) {
            persistProgress();
        }
    }, [theme, fontSize, isReady]);

    // Save before leaving
    useEffect(() => {
        const handleBeforeUnload = () => {
            persistProgress();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            persistProgress(); // Also save on unmount
        };
    }, [persistProgress]);

    const prevPage = () => rendition?.prev();
    const nextPage = () => rendition?.next();

    useEffect(() => {
        if (rendition) {
            rendition.themes.fontSize(`${fontSize}%`);
        }
    }, [fontSize, rendition]);

    useEffect(() => {
        if (rendition) {
            applyTheme(rendition, theme);
        }
    }, [theme, rendition, applyTheme]);

    const currentTheme = themeStyles[theme];

    return (
        <div className={cn("flex flex-col h-screen max-h-screen overflow-hidden transition-colors duration-300", currentTheme.bg)}>
            {/* Header */}
            <header className={cn("h-14 flex items-center justify-between px-4 border-b z-10", currentTheme.bg, currentTheme.text, currentTheme.border)}>
                <Link href="/books" className="p-3 rounded-full bg-secondary/80 text-secondary-foreground hover:bg-secondary transition-colors shadow-md">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="font-serif font-medium truncate max-w-[60%] text-center">
                    {bookData.title}
                </h1>
                <div className="w-9" />
            </header>

            {/* Viewer */}
            <div
                className="flex-1 relative transition-colors duration-300"
                style={{ backgroundColor: currentTheme.viewerBg }}
            >
                <div ref={viewerRef} className="h-full w-full" />

                {/* Navigation Zones */}
                <div className="absolute inset-y-0 left-0 w-16 z-0" onClick={prevPage} />
                <div className="absolute inset-y-0 right-0 w-16 z-0" onClick={nextPage} />
            </div>

            {/* Controls */}
            <div className={cn("h-16 flex items-center justify-between px-8 border-t z-10", currentTheme.bg, currentTheme.text, currentTheme.border)}>
                <button
                    onClick={() => setFontSize(s => Math.max(80, s - 10))}
                    className="text-lg font-serif opacity-70 hover:opacity-100"
                >
                    A-
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => setTheme('light')}
                        className={cn(
                            "w-7 h-7 rounded-full bg-white border-2 transition-all",
                            theme === 'light' ? "border-blue-500 ring-2 ring-blue-500/30" : "border-gray-300"
                        )}
                    />
                    <button
                        onClick={() => setTheme('sepia')}
                        className={cn(
                            "w-7 h-7 rounded-full bg-[#f6f1d1] border-2 transition-all",
                            theme === 'sepia' ? "border-blue-500 ring-2 ring-blue-500/30" : "border-gray-300"
                        )}
                    />
                    <button
                        onClick={() => setTheme('dark')}
                        className={cn(
                            "w-7 h-7 rounded-full bg-[#1a1a1a] border-2 transition-all",
                            theme === 'dark' ? "border-blue-500 ring-2 ring-blue-500/30" : "border-gray-600"
                        )}
                    />
                </div>
                <button
                    onClick={() => setFontSize(s => Math.min(150, s + 10))}
                    className="text-xl font-serif opacity-70 hover:opacity-100"
                >
                    A+
                </button>
            </div>
        </div>
    );
}
