export default function CTA() {
    return (
        <section className="relative py-20 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Pronto para transformar sua gestão educacional?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                    Junte-se a centenas de instituições que já otimizaram sua gestão com o ProERP.
                    Comece seu teste gratuito hoje mesmo!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                    <button className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl">
                        Iniciar Teste Grátis - 14 Dias
                    </button>
                    <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all">
                        Falar com Especialista
                    </button>
                </div>

                <div className="flex items-center justify-center gap-6 text-white/80 text-sm">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Sem cartão de crédito
                    </div>
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Cancele quando quiser
                    </div>
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Suporte em português
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-20 border-t border-white/20 pt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center text-white/70 text-sm">
                        <div className="mb-4 md:mb-0">
                            © 2026 ProERP Educacional. Todos os direitos reservados.
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
                            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                            <a href="#" className="hover:text-white transition-colors">Contato</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
