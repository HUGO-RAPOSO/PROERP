"use client";

import { motion } from "framer-motion";
import {
    DollarSign,
    Users,
    BarChart3,
    Briefcase,
    GraduationCap,
    BookOpen,
    CheckCircle2
} from "lucide-react";

export default function Features() {
    const features = [
        {
            icon: DollarSign,
            title: "Gestão Financeira",
            description: "Controle completo de fluxo de caixa, mensalidades automatizadas e saúde financeira em tempo real.",
            color: "emerald"
        },
        {
            icon: Users,
            title: "CRM Educacional",
            description: "Acompanhe leads desde o primeiro contato até a matrícula com nosso painel Kanban intuitivo.",
            color: "indigo"
        },
        {
            icon: BarChart3,
            title: "Estatística Escolar",
            description: "Métricas avançadas de desempenho, frequência e inadimplência para decisões baseadas em dados.",
            color: "blue"
        },
        {
            icon: Briefcase,
            title: "Recursos Humanos",
            description: "Gestão de professores e funcionários, folha de pagamento e controle de documentação centralizado.",
            color: "rose"
        },
        {
            icon: GraduationCap,
            title: "Gestão Acadêmica",
            description: "Controle total de turmas, matrículas, notas, faltas e histórico acadêmico automatizado.",
            color: "violet"
        },
        {
            icon: BookOpen,
            title: "Biblioteca Digital",
            description: "Acervo digital e físico com controle de empréstimos, reservas e catálogo online integrado.",
            color: "amber"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100
            }
        }
    };

    const colorClasses: Record<string, string> = {
        emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
        blue: "bg-blue-50 text-blue-600 ring-blue-100",
        rose: "bg-rose-50 text-rose-600 ring-rose-100",
        violet: "bg-violet-50 text-violet-600 ring-violet-100",
        amber: "bg-amber-50 text-amber-600 ring-amber-100",
    };

    return (
        <section id="servicos" className="py-24 relative overflow-hidden bg-white">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-50/50 rounded-full blur-3xl opacity-60"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest border border-indigo-100 mb-6">
                            <CheckCircle2 size={14} />
                            Recursos Premium
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
                            Gestão moderna para<br />
                            <span className="text-indigo-600">escolas do futuro.</span>
                        </h2>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                            Nossa plataforma une simplicidade e poder analítico para transformar a rotina da sua instituição.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ y: -8, transition: { duration: 0.3 } }}
                            className="group relative bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-indigo-100/60 transition-all duration-300"
                        >
                            <div className={cn(
                                "w-16 h-16 rounded-[20px] flex items-center justify-center mb-8 ring-4 ring-offset-4 ring-transparent group-hover:ring-offset-0 transition-all duration-300",
                                colorClasses[feature.color]
                            )}>
                                <feature.icon size={32} strokeWidth={2.5} />
                            </div>

                            <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight group-hover:text-indigo-600 transition-colors">
                                {feature.title}
                            </h3>

                            <p className="text-slate-500 font-medium leading-relaxed mb-6">
                                {feature.description}
                            </p>

                            <div className="pt-4 flex items-center gap-2 text-indigo-600 font-bold text-sm tracking-tight opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                Saiba mais
                                <div className="w-5 h-[2px] bg-indigo-600/30 rounded-full" />
                            </div>

                            {/* Decorative Corner */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50/20 to-transparent rounded-tr-[32px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

// Utility for cleaner class joining (if not already globally available)
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
