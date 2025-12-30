'use client';

import { useLanguage } from '@/contexts/language-context';

import { BookOpen } from 'lucide-react';

export function AppBrandName({ className = '' }: { className?: string }) {
    const { locale } = useLanguage();
    if (locale === 'zh') {
        return (
            <span className={className}>
                <span className="text-5xl text-sky-500">共</span>
                <BookOpen className="inline-block w-5 h-5 text-gray-300 mx-0.5 -translate-y-1" />
                <span className="text-5xl text-sky-500">读</span>
            </span>
        );
    }
    return (
        <span className={className}>
            <span className="text-5xl text-sky-500">Co</span>
            <BookOpen className="inline-block w-5 h-5 text-gray-300 mx-0.5 -translate-y-1" />
            <span className="text-5xl text-sky-500">Read</span>
        </span>
    );
}

export function EmptyLibraryMessage() {
    const { t } = useLanguage();
    return (
        <div className="text-center py-20 text-muted-foreground">
            <p>{t('books.empty')}</p>
        </div>
    );
}

export function BooksPageTitle() {
    const { t } = useLanguage();
    return (
        <h1 className="text-2xl font-serif tracking-tight">{t('books.title')}</h1>
    );
}

export function DiscussPageTitle() {
    const { t } = useLanguage();
    return (
        <h1 className="text-2xl font-serif tracking-tight">{t('discuss.title')}</h1>
    );
}

export function ProfilePageTitle() {
    const { t } = useLanguage();
    return (
        <h1 className="text-2xl font-serif tracking-tight">{t('profile.title')}</h1>
    );
}

export function AdminPageTitle() {
    const { t } = useLanguage();
    return (
        <h1 className="text-2xl font-serif tracking-tight leading-none translate-y-1">{t('admin.title')}</h1>
    );
}

export function SignOutButton() {
    const { t } = useLanguage();
    return (
        <button className="w-full py-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors">
            {t('profile.signout')}
        </button>
    );
}

export function AdminDashboardLink() {
    const { t } = useLanguage();
    return (
        <span>{t('profile.admin')}</span>
    );
}

export function BooksUploadedLabel() {
    const { t } = useLanguage();
    return (
        <span className="text-sm text-muted-foreground">{t('profile.books')}</span>
    );
}

export function ContributionsLabel() {
    const { t } = useLanguage();
    return (
        <span className="text-sm text-muted-foreground">{t('profile.contributions')}</span>
    );
}

// Admin
export function TotalUsersLabel() {
    const { t } = useLanguage();
    return <p className="text-sm font-medium text-muted-foreground">{t('admin.totalUsers')}</p>;
}

export function TotalBooksLabel() {
    const { t } = useLanguage();
    return <p className="text-sm font-medium text-muted-foreground">{t('admin.totalBooks')}</p>;
}

export function TotalPostsLabel() {
    const { t } = useLanguage();
    return <p className="text-sm font-medium text-muted-foreground">{t('admin.totalPosts')}</p>;
}

// Feed
export function FeedEmptyMessage() {
    const { t } = useLanguage();
    return (
        <div className="text-center py-10 text-muted-foreground">
            <p>{t('discuss.empty')}</p>
        </div>
    );
}

// Profile Role Badge
export function RoleBadge({ role }: { role: string }) {
    const { t } = useLanguage();
    const roleKey = role === 'ADMIN' ? 'profile.role.admin' : 'profile.role.user';
    return (
        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {t(roleKey as any)}
        </div>
    );
}

// Admin management titles
export function ManageBooksTitle() {
    const { t } = useLanguage();
    return <h1 className="text-2xl font-serif tracking-tight leading-none translate-y-1">{t('admin.manageBooks')}</h1>;
}

export function ManageUsersTitle() {
    const { t } = useLanguage();
    return <h1 className="text-2xl font-serif tracking-tight leading-none translate-y-1">{t('admin.manageUsers')}</h1>;
}

export function ManagePostsTitle() {
    const { t } = useLanguage();
    return <h1 className="text-2xl font-serif tracking-tight leading-none translate-y-1">{t('admin.managePosts')}</h1>;
}
