import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('pw123', 10)

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { name: 'admin' },
        update: { password },
        create: {
            name: 'admin',
            password,
            role: 'ADMIN',
        },
    })

    // Create User
    const user = await prisma.user.upsert({
        where: { name: 'user' },
        update: { password },
        create: {
            name: 'user',
            password,
            role: 'USER',
        },
    })

    console.log('✅ Demo users created:')
    console.log({ admin, user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
