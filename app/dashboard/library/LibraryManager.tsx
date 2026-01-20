"use client";

import { useState } from "react";
import { Plus, Bookmark } from "lucide-react";
import BaseModal from "@/components/modals/BaseModal";
import BookForm from "@/components/modals/BookForm";
import LoanForm from "@/components/modals/LoanForm";

interface LibraryManagerProps {
    tenantId: string;
    books: { id: string; title: string; available: number }[];
}

export default function LibraryManager({ tenantId, books }: LibraryManagerProps) {
    const [isBookOpen, setIsBookOpen] = useState(false);
    const [isLoanOpen, setIsLoanOpen] = useState(false);

    return (
        <div className="flex gap-3">
            <button
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                onClick={() => setIsLoanOpen(true)}
            >
                <Bookmark className="w-5 h-5" />
                Novo Empréstimo
            </button>
            <button
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
                onClick={() => setIsBookOpen(true)}
            >
                <Plus className="w-5 h-5" />
                Adicionar Livro
            </button>

            <BaseModal
                isOpen={isBookOpen}
                onClose={() => setIsBookOpen(false)}
                title="Adicionar Novo Livro"
            >
                <BookForm
                    tenantId={tenantId}
                    onSuccess={() => setIsBookOpen(false)}
                />
            </BaseModal>

            <BaseModal
                isOpen={isLoanOpen}
                onClose={() => setIsLoanOpen(false)}
                title="Registrar Novo Empréstimo"
            >
                <LoanForm
                    tenantId={tenantId}
                    books={books}
                    onSuccess={() => setIsLoanOpen(false)}
                />
            </BaseModal>
        </div>
    );
}
