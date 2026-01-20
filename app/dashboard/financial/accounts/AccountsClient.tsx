"use client";

import { useState } from "react";
import { Plus, Landmark, Wallet, Banknote, Trash2 } from "lucide-react";
import BaseModal from "@/components/modals/BaseModal";
import AccountForm from "@/components/modals/AccountForm";
import { deleteAccount } from "@/lib/actions/accounts";

interface Account {
    id: string;
    name: string;
    type: 'CASH' | 'BANK' | 'MOBILE_WALLET';
    bankName?: string;
    accountNumber?: string;
}

interface AccountsClientProps {
    initialAccounts: Account[];
    tenantId: string;
}

export default function AccountsClient({ initialAccounts, tenantId }: AccountsClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [accounts, setAccounts] = useState(initialAccounts);

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir esta conta?")) return;
        try {
            await deleteAccount(id);
            // In a real app, we'd probably rely on revalidatePath, 
            // but since we're in a client component we can also optimistic update or just let the page refresh.
            // For now, let's refresh the page to stay simple.
            window.location.reload();
        } catch (error) {
            alert("Erro ao excluir conta");
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 group"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    Adicionar Conta
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => (
                    <div key={account.id} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col justify-between group hover:border-primary-200 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${account.type === 'CASH' ? 'bg-green-50 text-green-600' :
                                    account.type === 'BANK' ? 'bg-blue-50 text-blue-600' :
                                        'bg-purple-50 text-purple-600'
                                }`}>
                                {account.type === 'CASH' ? <Banknote className="w-6 h-6" /> :
                                    account.type === 'BANK' ? <Landmark className="w-6 h-6" /> :
                                        <Wallet className="w-6 h-6" />}
                            </div>
                            <button
                                onClick={() => handleDelete(account.id)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                {account.type === 'CASH' ? 'Dinheiro / Caixa' :
                                    account.type === 'BANK' ? 'Conta Bancária' :
                                        'Carteira Móvel'}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{account.name}</h3>
                            {(account.bankName || account.accountNumber) && (
                                <p className="text-sm text-gray-500 font-medium tracking-tight">
                                    {account.bankName && <span>{account.bankName} • </span>}
                                    {account.accountNumber}
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                {accounts.length === 0 && (
                    <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                        <Landmark className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">Nenhuma conta cadastrada</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">Cadastre suas contas bancárias ou caixas para começar a registrar movimentos.</p>
                    </div>
                )}
            </div>

            <BaseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nova Conta Financeira"
            >
                <AccountForm
                    tenantId={tenantId}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        window.location.reload();
                    }}
                />
            </BaseModal>
        </div>
    );
}
