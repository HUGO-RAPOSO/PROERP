"use client";

import { Edit2, Trash2, Book as BookIcon, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { deleteBook } from "@/lib/actions/library";
import BaseModal from "@/components/modals/BaseModal";
import BookForm from "@/components/modals/BookForm";

interface Book {
    id: string;
    title: string;
    author: string;
    isbn: string | null;
    quantity: number;
    available: number;
    tenantId: string;
}

interface BookTableProps {
    books: Book[];
}

export default function BookTable({ books }: BookTableProps) {
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja remover este livro do acervo?")) return;

        setLoading(id);
        try {
            await deleteBook(id);
        } catch (error) {
            console.error(error);
            alert("Erro ao remover livro");
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-left bg-gray-50">
                        <th className="px-8 py-4 font-bold text-gray-600 text-sm">Livro</th>
                        <th className="px-8 py-4 font-bold text-gray-600 text-sm">Autor</th>
                        <th className="px-8 py-4 font-bold text-gray-600 text-sm">ISBN</th>
                        <th className="px-8 py-4 font-bold text-gray-600 text-sm text-center">Disponível</th>
                        <th className="px-8 py-4 font-bold text-gray-600 text-sm text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {books.map((book) => (
                        <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                        <BookIcon className="w-5 h-5" />
                                    </div>
                                    <p className="font-bold text-gray-900">{book.title}</p>
                                </div>
                            </td>
                            <td className="px-8 py-5 text-gray-600 font-medium">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    {book.author}
                                </div>
                            </td>
                            <td className="px-8 py-5 text-sm text-gray-500">
                                {book.isbn || "N/A"}
                            </td>
                            <td className="px-8 py-5 text-center">
                                <span className={`font-bold ${book.available > 0 ? "text-green-600" : "text-red-600"}`}>
                                    {book.available} / {book.quantity}
                                </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setEditingBook(book)}
                                        className="p-2 hover:bg-primary-50 text-gray-400 hover:text-primary-600 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(book.id)}
                                        disabled={loading === book.id}
                                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {loading === book.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <BaseModal
                isOpen={!!editingBook}
                onClose={() => setEditingBook(null)}
                title="Editar Livro"
            >
                {editingBook && (
                    <BookForm
                        tenantId={editingBook.tenantId}
                        onSuccess={() => setEditingBook(null)}
                        initialData={{
                            id: editingBook.id,
                            title: editingBook.title,
                            author: editingBook.author,
                            isbn: editingBook.isbn || "",
                            type: "PHYSICAL", // Default to PHYSICAL for backward compatibility
                            quantity: editingBook.quantity,
                            publisher: "",
                            publishYear: 0,
                            pages: 0,
                            coverUrl: "",
                            fileUrl: "",
                            description: "",
                        }}
                    />
                )}
            </BaseModal>
        </div>
    );
}
