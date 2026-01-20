export default function Pricing() {
    const plans = [
        {
            name: "Básico",
            price: "R$ 297",
            period: "/mês",
            description: "Ideal para escolas pequenas",
            features: [
                "Até 200 alunos",
                "Gestão Financeira",
                "CRM Básico",
                "Dashboard",
                "Suporte por email"
            ],
            highlighted: false
        },
        {
            name: "Profissional",
            price: "R$ 697",
            period: "/mês",
            description: "Perfeito para escolas médias",
            features: [
                "Até 1000 alunos",
                "Todos os módulos core",
                "Gestão Acadêmica completa",
                "Portal do aluno",
                "Suporte prioritário",
                "Treinamento incluído"
            ],
            highlighted: true
        },
        {
            name: "Enterprise",
            price: "Personalizado",
            period: "",
            description: "Para grandes instituições",
            features: [
                "Alunos ilimitados",
                "Todos os recursos",
                "Customizações",
                "API dedicada",
                "Suporte 24/7",
                "Gerente de conta dedicado",
                "SLA garantido"
            ],
            highlighted: false
        }
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Planos que cabem no seu bolso
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Escolha o plano ideal para o tamanho da sua instituição
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative rounded-3xl p-8 ${plan.highlighted
                                    ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white transform scale-105 shadow-2xl'
                                    : 'bg-white border-2 border-gray-200 shadow-lg'
                                } transition-all duration-300 hover:shadow-2xl`}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                                        MAIS POPULAR
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                                    {plan.name}
                                </h3>
                                <p className={`text-sm mb-4 ${plan.highlighted ? 'text-white/80' : 'text-gray-600'}`}>
                                    {plan.description}
                                </p>
                                <div className="flex items-baseline justify-center">
                                    <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                                        {plan.price}
                                    </span>
                                    <span className={`ml-2 ${plan.highlighted ? 'text-white/80' : 'text-gray-600'}`}>
                                        {plan.period}
                                    </span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <svg
                                            className={`w-6 h-6 mr-3 flex-shrink-0 ${plan.highlighted ? 'text-white' : 'text-green-500'}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span className={plan.highlighted ? 'text-white' : 'text-gray-700'}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 ${plan.highlighted
                                        ? 'bg-white text-primary-600 hover:bg-gray-100'
                                        : 'bg-primary-600 text-white hover:bg-primary-700'
                                    }`}
                            >
                                Começar Agora
                            </button>
                        </div>
                    ))}
                </div>

                <p className="text-center text-gray-600 mt-12">
                    Todos os planos incluem 14 dias de teste grátis. Sem cartão de crédito necessário.
                </p>
            </div>
        </section>
    );
}
