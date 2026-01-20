"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "full";
}

export default function BaseModal({ isOpen, onClose, title, children, size = "md" }: BaseModalProps) {
    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[101] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className={`
                                bg-white w-full rounded-3xl shadow-2xl overflow-hidden pointer-events-auto relative
                                ${size === "sm" ? "max-w-md" : ""}
                                ${size === "md" ? "max-w-lg" : ""}
                                ${size === "lg" ? "max-w-4xl" : ""}
                                ${size === "xl" ? "max-w-7xl" : ""}
                                ${size === "full" ? "max-w-[95vw]" : ""}
                            `}
                        >
                            {/* Header */}
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8 max-h-[80vh] overflow-y-auto">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
