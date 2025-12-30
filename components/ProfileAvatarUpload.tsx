'use client';

import { useState, useRef, useEffect } from 'react';
import { ImageCropper } from '@/components/ImageCropper';
import { updateUserAvatar } from '@/lib/profile';
import { useRouter } from 'next/navigation';

interface ProfileAvatarUploadProps {
    userId: string;
    currentImage: string | null;
    displayName: string;
}

export function ProfileAvatarUpload({ userId, currentImage, displayName }: ProfileAvatarUploadProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result as string);
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(file);
        }
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setIsUploading(true);

        // Create preview immediately
        const url = URL.createObjectURL(croppedBlob);
        setPreviewUrl(url);

        try {
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('image', croppedBlob, 'avatar.jpg');

            await updateUserAvatar(formData);
            router.refresh();
        } catch (error) {
            console.error('Failed to update avatar:', error);
            // Revert to old image on error
            setPreviewUrl(currentImage);
        } finally {
            setIsUploading(false);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            <div
                onClick={handleAvatarClick}
                className={`h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-3xl font-medium text-secondary-foreground overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative ${isUploading ? 'opacity-50' : ''}`}
            >
                {previewUrl ? (
                    <img src={previewUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                    displayName?.slice(0, 1).toUpperCase()
                )}
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {imageSrc && (
                <ImageCropper
                    isOpen={isCropperOpen}
                    onClose={() => setIsCropperOpen(false)}
                    imageSrc={imageSrc}
                    onCropComplete={handleCropComplete}
                />
            )}
        </>
    );
}
