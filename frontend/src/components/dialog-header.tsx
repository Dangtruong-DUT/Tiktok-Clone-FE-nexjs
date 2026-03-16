"use client";

import { X, ChevronLeft } from "lucide-react";

interface DrawerHeaderProps {
    title: string;
    onClose?: () => void;
    onBack?: () => void;
}

export default function DialogHeader({ title, onClose, onBack }: DrawerHeaderProps) {
    return (
        <header className="px-2 flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="inline-flex items-center justify-center rounded-full text-foreground w-6 h-6 bg-input hover:bg-accent transition-colors cursor-pointer"
                    >
                        <ChevronLeft size={12} />
                    </button>
                )}
                <h2 className="text-2xl font-bold tracking-[0.3px] leading-[1.5625] font-secondary">{title}</h2>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="cursor-pointer w-7 h-7 rounded-full bg-input text-foreground hover:bg-accent transition-colors z"
                >
                    <X size={16} className="text-current m-auto" />
                </button>
            )}
        </header>
    );
}
