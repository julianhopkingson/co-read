'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-context';

export function BottomNav() {
    const pathname = usePathname();
    const { t } = useLanguage();

    const navItems = [
        {
            labelKey: 'nav.library' as const,
            href: '/books',
            icon: BookOpen,
        },
        {
            labelKey: 'nav.discuss' as const,
            href: '/discuss',
            icon: MessageCircle,
        },
        {
            labelKey: 'nav.profile' as const,
            href: '/profile',
            icon: User,
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-t border-border pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1",
                                isActive
                                    ? "text-[#8BC34A]"  // Green color for active
                                    : "text-muted-foreground hover:text-foreground transition-colors"
                            )}
                        >
                            <Icon
                                className="h-6 w-6"
                                strokeWidth={isActive ? 2.5 : 2}
                                fill={isActive ? "currentColor" : "none"}
                            />
                            <span className="text-[10px] font-medium tracking-wide">{t(item.labelKey)}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
