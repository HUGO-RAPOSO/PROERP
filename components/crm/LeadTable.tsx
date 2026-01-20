"use client";

import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Mail, Phone, Edit2, Trash2, MessageCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { deleteLead } from "@/lib/actions/crm";
import BaseModal from "@/components/modals/BaseModal";
import LeadForm from "@/components/modals/LeadForm";

interface Lead {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
    source: string | null;
    createdAt: Date;
    tenantId: string;
}

const statusMap: Record<string, { label: string; class: string }> = {
    OPEN: { label: "Aberto", class: "bg-blue-50 text-blue-700 ring-blue-600/20" },
    CONTACTED: { label: "Contatado", class: "bg-orange-50 text-orange-700 ring-orange-600/20" },
    INTERESTED: { label: "Interessado", class: "bg-purple-50 text-purple-700 ring-purple-600/20" },
    ENROLLED: { label: "Matriculado", class: "bg-green-50 text-green-700 ring-green-600/20" },
    CLOSED: { label: "Perdido", class: "bg-red-50 text-red-700 ring-red-600/20" },
};

export default function LeadTable({ leads }: { leads: Lead[] }) {
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este prospecto?")) return;

        setLoading(id);
        try {
            await deleteLead(id);
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir lead");
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-8 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Prospecto</th>
                        <th className="px-8 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-8 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Origem</th>
                        <th className="px-8 py-5 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Criado em</th>
                        <th className="px-8 py-5 text-right text-sm font-bold text-gray-400 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {leads.map((lead) => (
                        <tr key={lead.id} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                                        {lead.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{lead.name}</p>
                                        <div className="flex gap-2 mt-1">
                                            {lead.email && (
                                                <div title={lead.email}>
                                                    <Mail className="w-3 h-3 text-gray-400" />
                                                </div>
                                            )}
                                            {lead.phone && (
                                                <div title={lead.phone}>
                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <span className={cn(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset",
                                    statusMap[lead.status]?.class || "bg-gray-50 text-gray-600 ring-gray-600/20"
                                )}>
                                    {statusMap[lead.status]?.label || lead.status}
                                </span>
                            </td>
                            <td className="px-8 py-5 text-sm text-gray-600">
                                {lead.source || "Direto"}
                            </td>
                            <td className="px-8 py-5 text-sm text-gray-500">
                                {formatDate(lead.createdAt)}
                            </td>
                            <td className="px-8 py-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => setEditingLead(lead)}
                                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(lead.id)}
                                        disabled={loading === lead.id}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                    >
                                        {loading === lead.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <BaseModal
                isOpen={!!editingLead}
                onClose={() => setEditingLead(null)}
                title="Editar Prospecto"
            >
                {editingLead && (
                    <LeadForm
                        tenantId={editingLead.tenantId}
                        onSuccess={() => setEditingLead(null)}
                        initialData={{
                            id: editingLead.id,
                            name: editingLead.name,
                            email: editingLead.email || "",
                            phone: editingLead.phone || "",
                            source: editingLead.source || "Website",
                            status: editingLead.status
                        }}
                    />
                )}
            </BaseModal>
        </div>
    );
}
