"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Users, BarChart3, Menu } from "lucide-react";

export default function Hero() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navbar Minimalista */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-2xl text-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">G</div>
          EduGestion
        </div>
        <div className="hidden md:flex gap-8 text-slate-600 font-medium">
          <Link href="#" className="hover:text-blue-600 transition-colors">Funcionalidades</Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">Sobre nós</Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">Preços</Link>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-slate-600 font-medium px-4 py-2">Login</Link>
          <Menu className="md:hidden text-slate-800" />
        </div>
      </nav>

      <section className="relative pt-12 pb-20 px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Lado Esquerdo: Texto */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-6">
              Sua escola no <br />
              <span className="text-blue-600">piloto automático.</span>
            </h1>
            <p className="text-xl text-slate-500 mb-8 max-w-xl mx-auto lg:mx-0">
              Gerencie alunos, notas e finanças com uma interface intuitiva feita para educadores modernos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                Criar conta grátis
              </button>
              <button className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:border-blue-600 hover:text-blue-600 transition-all">
                Ver demonstração
              </button>
            </div>
          </motion.div>

          {/* Mini Features (Flat) */}
          <div className="mt-12 grid grid-cols-3 gap-4 border-t border-slate-100 pt-8">
            <div className="flex flex-col items-center lg:items-start">
              <BookOpen className="text-blue-500 mb-2" size={24} />
              <span className="text-sm font-bold text-slate-700">Didático</span>
            </div>
            <div className="flex flex-col items-center lg:items-start">
              <Users className="text-purple-500 mb-2" size={24} />
              <span className="text-sm font-bold text-slate-700">Colaborativo</span>
            </div>
            <div className="flex flex-col items-center lg:items-start">
              <BarChart3 className="text-orange-500 mb-2" size={24} />
              <span className="text-sm font-bold text-slate-700">Analytics</span>
            </div>
          </div>
        </div>

        {/* Lado Direito: Ilustração Estilo Flat */}
        <motion.div 
          className="flex-1 relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Aqui você usaria sua imagem. Coloquei um placeholder estilizado que lembra a sua imagem */}
          <div className="relative w-full max-w-[500px] mx-auto">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <img 
              src="/hero-illustration.png" // Caminho da sua imagem
              alt="Ilustração de gestão"
              className="relative z-10 w-full h-auto drop-shadow-sm"
            />
          </div>
        </motion.div>
      </section>
    </div>
  );
}