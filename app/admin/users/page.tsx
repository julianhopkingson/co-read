import { getAllUsers } from '@/lib/admin';
import { UsersClient } from '@/components/UsersClient';

export default async function AdminUsersPage() {
    const users = await getAllUsers();
    return <UsersClient users={users} />;
}
