'use client';

import { useLanguage } from "@/contexts/language-context";
import { usePathname } from "next/navigation";

export function LanguageToggle() {
    const { locale, setLocale } = useLanguage();
    const pathname = usePathname();

    // Hide on reader pages (individual book pages like /reader/[id])
    const isReaderPage = pathname.startsWith('/reader/');
    if (isReaderPage) {
        return null;
    }

    const toggleLanguage = () => {
        setLocale(locale === 'en' ? 'zh' : 'en');
    };

    return (
        <button
            onClick={toggleLanguage}
            className="fixed top-[14px] right-4 z-50 w-11 h-11 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md flex items-center justify-center text-sm font-medium transition-all hover:scale-125 active:scale-[0.8]"
            title={locale === 'en' ? '切换到中文' : 'Switch to English'}
        >
            {locale === 'en' ? 'CN' : 'US'}
        </button>
    );
}
