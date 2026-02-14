"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, HeartHandshake, Headphones } from "lucide-react";
import Link from "next/link";

export default function CTA() {
    return (
        <section className="relative py-24 overflow-hidden bg-slate-900 group">
            {/* Ambient Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] group-hover:opacity-40 transition-opacity duration-1000"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                        <Sparkles size={14} />
                        Sem compromisso
                    </div>

                    <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.95]">
                        Pronto para elevar o nível da sua <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">instituição?</span>
                    </h2>

                    <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                        Junte-se a centenas de escolas que já simplificaram sua jornada com o Plex. 14 dias grátis, sem cartão de crédito.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                        <Link
                            href="/auth/signup"
                            className="px-10 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg flex items-center gap-3 hover:bg-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1"
                        >
                            Começar Agora Gratis
                            <ArrowRight size={22} />
                        </Link>
                        <button className="px-10 py-5 bg-white/5 backdrop-blur-md text-white border-2 border-white/10 rounded-[24px] font-black text-lg hover:bg-white/10 transition-all transform hover:-translate-y-1">
                            Agendar tour
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-emerald-400">
                                <ShieldCheck size={20} />
                            </div>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Sem Cartão</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-indigo-400">
                                <HeartHandshake size={20} />
                            </div>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Cancele Online</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-amber-400">
                                <Headphones size={20} />
                            </div>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Suporte 24/7</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Footer Modernizado */}
            <footer className="relative z-10 mt-32 border-t border-white/5 pt-12 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <Link href="/" className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                                <img src="/assets/logo.png" alt="Plex Logo" className="w-10 h-10 object-contain invert" />
                                <span className="text-xl font-black text-white tracking-tighter">Plex</span>
                            </Link>
                            <p className="text-slate-500 text-sm font-bold max-w-xs text-center md:text-left leading-relaxed">
                                Plataforma de Logística Estatística Escolar. Eficiência que transforma a educação.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <div className="flex gap-10 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                                <Link href="#" className="hover:text-indigo-400 transition-colors">Termos</Link>
                                <Link href="#" className="hover:text-indigo-400 transition-colors">Privacidade</Link>
                                <Link href="#" className="hover:text-indigo-400 transition-colors">Contato</Link>
                            </div>
                            <div className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                                © 2026 Plex. Todos os direitos reservados.
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </section>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
