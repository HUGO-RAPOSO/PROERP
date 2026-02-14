"use client";

import { motion } from "framer-motion";
import { Check, Zap, Rocket, Building2 } from "lucide-react";
import { useState } from "react";

export default function Pricing() {
    const [isAnnual, setIsAnnual] = useState(false);

    const plans = [
        {
            name: "Básico",
            icon: Zap,
            price: isAnnual ? "2.970 MT" : "297 MT",
            period: isAnnual ? "/ano" : "/mês",
            description: "Essencial para pequenas instituições que estão começando.",
            features: [
                "Até 200 alunos",
                "Gestão Financeira básica",
                "CRM de Alunos",
                "Relatórios Acadêmicos",
                "Suporte por e-mail"
            ],
            highlighted: false,
            color: "slate"
        },
        {
            name: "Profissional",
            icon: Rocket,
            price: isAnnual ? "6.970 MT" : "697 MT",
            period: isAnnual ? "/ano" : "/mês",
            description: "O poder total do Plex para escolas em crescimento.",
            features: [
                "Até 1000 alunos",
                "Todos os módulos inclusos",
                "Gestão Acadêmica avançada",
                "Biblioteca Digital",
                "Suporte prioritário 24h",
                "Treinamento personalizado"
            ],
            highlighted: true,
            color: "indigo"
        },
        {
            name: "Enterprise",
            icon: Building2,
            price: "Sob consulta",
            period: "",
            description: "Soluções customizadas para redes de ensino e grandes campus.",
            features: [
                "Alunos ilimitados",
                "Infraestrutura dedicada",
                "Customizações exclusivas",
                "API de integração",
                "Gerente de conta dedicado",
                "SLA de 99.9%"
            ],
            highlighted: false,
            color: "dark"
        }
    ];

    return (
        <section id="precos" className="py-24 bg-[#FDFDFF] relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-indigo-50/40 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                            Investimento <span className="text-indigo-600">transparente.</span>
                        </h2>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-medium">
                            Escolha o plano que melhor se adapta à realidade da sua instituição hoje.
                        </p>

                        {/* Pricing Toggle */}
                        <div className="flex items-center justify-center gap-4">
                            <span className={cn("text-sm font-bold transition-colors", !isAnnual ? "text-slate-900" : "text-slate-400")}>Mensal</span>
                            <button
                                onClick={() => setIsAnnual(!isAnnual)}
                                className="w-14 h-7 bg-slate-200 rounded-full relative p-1 transition-colors hover:bg-slate-300"
                            >
                                <motion.div
                                    animate={{ x: isAnnual ? 28 : 0 }}
                                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                                />
                            </button>
                            <span className={cn("text-sm font-bold transition-colors", isAnnual ? "text-slate-900" : "text-slate-400")}>
                                Anual <span className="text-emerald-500 font-black ml-1 text-[10px] uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Economize 20%</span>
                            </span>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className={cn(
                                "relative flex flex-col p-10 rounded-[40px] transition-all duration-500 h-full",
                                plan.highlighted
                                    ? "bg-slate-900 text-white shadow-2xl shadow-indigo-200/50 scale-105 z-10"
                                    : "bg-white border border-slate-100 shadow-xl shadow-slate-200/40 hover:border-indigo-200"
                            )}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-indigo-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                                        Mais Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-8">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                                    plan.highlighted ? "bg-white/10 text-white" : "bg-indigo-50 text-indigo-600"
                                )}>
                                    <plan.icon size={24} />
                                </div>
                                <h3 className="text-2xl font-black mb-2 tracking-tight">
                                    {plan.name}
                                </h3>
                                <p className={cn(
                                    "text-sm font-medium leading-relaxed mb-8",
                                    plan.highlighted ? "text-slate-400" : "text-slate-500"
                                )}>
                                    {plan.description}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black tracking-tighter">
                                        {plan.price}
                                    </span>
                                    <span className={cn(
                                        "text-sm font-bold",
                                        plan.highlighted ? "text-slate-500" : "text-slate-400"
                                    )}>
                                        {plan.period}
                                    </span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-10 flex-grow">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <div className={cn(
                                            "mt-1 p-0.5 rounded-full",
                                            plan.highlighted ? "bg-indigo-500/20 text-indigo-400" : "bg-emerald-50 text-emerald-500"
                                        )}>
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        <span className={cn(
                                            "text-sm font-bold tracking-tight leading-snug",
                                            plan.highlighted ? "text-slate-300" : "text-slate-600"
                                        )}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={cn(
                                    "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all transform active:scale-[0.98]",
                                    plan.highlighted
                                        ? "bg-white text-slate-900 hover:bg-slate-100 shadow-lg shadow-white/5"
                                        : "bg-slate-900 text-white hover:bg-indigo-600 shadow-lg shadow-slate-200"
                                )}
                            >
                                Começar Agora
                            </button>
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mt-16"
                >
                    14 dias de teste gratuito • Sem cartão de crédito
                </motion.p>
            </div>
        </section>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
