"use client";

import { Bell, Mail, Trash2, Clock, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { deleteMessage } from "@/lib/actions/communication";

interface Message {
    id: string;
    subject: string;
    content: string;
    type: string;
    createdAt: Date;
}

interface MessageListProps {
    messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
    const [loading, setLoading] = useState<string | null>(null);

    async function handleDelete(id: string) {
        if (!confirm("Excluir esta mensagem?")) return;

        setLoading(id);
        try {
            await deleteMessage(id);
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir mensagem");
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="divide-y divide-gray-100">
            {messages.map((message) => (
                <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${message.type === "NOTIFICATION" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                        }`}>
                        {message.type === "NOTIFICATION" ? <Bell className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-gray-900">{message.subject}</h4>
                            <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(message.createdAt, { addSuffix: true, locale: ptBR })}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                    </div>

                    <button
                        onClick={() => handleDelete(message.id)}
                        disabled={loading === message.id}
                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading === message.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Trash2 className="w-5 h-5" />
                        )}
                    </button>
                </div>
            ))}
        </div>
    );
}
