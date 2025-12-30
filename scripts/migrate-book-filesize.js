// Migration script: Populate fileSize and originalFileName for existing books
// Run with: node scripts/migrate-book-filesize.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Extract original filename from stored fileUrl (remove timestamp prefix)
function extractOriginalFileName(fileUrl) {
    // fileUrl format: /uploads/books/1766911150562-费曼思考法：5步成为学习高手_【美】彼得-霍林斯.epub
    const fileName = fileUrl.replace('/uploads/books/', '');
    // Decode URI
    const decoded = decodeURIComponent(fileName);
    // Remove timestamp prefix (format: timestamp-originalname.epub)
    const match = decoded.match(/^\d+-(.+)$/);
    return match ? match[1] : decoded;
}

async function migrateBookFileSizes() {
    console.log('Starting book fileSize migration...');

    const books = await prisma.book.findMany({
        select: {
            id: true,
            title: true,
            fileUrl: true,
            fileSize: true,
            originalFileName: true
        }
    });

    console.log(`Found ${books.length} books`);

    const booksDir = path.join(process.cwd(), 'public', 'uploads', 'books');

    for (const book of books) {
        // Skip if already has fileSize
        if (book.fileSize && book.originalFileName) {
            console.log(`[SKIP] ${book.title}: Already has fileSize`);
            continue;
        }

        // Get file path from fileUrl
        const fileName = decodeURIComponent(book.fileUrl.replace('/uploads/books/', ''));
        const filePath = path.join(booksDir, fileName);

        try {
            if (!fs.existsSync(filePath)) {
                console.log(`[ERROR] ${book.title}: File not found: ${filePath}`);
                continue;
            }

            const stats = fs.statSync(filePath);
            const fileSize = stats.size;
            const originalFileName = extractOriginalFileName(book.fileUrl);

            await prisma.book.update({
                where: { id: book.id },
                data: {
                    fileSize,
                    originalFileName
                }
            });

            console.log(`[OK] ${book.title}: fileSize=${fileSize}, originalFileName=${originalFileName}`);
        } catch (err) {
            console.error(`[ERROR] ${book.title}:`, err.message);
        }
    }

    console.log('Migration complete!');
}

migrateBookFileSizes()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
