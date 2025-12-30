'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SimpleModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
}

export function SimpleModal({ isOpen, onClose, title = "Error", message }: SimpleModalProps) {
    const [show, setShow] = useState(isOpen);

    useEffect(() => {
        setShow(isOpen);
    }, [isOpen]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center space-y-4">
                    {/* Icon or Header */}
                    <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <X className="w-6 h-6 text-red-600" />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            className="py-3 px-8 rounded-xl font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600 min-w-[120px]"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
