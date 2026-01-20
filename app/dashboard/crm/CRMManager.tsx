"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import BaseModal from "@/components/modals/BaseModal";
import LeadForm from "@/components/modals/LeadForm";

interface CRMManagerProps {
    tenantId: string;
}

export default function CRMManager({ tenantId }: CRMManagerProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
            >
                <UserPlus className="w-5 h-5" />
                Novo Lead
            </button>

            <BaseModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Capturar Novo Lead"
            >
                <LeadForm
                    tenantId={tenantId}
                    onSuccess={() => setIsOpen(false)}
                />
            </BaseModal>
        </>
    );
}
