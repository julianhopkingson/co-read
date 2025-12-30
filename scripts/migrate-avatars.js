// Migration script: Rename old avatar files to new format (userId-timestamp.jpg)
// Run with: node scripts/migrate-avatars.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrateAvatars() {
    console.log('Starting avatar migration...');

    // Get all users with avatar images
    const users = await prisma.user.findMany({
        where: {
            image: { not: null }
        },
        select: {
            id: true,
            name: true,
            image: true
        }
    });

    console.log(`Found ${users.length} users with avatars`);

    const avatarsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');

    for (const user of users) {
        if (!user.image) continue;

        const oldFileName = user.image.replace('/uploads/avatars/', '');
        const oldFilePath = path.join(avatarsDir, oldFileName);

        // Check if already in new format (userId-timestamp.jpg)
        if (oldFileName.startsWith(user.id + '-')) {
            console.log(`[SKIP] ${user.name}: Already in new format`);
            continue;
        }

        // Generate new filename
        const timestamp = Date.now();
        const newFileName = `${user.id}-${timestamp}.jpg`;
        const newFilePath = path.join(avatarsDir, newFileName);
        const newImageUrl = `/uploads/avatars/${newFileName}`;

        try {
            // Check if old file exists
            if (!fs.existsSync(oldFilePath)) {
                console.log(`[ERROR] ${user.name}: Old file not found: ${oldFilePath}`);
                continue;
            }

            // Rename file
            fs.renameSync(oldFilePath, newFilePath);
            console.log(`[RENAME] ${user.name}: ${oldFileName} -> ${newFileName}`);

            // Update database
            await prisma.user.update({
                where: { id: user.id },
                data: { image: newImageUrl }
            });
            console.log(`[DB] ${user.name}: Updated image path`);

        } catch (err) {
            console.error(`[ERROR] ${user.name}:`, err.message);
        }
    }

    console.log('Migration complete!');
}

migrateAvatars()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
