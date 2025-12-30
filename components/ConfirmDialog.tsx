'use client';

import { useState, createContext, useContext, ReactNode } from 'react';
import { useLanguage } from '@/contexts/language-context';

interface ConfirmDialogContextType {
    confirm: (message: string) => Promise<boolean>;
    alert: (message: string) => Promise<void>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | null>(null);

export function useConfirmDialog() {
    const context = useContext(ConfirmDialogContext);
    if (!context) {
        throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
    }
    return context;
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isAlertMode, setIsAlertMode] = useState(false);
    const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);
    const { t } = useLanguage();

    const confirm = (msg: string): Promise<boolean> => {
        setMessage(msg);
        setIsAlertMode(false);
        setIsOpen(true);
        return new Promise((resolve) => {
            setResolveRef(() => resolve);
        });
    };

    const alert = (msg: string): Promise<void> => {
        setMessage(msg);
        setIsAlertMode(true);
        setIsOpen(true);
        return new Promise((resolve) => {
            setResolveRef(() => () => resolve());
        });
    };

    const handleConfirm = () => {
        setIsOpen(false);
        resolveRef?.(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        resolveRef?.(false);
    };

    return (
        <ConfirmDialogContext.Provider value={{ confirm, alert }}>
            {children}

            {/* Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                        <p className="text-center text-lg font-medium text-gray-900 mb-6">{message}</p>
                        <div className="flex gap-3 justify-center">
                            {!isAlertMode && (
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                                >
                                    {t('common.cancel')}
                                </button>
                            )}
                            <button
                                onClick={handleConfirm}
                                className={`py-3 px-8 rounded-xl font-medium transition-colors ${isAlertMode
                                    ? 'bg-blue-500 text-white hover:bg-blue-600 min-w-[120px]'
                                    : 'flex-1 bg-red-500 text-white hover:bg-red-600'
                                    }`}
                            >
                                {isAlertMode ? 'OK' : t('common.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmDialogContext.Provider>
    );
}
