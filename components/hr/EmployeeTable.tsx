"use client";

import { formatCurrency } from "@/lib/utils";
import { Edit2, Trash2, Mail, Loader2, Eye } from "lucide-react";
import { useState } from "react";
import { deleteEmployee } from "@/lib/actions/hr";
import BaseModal from "@/components/modals/BaseModal";
import EmployeeForm from "@/components/modals/EmployeeForm";

import Link from "next/link";

interface Employee {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    roleId: string | null;
    role: { name: string } | null;
    salary: number;
    status: string;
    startDate: Date;
    tenantId: string;
    contractId: string | null;
}

interface EmployeeTableProps {
    employees: Employee[];
    roles: any[];
    contracts: any[];
}

export default function EmployeeTable({ employees, roles, contracts }: EmployeeTableProps) {
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este colaborador?")) return;

        setLoading(id);
        try {
            await deleteEmployee(id);
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir colaborador");
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-left bg-gray-50">
                        <th className="px-8 py-4 font-bold text-gray-600 text-sm">Colaborador</th>
                        <th className="px-8 py-4 font-bold text-gray-600 text-sm">Cargo</th>
                        <th className="px-8 py-4 font-bold text-gray-600 text-sm">Salário</th>
                        <th className="px-8 py-4 font-bold text-gray-600 text-sm">Status</th>
                        <th className="px-8 py-4 font-bold text-gray-600 text-sm text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {employees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                        {employee.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{employee.name}</p>
                                        <div className="flex gap-2 mt-1">
                                            {employee.email && (
                                                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                                    <Mail className="w-3 h-3" /> {employee.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-5 text-gray-600 font-medium">
                                {employee.role?.name || "Sem Cargo"}
                            </td>
                            <td className="px-8 py-5 font-bold text-gray-900">
                                {formatCurrency(employee.salary)}
                            </td>
                            <td className="px-8 py-5">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${employee.status === "ACTIVE"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                    }`}>
                                    {employee.status === "ACTIVE" ? "Ativo" : "Inativo"}
                                </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                                <div className="flex justify-end gap-2">
                                    <Link
                                        href={`/dashboard/hr/${employee.id}`}
                                        className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => setEditingEmployee(employee)}
                                        className="p-2 hover:bg-primary-50 text-gray-400 hover:text-primary-600 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(employee.id)}
                                        disabled={loading === employee.id}
                                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {loading === employee.id ? (
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
                isOpen={!!editingEmployee}
                onClose={() => setEditingEmployee(null)}
                title="Editar Colaborador"
            >
                {editingEmployee && (
                    <EmployeeForm
                        tenantId={editingEmployee.tenantId}
                        roles={roles}
                        contracts={contracts}
                        onSuccess={() => setEditingEmployee(null)}
                        initialData={{
                            id: editingEmployee.id,
                            name: editingEmployee.name,
                            email: editingEmployee.email || "",
                            phone: editingEmployee.phone || "",
                            roleId: editingEmployee.roleId || "",
                            contractId: editingEmployee.contractId || "",
                            salary: editingEmployee.salary
                        }}
                    />
                )}
            </BaseModal>
        </div>
    );
}
