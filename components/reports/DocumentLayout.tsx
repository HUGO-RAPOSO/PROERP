"use client";

import React from 'react';

interface DocumentLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    date?: string;
    tenantName?: string;
}

export default function DocumentLayout({
    children,
    title,
    subtitle,
    date = new Date().toLocaleDateString(),
    tenantName = "ProERP Education"
}: DocumentLayoutProps) {
    return (
        <div className="bg-white text-black p-8 md:p-12 max-w-[210mm] mx-auto min-h-[297mm] flex flex-col shadow-lg print:shadow-none print:p-4 font-serif">
            {/* Watermark/Background decoration for premium feel */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center overflow-hidden">
                <h1 className="text-[15rem] font-bold rotate-[-45deg] whitespace-nowrap">{tenantName}</h1>
            </div>

            {/* Header */}
            <div className="relative border-b-2 border-gray-900 pb-8 mb-10 flex justify-between items-end">
                <div className="flex flex-col gap-1">
                    <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-white font-bold text-2xl">{tenantName.charAt(0)}</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight uppercase">{tenantName}</h1>
                    <div className="text-xs space-y-0.5 text-gray-600">
                        <p>Endereço: [Endereço da Instituição]</p>
                        <p>Contacto: [Telefone/Email]</p>
                        <p>Website: www.proerp.edu</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="inline-block px-4 py-1 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest mb-4">
                        Documento Oficial
                    </div>
                    <h2 className="text-3xl font-light uppercase tracking-tighter mb-1">{title}</h2>
                    {subtitle && <p className="text-sm font-medium text-gray-500 italic mb-2">{subtitle}</p>}
                    <div className="h-px w-24 bg-gray-300 ml-auto my-2"></div>
                    <p className="text-xs font-bold text-gray-400">EMITIDO EM: {date}</p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow relative z-10">
                {children}
            </div>

            {/* Signature Section */}
            <div className="mt-20 grid grid-cols-2 gap-12 text-center text-sm no-print-section">
                <div className="flex flex-col items-center">
                    <div className="w-48 border-b border-gray-400 mb-2"></div>
                    <p className="font-bold">O Estudante</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-48 border-b border-gray-400 mb-2"></div>
                    <p className="font-bold">A Direção</p>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 mt-16 pt-6 flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-widest">
                <p>© {new Date().getFullYear()} {tenantName}</p>
                <p>ProERP Education System - Verificação: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>

            {/* Print styles */}
            <style jsx global>{`
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print, .print\:hidden {
            display: none !important;
          }
          .shadow-lg, .shadow-xl {
            box-shadow: none !important;
          }
          .border-gray-900 {
            border-color: #000 !important;
          }
          .bg-gray-900 {
            background-color: #000 !important;
          }
          .text-gray-900 {
            color: #000 !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
        </div>
    );
}
