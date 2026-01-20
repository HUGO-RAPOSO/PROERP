"use client";

import { FileText, Download, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import BaseModal from "@/components/modals/BaseModal";
import DocumentUploadForm from "@/components/modals/DocumentUploadForm";

interface EmployeeDocsProps {
    employeeId: string;
    documents: any[];
}

export default function EmployeeDocs({ employeeId, documents }: EmployeeDocsProps) {
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Documentos do Colaborador</h3>
                <button
                    onClick={() => setIsUploadOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Adicionar Documento
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {documents.map((doc) => (
                    <div key={doc.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between">
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl mb-3">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    title="Visualizar/Baixar"
                                >
                                    <Download className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                        <h4 className="font-bold text-gray-900 truncate" title={doc.name}>{doc.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">
                            Adicionado em {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                ))}

                {documents.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Nenhum documento encontrado.</p>
                    </div>
                )}
            </div>

            <BaseModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                title="Adicionar Documento"
            >
                <DocumentUploadForm
                    employeeId={employeeId}
                    onSuccess={() => setIsUploadOpen(false)}
                />
            </BaseModal>
        </div>
    );
}
