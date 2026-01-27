"use client";

import React from 'react';
import DocumentLayout from './DocumentLayout';
import { formatCurrency } from '@/lib/utils';
import { Printer } from 'lucide-react';

interface FinancialReceiptProps {
    transaction: {
        description: string;
        amount: number;
        date: string | Date;
        categoryName?: string;
        studentName?: string;
        paymentMethod?: string;
        reference?: string;
    };
    tenantName?: string;
}

export default function FinancialReceipt({ transaction, tenantName }: FinancialReceiptProps) {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <DocumentLayout
            title="Recibo de Pagamento"
            subtitle={`Ref: ${transaction.reference || 'REC-' + Math.random().toString(36).substring(7).toUpperCase()}`}
            tenantName={tenantName}
        >
            <div className="flex justify-between items-center pt-4 px-6 print:hidden">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold text-xs"
                >
                    ← Voltar ao Sistema
                </button>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-xs shadow-lg"
                >
                    <Printer className="w-4 h-4" />
                    Confirmar Impressão / PDF
                </button>
            </div>
            <div className="py-12 px-6">
                <div className="border-2 border-gray-900 rounded-3xl p-10 bg-white relative overflow-hidden">
                    {/* Decorative Corner */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-900 rotate-45 translate-x-12 -translate-y-12"></div>

                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <p className="text-[10px] uppercase font-extrabold tracking-[0.2em] text-gray-400 mb-2">Pago por:</p>
                            <p className="text-2xl font-serif text-gray-900 leading-tight">{transaction.studentName || 'Contribuinte Final'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-extrabold tracking-[0.2em] text-gray-400 mb-2">Valor Total:</p>
                            <p className="text-4xl font-serif text-gray-900 font-bold">{formatCurrency(transaction.amount)}</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-100 pt-8">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase text-gray-500 font-extrabold tracking-widest">Descrição do Serviço</p>
                                <p className="text-lg text-gray-800">{transaction.description}</p>
                                {transaction.categoryName && (
                                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-[10px] font-bold rounded uppercase tracking-tighter mt-1">
                                        {transaction.categoryName}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase text-gray-500 font-extrabold tracking-widest">Data da Transação</p>
                                <p className="text-lg text-gray-800">
                                    {new Date(transaction.date).toLocaleDateString('pt-PT', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-100 pt-8">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase text-gray-500 font-extrabold tracking-widest">Método de Pagamento</p>
                                <p className="text-lg text-gray-800">{transaction.paymentMethod || 'Transferência Bancária / Cash'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase text-gray-500 font-extrabold tracking-widest">Estado</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <p className="text-lg text-green-700 font-bold uppercase tracking-widest">Liquidado</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Amount in words (simplified placeholder) */}
                    <div className="mt-12 p-4 bg-gray-50 rounded-xl border border-gray-100 italic text-gray-500 text-xs">
                        <p className="text-[10px] uppercase font-extrabold tracking-widest text-gray-400 mb-1 not-italic">Importância por Extenso</p>
                        * Confirmamos a recepção do valor total acima mencionado para efeitos de liquidação dos serviços descritos neste documento. *
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.5em] mb-4">Selo Digital de Autenticidade</p>
                    <div className="flex justify-center gap-2">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="w-1 h-3 bg-gray-200 rounded-full"></div>
                        ))}
                    </div>
                </div>
            </div>
        </DocumentLayout >
    );
}
