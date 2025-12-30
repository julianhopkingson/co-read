'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '@/locales/en';
import { zh } from '@/locales/zh';

type Locale = 'en' | 'zh';

type Translations = typeof en;

const translations: Record<Locale, Translations> = { en, zh };

type LanguageContextType = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: keyof Translations) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');

    useEffect(() => {
        const saved = localStorage.getItem('locale') as Locale;
        if (saved && (saved === 'en' || saved === 'zh')) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (l: Locale) => {
        setLocaleState(l);
        localStorage.setItem('locale', l);
    };

    const t = (key: keyof Translations): string => {
        return translations[locale][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
