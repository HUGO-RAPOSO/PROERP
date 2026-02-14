"use client";

import { motion } from "framer-motion";
import {
    UserPlus,
    Users2,
    ClipboardCheck,
    MessageSquare,
    ArrowRight,
    Check
} from "lucide-react";

export default function EducationModules() {
    const modules = [
        {
            title: "Matrículas e Alunos",
            description: "Gerencie o ciclo completo do aluno, desde a prospecção até a formatura, com ferramentas digitais avançadas.",
            icon: UserPlus,
            features: [
                "Matrícula online inteligente",
                "Portal do aluno e responsável",
                "Gestão de documentos digitais",
                "Histórico escolar completo"
            ],
            color: "blue"
        },
        {
            title: "Gestão de Turmas",
            description: "Organize sua instituição com eficiência através de grades inteligentes e alocação dinâmica de recursos.",
            icon: Users2,
            features: [
                "Montagem automática de grades",
                "Controle de capacidade real",
                "Alocação de professores",
                "Calendário acadêmico dinâmico"
            ],
            color: "purple"
        },
        {
            title: "Notas e Frequência",
            description: "Simplifique o controle acadêmico com lançamentos em tempo real e análises de desempenho automáticas.",
            icon: ClipboardCheck,
            features: [
                "Lançamento de notas mobile",
                "Chamada digital QR Code",
                "Boletins customizáveis",
                "Dashboard de rendimento"
            ],
            color: "orange"
        },
        {
            title: "Comunicação 360°",
            description: "Fortaleça o vínculo entre escola e família com canais de comunicação diretos e eficientes.",
            icon: MessageSquare,
            features: [
                "Avisos via App e WhatsApp",
                "Chat interno seguro",
                "Notificações push inteligentes",
                "Agenda de eventos integrada"
            ],
            color: "green"
        }
    ];

    const colorVariants: Record<string, string> = {
        blue: "from-blue-600 to-indigo-600 text-blue-600 bg-blue-50/50 hover:bg-blue-50",
        purple: "from-purple-600 to-pink-600 text-purple-600 bg-purple-50/50 hover:bg-purple-50",
        orange: "from-orange-500 to-red-500 text-orange-600 bg-orange-50/50 hover:bg-orange-50",
        green: "from-emerald-500 to-teal-600 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50",
    };

    return (
        <section className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                            Módulos feitos para<br />
                            <span className="text-indigo-600">quem vive a educação.</span>
                        </h2>
                        <p className="text-xl text-slate-500 max-w-xl font-medium">
                            Funcionalidades robustas que resolvem os desafios reais da gestão escolar.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {modules.map((module, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative flex flex-col p-10 rounded-[40px] border border-slate-100 hover:border-transparent bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-8",
                                    colorVariants[module.color].split(' ').slice(1).join(' ')
                                )}>
                                    <module.icon size={28} />
                                </div>

                                <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight group-hover:text-indigo-600 transition-colors">
                                    {module.title}
                                </h3>

                                <p className="text-slate-500 font-medium leading-relaxed mb-8 max-w-md">
                                    {module.description}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-8">
                                    {module.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-emerald-600" strokeWidth={4} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-600 tracking-tight">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button className="flex items-center gap-2 text-indigo-600 font-black text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-300">
                                    Ver Detalhes do Módulo
                                    <ArrowRight size={16} />
                                </button>
                            </div>

                            {/* Background decoration */}
                            <div className={cn(
                                "absolute top-0 right-0 w-64 h-64 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-0",
                                colorVariants[module.color].split(' ')[0],
                                colorVariants[module.color].split(' ')[1]
                            )}></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
