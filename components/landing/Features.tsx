export default function Features() {
    const features = [
        {
            icon: "💰",
            title: "Gestão Financeira",
            description: "Controle completo de fluxo de caixa, contas a pagar/receber, DRE e emissão de notas fiscais."
        },
        {
            icon: "👥",
            title: "CRM Educacional",
            description: "Gerencie leads de alunos prospectivos, funil de matrículas e comunicação com responsáveis."
        },
        {
            icon: "📊",
            title: "Dashboard Inteligente",
            description: "KPIs em tempo real, métricas de matrículas, inadimplência e desempenho acadêmico."
        },
        {
            icon: "👨‍🏫",
            title: "Gestão de RH",
            description: "Controle de professores, funcionários, folha de pagamento e documentação."
        },
        {
            icon: "🎓",
            title: "Gestão Acadêmica",
            description: "Matrículas, turmas, horários, notas, frequência e histórico escolar completo."
        },
        {
            icon: "📚",
            title: "Biblioteca Digital",
            description: "Catálogo de livros, sistema de empréstimos e controle de acervo automatizado."
        }
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Tudo que sua instituição precisa
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Módulos profissionais integrados para uma gestão completa e eficiente
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                        >
                            <div className="text-5xl mb-4">{feature.icon}</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
