import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import AdminEditUserPage from '@/components/AdminEditUserClient'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
        redirect('/')
    }

    const { id } = await params
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            nickname: true,
            role: true,
        }
    })

    if (!user) {
        redirect('/admin/users')
    }

    return <AdminEditUserPage params={{ id }} user={user} />
}
