'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { revalidatePath } from 'next/cache';

export async function updateUserAvatar(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    const userId = formData.get('userId') as string;
    const imageFile = formData.get('image') as File | null;

    // Users can only update their own avatar (unless admin)
    if (session.user.id !== userId && session.user.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    if (!imageFile || imageFile.size === 0) {
        return { error: 'No image provided' };
    }

    try {
        // Get current user to find old avatar path
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { image: true }
        });

        // Delete old avatar file if exists
        if (currentUser?.image) {
            const oldAvatarPath = path.join(process.cwd(), 'public', currentUser.image);
            if (existsSync(oldAvatarPath)) {
                try {
                    await unlink(oldAvatarPath);
                    console.log('Deleted old avatar:', oldAvatarPath);
                } catch (err) {
                    console.error('Failed to delete old avatar:', err);
                    // Continue even if deletion fails
                }
            }
        }

        // Save new avatar
        const avatarsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
        if (!existsSync(avatarsDir)) {
            await mkdir(avatarsDir, { recursive: true });
        }

        const fileName = `${userId}-${Date.now()}.jpg`;
        const filePath = path.join(avatarsDir, fileName);
        const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
        await writeFile(filePath, fileBuffer);

        const imageUrl = `/uploads/avatars/${fileName}`;

        // Update user in database
        await prisma.user.update({
            where: { id: userId },
            data: { image: imageUrl }
        });

        revalidatePath('/profile');
        revalidatePath('/admin/users');

        return { success: true };
    } catch (error) {
        console.error('Failed to update avatar:', error);
        return { error: 'error.avatar.updateFailed' };
    }
}
