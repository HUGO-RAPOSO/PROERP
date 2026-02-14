"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export default function Testimonials() {
    const testimonials = [
        {
            name: "Maria Silva",
            role: "Diretora - Colégio Estrela do Saber",
            content: "O Plex revolucionou nossa gestão escolar. Reduzimos a inadimplência em 40% e automatizamos processos que levavam dias. Indispensável!",
            rating: 5,
            initials: "MS",
            color: "indigo"
        },
        {
            name: "João Santos",
            role: "Coordenador - Faculdade Horizonte",
            content: "A gestão acadêmica ficou muito mais fluida. Os professores adoram a facilidade de lançar notas e os pais acompanham tudo em tempo real.",
            rating: 5,
            initials: "JS",
            color: "emerald"
        },
        {
            name: "Ana Costa",
            role: "Administradora - Instituto Educacional",
            content: "Implementamos em tempo recorde e o suporte foi excepcional. O sistema é intuitivo e focado na nossa realidade em Moçambique.",
            rating: 5,
            initials: "AC",
            color: "amber"
        }
    ];

    const colorVariants: Record<string, string> = {
        indigo: "bg-indigo-600 text-white",
        emerald: "bg-emerald-600 text-white",
        amber: "bg-amber-500 text-white",
    };

    return (
        <section className="py-24 bg-[#FDFDFF] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                            Quem usa o <span className="text-indigo-600">Plex</span>, recomenda.
                        </h2>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                            Histórias de sucesso de instituições que transformaram sua gestão conosco.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col h-full"
                        >
                            <div className="absolute top-8 right-10 text-slate-100">
                                <Quote size={48} strokeWidth={3} />
                            </div>

                            <div className="flex gap-1 mb-6">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            <p className="text-slate-600 font-bold text-lg leading-relaxed mb-10 flex-grow italic">
                                "{testimonial.content}"
                            </p>

                            <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl tracking-tight shadow-lg shadow-black/5",
                                    colorVariants[testimonial.color]
                                )}>
                                    {testimonial.initials}
                                </div>
                                <div>
                                    <div className="font-black text-slate-900 truncate tracking-tight">{testimonial.name}</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{testimonial.role}</div>
                                </div>
                            </div>
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
