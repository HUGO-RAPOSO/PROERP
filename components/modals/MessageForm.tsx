"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createMessage } from "@/lib/actions/communication";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const messageSchema = z.object({
    subject: z.string().min(3, "Assunto deve ter pelo menos 3 caracteres"),
    content: z.string().min(10, "Conteúdo deve ter pelo menos 10 caracteres"),
    type: z.enum(["NOTIFICATION", "EMAIL", "SMS"]),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface MessageModalProps {
    tenantId: string;
    onSuccess: () => void;
}

export default function MessageForm({ tenantId, onSuccess }: MessageModalProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<MessageFormValues>({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            subject: "",
            content: "",
            type: "NOTIFICATION",
        },
    });

    async function onSubmit(values: MessageFormValues) {
        setLoading(true);
        try {
            await createMessage({
                ...values,
                tenantId,
            });
            onSuccess();
            form.reset();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Tipo de Mensagem</label>
                <select
                    {...form.register("type")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                >
                    <option value="NOTIFICATION">Notificação (App)</option>
                    <option value="EMAIL">E-mail</option>
                    <option value="SMS">SMS</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Assunto</label>
                <input
                    {...form.register("subject")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="Ex: Aviso de Feriado"
                />
                {form.formState.errors.subject && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.subject.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Conteúdo</label>
                <textarea
                    {...form.register("content")}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all resize-none"
                    placeholder="Escreva sua mensagem aqui..."
                />
                {form.formState.errors.content && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.content.message}</p>
                )}
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? "Enviando..." : "Enviar Mensagem"}
                </button>
            </div>
        </form>
    );
}
