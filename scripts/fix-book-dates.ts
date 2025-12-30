import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Update all books to set lastAccessedAt = createdAt
    const books = await prisma.book.findMany()

    for (const book of books) {
        await prisma.book.update({
            where: { id: book.id },
            data: { lastAccessedAt: book.createdAt }
        })
        console.log(`Updated book: ${book.title}`)
    }

    console.log(`Updated ${books.length} books`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
