"use client";

import { useState } from "react";
import { Plus, Tags, Landmark, AlertCircle } from "lucide-react";
import BaseModal from "@/components/modals/BaseModal";
import TransactionForm from "@/components/modals/TransactionForm";
import CategoryForm from "@/components/modals/CategoryForm";
import Link from "next/link";

interface FinancialManagerProps {
    tenantId: string;
    categories: { id: string; name: string; type: string; color?: string }[];
    accounts: { id: string; name: string }[];
    students: { id: string; name: string }[];
    employees: { id: string; name: string }[];
}

export default function FinancialManager({ tenantId, categories, accounts, students, employees }: FinancialManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCatOpen, setIsCatOpen] = useState(false);

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-gray-100/50 p-1 rounded-2xl border border-gray-200/50">
                <Link
                    href="/dashboard/financial/accounts"
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-xl text-sm font-bold hover:bg-white hover:text-primary-600 hover:shadow-sm transition-all"
                >
                    <Landmark className="w-4 h-4" />
                    Contas
                </Link>

                <button
                    onClick={() => setIsCatOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-xl text-sm font-bold hover:bg-white hover:text-primary-600 hover:shadow-sm transition-all"
                >
                    <Tags className="w-4 h-4" />
                    Categorias
                </button>
            </div>

            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary-500/20"
            >
                <Plus className="w-5 h-5 font-bold" />
                Nova Transação
            </button>

            <BaseModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Novo Lançamento Financeiro"
            >
                {accounts.length === 0 ? (
                    <div className="p-8 text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
                        <h4 className="text-lg font-bold">Nenhuma Conta Cadastrada</h4>
                        <p className="text-gray-500">Você precisa cadastrar pelo menos uma conta (Banco, M-Pesa ou Caixa) antes de realizar lançamentos.</p>
                        <Link
                            href="/dashboard/financial/accounts"
                            className="inline-block px-6 py-2 bg-primary-600 text-white rounded-xl font-bold"
                        >
                            Cadastrar Contas Agora
                        </Link>
                    </div>
                ) : (
                    <TransactionForm
                        tenantId={tenantId}
                        categories={categories}
                        accounts={accounts}
                        students={students}
                        employees={employees}
                        onSuccess={() => setIsOpen(false)}
                    />
                )}
            </BaseModal>

            <BaseModal
                isOpen={isCatOpen}
                onClose={() => setIsCatOpen(false)}
                title="Gerenciar Categorias"
            >
                <CategoryForm
                    tenantId={tenantId}
                    existingCategories={categories}
                    onSuccess={() => { }}
                />
            </BaseModal>
        </div>
    );
}
