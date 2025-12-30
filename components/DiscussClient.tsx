'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Pencil } from 'lucide-react';
import { PostCard } from '@/components/PostCard';
import { CreatePost } from '@/components/CreatePost';
import { DiscussPageTitle, FeedEmptyMessage } from '@/components/T';
import { useLanguage } from '@/contexts/language-context';
import { getBookContributors } from '@/lib/community';

interface Book {
    id: string;
    title: string;
    coverUrl: string | null;
}

interface Post {
    id: string;
    content: string;
    createdAt: Date;
    bookId: string | null;
    author: { id: string; name: string | null; image: string | null };
    book: { title: string; id: string } | null;
    _count: { comments: number; likes: number };
    likes: { userId: string }[];
}

interface Contributor {
    id: string;
    nickname: string;
    postCount: number;
}

interface DiscussClientProps {
    books: Book[];
    posts: Post[];
    currentUserId: string | undefined;
    currentUserRole: string | undefined;
}

const STORAGE_KEY = 'discuss_selected_book';

export function DiscussClient({ books, posts, currentUserId, currentUserRole }: DiscussClientProps) {
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [contributors, setContributors] = useState<Contributor[]>([]);
    const [showAllContributors, setShowAllContributors] = useState(false);
    const { t } = useLanguage();

    const isAdmin = currentUserRole === 'ADMIN';

    // Load saved selection from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && books.some(b => b.id === saved)) {
            setSelectedBookId(saved);
        }
    }, [books]);

    // Fetch contributors when book selection changes or posts change
    useEffect(() => {
        if (selectedBookId) {
            getBookContributors(selectedBookId).then(setContributors);
        } else {
            setContributors([]);
        }
    }, [selectedBookId, posts.length]);

    // Save selection to localStorage
    const handleSelectBook = (bookId: string | null) => {
        setSelectedBookId(bookId);
        if (bookId) {
            localStorage.setItem(STORAGE_KEY, bookId);
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
        setIsDropdownOpen(false);
    };

    const selectedBook = books.find(b => b.id === selectedBookId);

    // Filter posts by selected book
    const filteredPosts = selectedBookId
        ? posts.filter(p => p.bookId === selectedBookId)
        : posts;

    return (
        <div className="max-w-xl mx-auto space-y-4">
            <div className="relative flex items-center justify-center mb-6 min-h-10">
                <div className="absolute left-0">
                    <DiscussPageTitle />
                </div>
                {isAdmin && (
                    <div className="absolute right-0 mr-14">
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`p-3 rounded-full transition-colors shadow-md ${isEditMode ? 'bg-orange-500 text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                            title={isEditMode ? 'Finish Editing' : 'Edit Discussions'}
                        >
                            <Pencil className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Book Selector */}
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 bg-card border border-border rounded-xl hover:bg-secondary/50 transition-colors"
                >
                    <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                        {selectedBook?.coverUrl && (
                            <img src={selectedBook.coverUrl} alt="" className="h-8 w-6 object-cover rounded flex-shrink-0" />
                        )}
                        <span className={`truncate ${selectedBook ? 'font-medium' : 'text-muted-foreground'}`}>
                            {selectedBook?.title || t('discuss.selectBook')}
                        </span>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <>
                        {/* Backdrop to close dropdown when clicking outside */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                            <button
                                onClick={() => handleSelectBook(null)}
                                className="w-full text-left p-3 hover:bg-gray-100 transition-colors text-muted-foreground border-b border-border/50"
                            >
                                {t('discuss.allBooks')}
                            </button>
                            {books.map(book => (
                                <button
                                    key={book.id}
                                    onClick={() => handleSelectBook(book.id)}
                                    className={`w-full text-left p-3 hover:bg-gray-100 transition-colors flex items-center gap-3 ${selectedBookId === book.id ? 'bg-primary/10' : ''
                                        }`}
                                >
                                    {book.coverUrl && (
                                        <img src={book.coverUrl} alt="" className="h-8 w-6 object-cover rounded" />
                                    )}
                                    <span className="truncate">{book.title}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Contributors List - only show when a book is selected and has posts */}
            {selectedBookId && contributors.length > 0 && (
                <div className="p-3 bg-card border border-border rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">{t('discuss.topContributors') || 'Top 3 Contributors'}</h3>
                        {contributors.length > 3 && (
                            <button
                                onClick={() => setShowAllContributors(true)}
                                className="text-xs text-primary hover:underline"
                            >
                                {t('discuss.viewAll') || 'View All'}
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {contributors.slice(0, 3).map((c) => (
                            <span key={c.id} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary/50 rounded-full text-xs">
                                <span className="font-medium">{c.nickname}</span>
                                <span className="text-muted-foreground">({c.postCount})</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* All Contributors Modal */}
            {showAllContributors && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setShowAllContributors(false)} />
                    <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-xl shadow-2xl z-[100] p-4 max-h-[70vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">{t('discuss.allContributors') || 'All Contributors'}</h3>
                            <button onClick={() => setShowAllContributors(false)} className="text-muted-foreground hover:text-foreground text-xl">&times;</button>
                        </div>
                        <div className="space-y-2">
                            {contributors.map((c) => (
                                <div key={c.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
                                    <span className="font-medium">{c.nickname}</span>
                                    <span className="text-sm text-muted-foreground">{c.postCount} {t('discuss.post')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Create Post - only show when a book is selected */}
            {selectedBookId && <CreatePost books={books} defaultBookId={selectedBookId} />}

            {/* Posts */}
            <div className="space-y-4">
                {filteredPosts.map((post: any) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        currentUserId={currentUserId}
                        isEditMode={isEditMode}
                        currentUserRole={currentUserRole}
                    />
                ))}
                {filteredPosts.length === 0 && <FeedEmptyMessage />}
            </div>
        </div>
    );
}
