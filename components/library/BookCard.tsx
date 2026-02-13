"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, FileText, BookMarked, Download, Calendar } from "lucide-react";

interface BookCardProps {
    book: {
        id: string;
        title: string;
        author: string;
        isbn?: string;
        type: 'PHYSICAL' | 'DIGITAL' | 'BOTH';
        coverUrl?: string;
        publisher?: string;
        publishYear?: number;
        pages?: number;
        available: number;
        quantity: number;
        fileUrl?: string;
    };
    onBorrow?: () => void;
    onDownload?: () => void;
}

export default function BookCard({ book, onBorrow, onDownload }: BookCardProps) {
    const router = useRouter();
    const TypeIcon = book.type === 'PHYSICAL' ? BookOpen : book.type === 'DIGITAL' ? FileText : BookMarked;
    const typeLabel = book.type === 'PHYSICAL' ? 'Físico' : book.type === 'DIGITAL' ? 'Digital' : 'Físico + Digital';
    const typeColor = book.type === 'PHYSICAL' ? 'bg-blue-100 text-blue-700' : book.type === 'DIGITAL' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700';

    return (
        <div className="group bg-white border-2 border-gray-100 rounded-3xl overflow-hidden hover:border-primary-200 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300">
            {/* Cover Image */}
            <div className="relative h-80 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                {book.coverUrl ? (
                    <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <BookOpen className="w-20 h-20 text-gray-300" />
                    </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-3 right-3">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${typeColor} backdrop-blur-sm`}>
                        <TypeIcon className="w-3.5 h-3.5" />
                        {typeLabel}
                    </div>
                </div>

                {/* Availability Badge */}
                {book.type !== 'DIGITAL' && (
                    <div className="absolute bottom-3 left-3">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm ${book.available > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}>
                            {book.available > 0 ? `${book.available} disponível` : 'Indisponível'}
                        </div>
                    </div>
                )}
            </div>

            {/* Book Info */}
            <div className="p-6 space-y-4">
                <div>
                    <h3 className="text-lg font-black text-gray-900 line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
                        {book.title}
                    </h3>
                    <p className="text-sm font-bold text-gray-500">{book.author}</p>
                </div>

                {/* Metadata */}
                <div className="space-y-2 text-xs">
                    {book.publisher && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="font-bold">Editora:</span>
                            <span>{book.publisher}</span>
                        </div>
                    )}
                    {book.publishYear && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{book.publishYear}</span>
                        </div>
                    )}
                    {book.pages && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="font-bold">{book.pages} páginas</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                    {book.type !== 'DIGITAL' && book.available > 0 && (
                        <button
                            onClick={onBorrow}
                            className={`flex-1 py-2.5 px-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all text-sm ${!onBorrow ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!onBorrow}
                        >
                            Emprestar
                        </button>
                    )}
                    {(book.type === 'DIGITAL' || book.type === 'BOTH') && book.fileUrl && (
                        <button
                            onClick={() => {
                                // If there is a custom handler, use it (though simplified now)
                                // otherwise navigate to the reading page
                                if (onDownload) {
                                    onDownload();
                                } else {
                                    router.push(`/dashboard/library/read/${book.id}`);
                                }
                            }}
                            className="flex-1 py-2.5 px-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all text-sm flex items-center justify-center gap-2"
                        >
                            <BookOpen className="w-4 h-4" />
                            Ler Agora
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
