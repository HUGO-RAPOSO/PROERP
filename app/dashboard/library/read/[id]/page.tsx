import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

interface ReadBookPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ReadBookPage(props: ReadBookPageProps) {
    const params = await props.params;
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const { data: book, error } = await supabase
        .from('Book')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !book) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Livro não encontrado</h1>
                <Link
                    href="/dashboard/library"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                >
                    Voltar para a biblioteca
                </Link>
            </div>
        );
    }

    if (!book.fileUrl) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Este livro não está disponível em formato digital</h1>
                <Link
                    href="/dashboard/library"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                >
                    Voltar para a biblioteca
                </Link>
            </div>
        );
    }

    // Append parameters to hide toolbar in generic PDF viewers
    // This is not foolproof security but improves the "read only" UX
    const viewerUrl = `${book.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`;

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] -m-8 md:-m-8">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/library"
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Voltar"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 line-clamp-1">{book.title}</h1>
                        <p className="text-xs text-gray-500 font-medium">{book.author}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-bold">
                    <BookOpen className="w-4 h-4" />
                    Modo Leitura
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 bg-gray-100 relative">
                <object
                    data={viewerUrl}
                    type="application/pdf"
                    className="w-full h-full"
                    title={`Leitor: ${book.title}`}
                >
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <p className="text-gray-500 mb-2">Não foi possível carregar o visualizador.</p>
                        <a
                            href={book.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 font-bold hover:underline"
                        >
                            Clique aqui para abrir o arquivo
                        </a>
                    </div>
                </object>
            </div>
        </div>
    );
}
