'use client';

import { Trash2, ArrowLeft, Plus, Pencil } from 'lucide-react';
import Link from 'next/link';
import { ManageUsersTitle } from '@/components/T';
import { useLanguage } from '@/contexts/language-context';
import { formatDistanceToNow } from 'date-fns';
import { deleteUser } from '@/lib/admin';

interface User {
    id: string;
    name: string;
    role: string;
    createdAt: Date;
}

export function UsersClient({ users }: { users: User[] }) {
    const { t } = useLanguage();

    const adminCount = users.filter((u) => u.role === 'ADMIN').length;

    const getRoleLabel = (role: string) => {
        return role === 'ADMIN' ? t('profile.role.admin') : t('profile.role.user');
    };

    const handleDelete = async (userId: string) => {
        await deleteUser(userId);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header with back button */}
            <div className="relative flex items-center justify-center min-h-10">
                <div className="absolute left-0 flex items-center gap-2">
                    <Link href="/admin" className="p-3 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors shadow-md">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <ManageUsersTitle />
                </div>

                <div className="absolute right-0 mr-14">
                    <Link href="/admin/users/create" className="p-3 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors shadow-md inline-flex">
                        <Plus className="h-5 w-5" />
                    </Link>
                </div>
            </div>

            <div className="space-y-3">
                {users.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-4 bg-card rounded-xl border-2 border-border">
                        <div className="flex-1 min-w-0">
                            <div className="font-medium">{user.name}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                    {getRoleLabel(user.role)}
                                </span>
                                <span>{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href={`/admin/users/${user.id}/edit`}
                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                <Pencil className="h-5 w-5" />
                            </Link>
                            {/* Hide delete button if this is the last admin */}
                            {!(user.role === 'ADMIN' && adminCount <= 1) && (
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
}
