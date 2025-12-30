'use client';

import { deletePost } from '@/lib/community';
import { Trash2 } from 'lucide-react';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { useLanguage } from '@/contexts/language-context';
import { useRouter } from 'next/navigation';

interface DeletePostButtonProps {
    postId: string;
    authorId?: string;
    currentUserId?: string;
    currentUserRole?: string;
    className?: string;
}

export function DeletePostButton({ postId, authorId, currentUserId, currentUserRole, className }: DeletePostButtonProps) {
    const { confirm } = useConfirmDialog();
    const { t } = useLanguage();
    const router = useRouter();

    // Only Admin can delete
    if (currentUserRole !== 'ADMIN') return null;

    const handleDelete = async () => {
        if (await confirm(t('admin.deleteDiscussionsConfirm'))) {
            await deletePost(postId);
            router.push('/discuss'); // Redirect after delete since we are on detail page
        }
    };

    return (
        <button
            onClick={handleDelete}
            className={className}
            title={t('admin.delete')}
        >
            <Trash2 className="h-5 w-5" />
        </button>
    );
}
