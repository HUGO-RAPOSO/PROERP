import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LibraryStats from "@/components/library/LibraryStats";
import BookCard from "@/components/library/BookCard";
import LibraryManager from "./LibraryManager";
import { Search, Filter, BookOpen, Grid, List } from "lucide-react";

export default async function LibraryPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const tenantId = session.user.tenantId;

    const { data: books } = await supabase
        .from('Book')
        .select('*')
        .eq('tenantId', tenantId)
        .order('title', { ascending: true });

    const totalBooks = (books || []).reduce((acc: number, b: any) => acc + (b.quantity || 0), 0);
    const availableBooks = (books || []).reduce((acc: number, b: any) => acc + (b.available || 0), 0);

    const { count: totalLoans } = await supabase
        .from('Loan')
        .select('*, book:Book!inner(*)', { count: 'exact', head: true })
        .eq('book.tenantId', tenantId)
        .eq('status', 'BORROWED');

    const physicalBooks = (books || []).filter(b => b.type === 'PHYSICAL' || b.type === 'BOTH').length;
    const digitalBooks = (books || []).filter(b => b.type === 'DIGITAL' || b.type === 'BOTH').length;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Acervo Digital e Físico</h2>
                    <p className="text-gray-500">Gerencie livros digitais, físicos e empréstimos.</p>
                </div>

                {session.user.role !== 'STUDENT' && session.user.role !== 'TEACHER' && (
                    <LibraryManager
                        tenantId={tenantId}
                        books={(books || []).map(b => ({ id: b.id, title: b.title, available: b.available }))}
                    />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <BookOpen className="w-8 h-8 opacity-80" />
                        <span className="text-sm font-bold opacity-75">Total</span>
                    </div>
                    <p className="text-4xl font-black mb-1">{totalBooks}</p>
                    <p className="text-sm font-medium opacity-90">Livros no acervo</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <BookOpen className="w-8 h-8 opacity-80" />
                        <span className="text-sm font-bold opacity-75">Físicos</span>
                    </div>
                    <p className="text-4xl font-black mb-1">{physicalBooks}</p>
                    <p className="text-sm font-medium opacity-90">Cópias físicas</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <BookOpen className="w-8 h-8 opacity-80" />
                        <span className="text-sm font-bold opacity-75">Digitais</span>
                    </div>
                    <p className="text-4xl font-black mb-1">{digitalBooks}</p>
                    <p className="text-sm font-medium opacity-90">E-books</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <BookOpen className="w-8 h-8 opacity-80" />
                        <span className="text-sm font-bold opacity-75">Empréstimos</span>
                    </div>
                    <p className="text-4xl font-black mb-1">{totalLoans || 0}</p>
                    <p className="text-sm font-medium opacity-90">Ativos</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <h3 className="text-2xl font-black text-gray-900">Catálogo</h3>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar título, autor, ISBN..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
                        <button className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                            <Filter className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                {(books || []).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {(books || []).map((book: any) => (
                            <BookCard
                                key={book.id}
                                book={book}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center">
                        <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h4 className="text-xl font-black text-gray-900 mb-2">Nenhum livro cadastrado</h4>
                        <p className="text-gray-500">Comece adicionando livros ao acervo</p>
                    </div>
                )}
            </div>
        </div>
    );
}
