export default function Testimonials() {
    const testimonials = [
        {
            name: "Maria Silva",
            role: "Diretora - Colégio Estrela do Saber",
            image: "👩‍💼",
            content: "O ProERP revolucionou nossa gestão. Reduzimos a inadimplência em 40% e automatizamos processos que levavam horas. Simplesmente indispensável!",
            rating: 5
        },
        {
            name: "João Santos",
            role: "Coordenador - Faculdade Horizonte",
            image: "👨‍🏫",
            content: "A gestão acadêmica ficou muito mais simples. Os professores adoram a facilidade de lançar notas e os pais têm acesso a tudo em tempo real.",
            rating: 5
        },
        {
            name: "Ana Costa",
            role: "Administradora - Instituto Educacional",
            image: "👩‍💻",
            content: "Implementamos em 2 semanas e já vimos resultados. O suporte é excepcional e o sistema é muito intuitivo. Recomendo fortemente!",
            rating: 5
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        O que nossos clientes dizem
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Instituições de ensino que transformaram sua gestão com o ProERP
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                        >
                            <div className="flex items-center mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>

                            <p className="text-gray-700 mb-6 leading-relaxed italic">
                                "{testimonial.content}"
                            </p>

                            <div className="flex items-center">
                                <div className="text-4xl mr-4">{testimonial.image}</div>
                                <div>
                                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
