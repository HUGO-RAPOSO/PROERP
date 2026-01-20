export default function EducationModules() {
    const modules = [
        {
            title: "Matrículas e Alunos",
            description: "Sistema completo de cadastro, matrícula online, documentação digital e histórico acadêmico.",
            features: [
                "Matrícula online automatizada",
                "Portal do aluno e responsável",
                "Gestão de documentos digitais",
                "Histórico escolar completo"
            ],
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            title: "Gestão de Turmas",
            description: "Organize turmas, horários, disciplinas e alocação de professores de forma inteligente.",
            features: [
                "Montagem automática de grades",
                "Controle de capacidade",
                "Alocação de professores",
                "Calendário acadêmico"
            ],
            gradient: "from-purple-500 to-pink-500"
        },
        {
            title: "Notas e Frequência",
            description: "Lançamento de notas, controle de presença, boletins e relatórios de desempenho.",
            features: [
                "Lançamento de notas online",
                "Chamada digital",
                "Boletins automatizados",
                "Análise de desempenho"
            ],
            gradient: "from-orange-500 to-red-500"
        },
        {
            title: "Comunicação",
            description: "Mantenha pais, alunos e professores sempre informados com comunicação integrada.",
            features: [
                "Avisos e circulares",
                "Chat integrado",
                "Notificações push",
                "Agenda de eventos"
            ],
            gradient: "from-green-500 to-emerald-500"
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Módulos Educacionais Especializados
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Funcionalidades desenvolvidas especificamente para o setor educacional
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {modules.map((module, index) => (
                        <div
                            key={index}
                            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br p-[2px] hover:scale-[1.02] transition-transform duration-300"
                            style={{
                                backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`
                            }}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

                            <div className="relative bg-white rounded-3xl p-8 h-full">
                                <h3 className={`text-3xl font-bold mb-3 bg-gradient-to-r ${module.gradient} bg-clip-text text-transparent`}>
                                    {module.title}
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {module.description}
                                </p>

                                <ul className="space-y-3">
                                    {module.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
