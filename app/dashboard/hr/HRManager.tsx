"use client";

import { useState } from "react";
import { Briefcase, Plus, FileText } from "lucide-react";
import BaseModal from "@/components/modals/BaseModal";
import EmployeeForm from "@/components/modals/EmployeeForm";
import RoleForm from "@/components/modals/RoleForm";
import ContractForm from "@/components/modals/ContractForm";

interface HRManagerProps {
    tenantId: string;
    roles: any[];
    contracts: any[];
}

export default function HRManager({ tenantId, roles, contracts }: HRManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const [isContractOpen, setIsContractOpen] = useState(false);

    return (
        <div className="flex gap-2">
            <button
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                onClick={() => setIsContractOpen(true)}
            >
                <FileText className="w-5 h-5 text-gray-400" />
                Contratos
            </button>

            <button
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                onClick={() => setIsRoleOpen(true)}
            >
                <Briefcase className="w-5 h-5 text-gray-400" />
                Cargos
            </button>

            <button
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
                onClick={() => setIsOpen(true)}
            >
                <Plus className="w-5 h-5" />
                Novo Colaborador
            </button>

            <BaseModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Cadastrar Novo Colaborador"
            >
                <EmployeeForm
                    tenantId={tenantId}
                    roles={roles}
                    contracts={contracts}
                    onSuccess={() => setIsOpen(false)}
                />
            </BaseModal>

            <BaseModal
                isOpen={isRoleOpen}
                onClose={() => setIsRoleOpen(false)}
                title="Gerenciar Cargos"
            >
                <RoleForm
                    tenantId={tenantId}
                    existingRoles={roles}
                    onSuccess={() => { }}
                />
            </BaseModal>

            <BaseModal
                isOpen={isContractOpen}
                onClose={() => setIsContractOpen(false)}
                title="Gerenciar Tipos de Contrato"
            >
                <ContractForm
                    tenantId={tenantId}
                    existingContracts={contracts}
                    onSuccess={() => { }}
                />
            </BaseModal>
        </div>
    );
}
