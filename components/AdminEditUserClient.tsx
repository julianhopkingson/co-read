'use client';

import { useActionState, useState, useEffect } from 'react';
import { updateUser } from '@/lib/admin';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { SimpleModal } from '@/components/SimpleModal';

function SimpleLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
    return <label htmlFor={htmlFor} className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">{children}</label>
}

import { ImageCropper } from '@/components/ImageCropper';

// We pass the user data as props
export default function AdminEditUserPage({ params, user }: { params: { id: string }, user: any }) {
    // We bind the userId to the server action
    // But useActionState expects (state, payload). We can use a hidden input for userId.
    const [state, dispatch] = useActionState(updateUser, undefined);
    const { t } = useLanguage();
    const [showPassword, setShowPassword] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Image Cropper State
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user.image || null);

    useEffect(() => {
        if (state?.message) {
            setIsModalOpen(true);
        }
    }, [state?.message]);

    useEffect(() => {
        if (croppedBlob) {
            const url = URL.createObjectURL(croppedBlob);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [croppedBlob]);

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
    };

    const handleFormSubmit = (formData: FormData) => {
        if (croppedBlob) {
            formData.set('image', croppedBlob, 'avatar.jpg');
        }
        dispatch(formData);
    };

    if (!user) {
        return <div>User not found</div>
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans relative">
            <SimpleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={t('admin.editUser.title') || 'Error'}
                message={(state?.message && t(state.message as any)) || state?.message || ''}
            />

            {/* Cropper Modal */}
            {imageSrc && (
                <ImageCropper
                    isOpen={isCropperOpen}
                    onClose={() => setIsCropperOpen(false)}
                    imageSrc={imageSrc}
                    onCropComplete={(blob) => setCroppedBlob(blob)}
                />
            )}

            {/* Back Button */}
            <Link href="/admin/users" className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-6 h-6 text-gray-700" />
            </Link>

            {/* Header */}
            <div className="w-full max-w-sm flex flex-col items-center mb-8">
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight mb-8">
                    {t('admin.editUser.title') || 'Edit User'}
                </h1>
            </div>

            {/* Form */}
            <div className="w-full max-w-sm space-y-6">
                <form action={handleFormSubmit} className="space-y-5">
                    <input type="hidden" name="userId" value={user.id} />

                    {/* Role */}
                    <div className="space-y-1">
                        <SimpleLabel htmlFor="role">{t('admin.role') || 'Role'}</SimpleLabel>
                        <select
                            id="role"
                            name="role"
                            className="flex h-10 w-full rounded-md bg-gray-100 border-none px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                            defaultValue={state?.inputs?.role || user.role}
                        >
                            <option value="USER">{t('profile.role.user')}</option>
                            <option value="ADMIN">{t('profile.role.admin')}</option>
                        </select>
                    </div>

                    {/* Username */}
                    <div className="space-y-1">
                        <SimpleLabel htmlFor="name">{t('register.username')}</SimpleLabel>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="username"
                            required
                            defaultValue={state?.inputs?.name || user.name}
                            className="bg-gray-100 border-none"
                        />
                    </div>

                    {/* Nickname */}
                    <div className="space-y-1">
                        <SimpleLabel htmlFor="nickname">{t('register.nickname') || 'Nickname'}</SimpleLabel>
                        <Input
                            id="nickname"
                            name="nickname"
                            type="text"
                            placeholder="nickname"
                            required
                            defaultValue={state?.inputs?.nickname || user.nickname}
                            className="bg-gray-100 border-none"
                        />
                    </div>

                    {/* Avatar */}
                    <div className="space-y-1">
                        <SimpleLabel htmlFor="image">{t('admin.avatar') || 'Avatar'}</SimpleLabel>
                        <div className="flex items-center gap-4">
                            {previewUrl && (
                                <img src={previewUrl} alt="Current Avatar" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
                            )}
                            <div className="relative">
                                <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                                    {t('common.selectImage') || 'Select Image'}
                                </Button>
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password - Optional */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <SimpleLabel htmlFor="password">{t('register.password')}</SimpleLabel>
                            <span className="text-xs text-gray-400 font-normal">{t('admin.editUser.passwordHint') || 'Leave blank to keep current'}</span>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="bg-gray-100 border-none pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <SubmitButton />
                </form>
            </div>
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    const { t } = useLanguage();
    return (
        <Button className="w-full font-bold text-base shadow-lg shadow-blue-500/30" aria-disabled={pending}>
            {pending ? '...' : (t('admin.editUser.submit') || 'Update User')}
        </Button>
    );
}
