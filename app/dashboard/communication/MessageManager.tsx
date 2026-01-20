"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import BaseModal from "@/components/modals/BaseModal";
import MessageForm from "@/components/modals/MessageForm";

export default function MessageManager({ tenantId }: { tenantId: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
                onClick={() => setIsOpen(true)}
            >
                <Send className="w-5 h-5" />
                Nova Mensagem
            </button>

            <BaseModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Enviar Nova Mensagem"
            >
                <MessageForm
                    tenantId={tenantId}
                    onSuccess={() => setIsOpen(false)}
                />
            </BaseModal>
        </>
    );
}
