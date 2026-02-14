import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-slate-50 overflow-hidden">
      {/* Background Decorativo Flat - Formas geométricas sutis */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute top-[20%] -left-[5%] w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge Minimalista */}
        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium tracking-wide text-blue-600 bg-blue-50 rounded-full">
          Versão 2.0 • Nova Experiência
        </span>

        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Gestão educacional <br />
          <span className="text-blue-600">simples e eficiente.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          A plataforma intuitiva para escolas que buscam modernizar o controle 
          de alunos, professores e o financeiro sem complicações.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth/signup">
            <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
              Começar Gratuitamente
            </button>
          </Link>
          <Link href="/auth/login">
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
              Fazer Login
            </button>
          </Link>
        </div>

        {/* Stats Section - Flat e Clean */}
        <div className="mt-20 pt-10 border-t border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-900">500+</p>
              <p className="text-sm text-slate-500 uppercase tracking-wider font-medium">Escolas</p>
            </div>
            <div className="text-center border-x border-slate-200 px-4">
              <p className="text-3xl font-bold text-slate-900">50k+</p>
              <p className="text-sm text-slate-500 uppercase tracking-wider font-medium">Alunos</p>
            </div>
            <div className="text-center hidden md:block">
              <p className="text-3xl font-bold text-slate-900">99.9%</p>
              <p className="text-sm text-slate-500 uppercase tracking-wider font-medium">Uptime</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}