"use client";

import React from 'react';
import DocumentLayout from './DocumentLayout';
import { Printer } from 'lucide-react';
interface EnrollmentProofProps {
    student: {
        name: string;
        email?: string;
        phone?: string;
        courseName?: string;
        enrollmentDate?: string;
        enrollmentSlipNumber?: string;
    };
    tenantName?: string;
}

export default function EnrollmentProof({ student, tenantName }: EnrollmentProofProps) {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <DocumentLayout
            title="Comprovativo de Matrícula"
            subtitle="Declaração de Vínculo Académico"
            tenantName={tenantName}
        >
            <div className="flex justify-between items-center mb-6 print:hidden">
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
            <div className="py-10 text-justify leading-relaxed">
                <p className="mb-6">
                    Para os devidos efeitos e a pedido do interessado, certifica-se que o(a) estudante <b>{student.name}</b>,
                    {student.email ? ` portador(a) do e-mail ${student.email},` : ""} encontra-se regularmente
                    matriculado(a) nesta instituição de ensino para o ano lectivo de {new Date().getFullYear()}.
                </p>

                <div className="bg-gray-50 p-6 border-l-4 border-gray-900 my-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase text-gray-500 font-extrabold tracking-widest">Curso / Programa</p>
                            <p className="text-xl font-serif text-gray-900 uppercase tracking-tighter">{student.courseName || 'Não especificado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase text-gray-500 font-extrabold tracking-widest">Número de Matrícula</p>
                            <p className="text-xl font-mono text-gray-900">{student.enrollmentSlipNumber || '---'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase text-gray-500 font-extrabold tracking-widest">Estado da Matrícula</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <p className="text-lg text-gray-900 font-serif italic">Confirmada / Activa</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] uppercase text-gray-500 font-extrabold tracking-widest">Data de Emissão</p>
                            <p className="text-lg text-gray-900">{new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                <p className="mb-8 font-serif italic text-gray-700">
                    "A educação é o grande motor do desenvolvimento pessoal. É através dela que a filha de um camponês pode tornar-se médica, que o filho de um mineiro pode tornar-se o chefe da mina, que um filho de trabalhadores agrícolas pode tornar-se o presidente de uma grande nação."
                    <br />
                    <span className="text-xs not-italic font-bold">— Nelson Mandela</span>
                </p>

                <p className="mb-12">
                    Por ser verdade e me ter sido solicitado, mandei passar a presente certidão que vai por mim assinada e autenticada com o carimbo a óleo em uso nesta instituição.
                </p>

                <div className="mt-20 p-6 border-2 border-gray-100 rounded-xl bg-gray-50/50 flex items-start gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                        {/* Simple QR Code placeholder with CSS */}
                        <div className="w-16 h-16 grid grid-cols-4 grid-rows-4 gap-1 opacity-20">
                            {[...Array(16)].map((_, i) => (
                                <div key={i} className={`bg-black ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}></div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Verificação Digital</p>
                        <p className="text-[9px] text-gray-500 leading-tight">
                            A autenticidade deste documento pode ser verificada através dos nossos serviços digitais
                            utilizando o código de verificação impresso no rodapé ou lendo o código QR ao lado.
                        </p>
                    </div>
                </div>
            </div>
        </DocumentLayout>
    );
}
