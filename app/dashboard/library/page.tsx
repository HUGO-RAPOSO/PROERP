import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LibraryStats from "@/components/library/LibraryStats";
import BookTable from "@/components/library/BookTable";
import LibraryManager from "./LibraryManager";
import { Search, Filter, BookOpen } from "lucide-react";

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

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Biblioteca</h2>
                    <p className="text-gray-500">Gerencie o acervo de livros e o histórico de empréstimos.</p>
                </div>

                <LibraryManager
                    tenantId={tenantId}
                    books={(books || []).map(b => ({ id: b.id, title: b.title, available: b.available }))}
                />
            </div>

            <LibraryStats
                totalBooks={totalBooks}
                availableBooks={availableBooks}
                totalLoans={totalLoans || 0}
            />

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-xl font-bold text-gray-900">Acervo Digital</h3>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar título ou autor..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
                        <button className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                            <Filter className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>
                <BookTable books={books || []} />
                {(books || []).length === 0 && (
                    <div className="p-20 text-center">
                        <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhum livro cadastrado no acervo.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
