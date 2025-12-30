'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { BookOpen, MessageSquare, User, Shield } from 'lucide-react';

export default function NavLinks({ role }: { role?: string }) {
    const pathname = usePathname();

    const links = [
        { name: 'Books', href: '/books', icon: BookOpen },
        { name: 'Discuss', href: '/discuss', icon: MessageSquare },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    if (role === 'ADMIN') {
        links.push({ name: 'Admin', href: '/admin', icon: Shield });
    }

    return (
        <>
            {links.map((link) => {
                const LinkIcon = link.icon;
                const isActive = pathname === link.href;

                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={clsx(
                            'flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors',
                            {
                                'text-primary': isActive,
                                'text-muted-foreground hover:text-foreground': !isActive,
                            }
                        )}
                    >
                        <LinkIcon className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                        {link.name}
                    </Link>
                );
            })}
        </>
    );
}
