import Link from "next/link";

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 gradient-bg opacity-90"></div>

            {/* Overlay pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="animate-float">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
                        Gestão Educacional
                        <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                            Completa e Inteligente
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-lg">
                        A plataforma definitiva para escolas e faculdades gerenciarem alunos,
                        professores, finanças e muito mais em um só lugar.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/auth/signup">
                            <button className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl">
                                Começar Gratuitamente
                            </button>
                        </Link>
                        <Link href="/auth/login">
                            <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all transform hover:scale-105">
                                Fazer Login
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <div className="text-4xl font-bold text-white mb-2">500+</div>
                        <div className="text-white/80">Instituições Atendidas</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <div className="text-4xl font-bold text-white mb-2">50k+</div>
                        <div className="text-white/80">Alunos Gerenciados</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <div className="text-4xl font-bold text-white mb-2">99.9%</div>
                        <div className="text-white/80">Uptime Garantido</div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
            </div>
        </section>
    );
}
