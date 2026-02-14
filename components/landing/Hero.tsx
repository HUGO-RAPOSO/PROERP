"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { ChevronRight, LayoutDashboard, Zap } from "lucide-react";

export default function Hero() {
  // Configuração do WhatsApp
  const whatsappNumber = "258879877288";
  const whatsappMessage = encodeURIComponent("Olá! Gostaria de agendar uma demonstração do EduFlow.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      {/* Menu Superior Fixo com Novos Itens */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <img src="/assets/logo.png" alt="Plex Logo" className="w-20 h-20 object-contain" />
          </Link>

          {/* Itens do Menu Atualizados */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Página inicial</Link>
            <Link href="#servicos" className="hover:text-indigo-600 transition-colors">Serviços</Link>
            <Link href="#sobre" className="hover:text-indigo-600 transition-colors">Sobre</Link>
            <Link href="#contactos" className="hover:text-indigo-600 transition-colors">Contactos</Link>
          </div>

          {/* Ações com Rota de Login Corrigida */}
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-bold text-slate-600 px-4 py-2 hover:text-slate-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="bg-slate-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-600 transition-all shadow-sm"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-4">

          {/* Coluna de Texto */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-emerald-100">
                <Zap size={12} fill="currentColor" />
                O Futuro da Educação
              </div>

              <h1 className="text-5xl md:text-[80px] font-black text-slate-900 leading-[0.95] mb-8 tracking-tighter">
                Gestão que <br />
                <span className="text-indigo-600 italic">evolui</span> com você.
              </h1>

              <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                Elimine planilhas complexas. Centralize alunos, notas e financeiro em uma plataforma intuitiva e automatizada.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-100 transition-all transform hover:-translate-y-1"
                >
                  Agendar Demo Grátis
                  <ChevronRight size={20} />
                </a>

                <button className="px-8 py-4 bg-white text-slate-700 border-2 border-slate-100 rounded-2xl font-bold hover:border-indigo-600 transition-all">
                  Explorar Recursos
                </button>
              </div>
            </motion.div>
          </div>

          {/* Coluna da Animação Lottie */}
          <motion.div
            className="flex-1 w-full flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="relative w-full aspect-square max-w-[600px]">
              <DotLottieReact
                src="https://lottie.host/514c913e-adbe-4736-a1c9-016a7e79fbbe/gGYBKbNdJa.lottie"
                loop
                autoplay
              />

              {/* Card Flutuante */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-0 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-50 hidden md:flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Painel</p>
                  <p className="text-sm font-bold text-slate-800">100% Sincronizado</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}