'use client';

import { Pencil } from 'lucide-react';

interface EditButtonProps {
    isEditing: boolean;
    onClick: () => void;
}

export function EditButton({ isEditing, onClick }: EditButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`p-3 rounded-full transition-colors shadow-md ${isEditing
                    ? 'bg-orange-500 text-white'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
        >
            <Pencil className="h-5 w-5" />
        </button>
    );
}
