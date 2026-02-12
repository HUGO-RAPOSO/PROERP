"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createRoom, updateRoom } from "@/lib/actions/academic";
import { useState } from "react";
import { Loader2, MapPin, Users } from "lucide-react";

const roomSchema = z.object({
    name: z.string().min(1, "Nome da sala é obrigatório"),
    capacity: z.coerce.number().min(1, "Capacidade deve ser pelo menos 1").optional(),
});

type RoomFormValues = z.infer<typeof roomSchema>;

interface RoomFormProps {
    tenantId: string;
    onSuccess: () => void;
    initialData?: any;
}

export default function RoomForm({ tenantId, onSuccess, initialData }: RoomFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<RoomFormValues>({
        resolver: zodResolver(roomSchema) as any,
        defaultValues: {
            name: initialData?.name || "",
            capacity: initialData?.capacity || undefined,
        },
    });

    async function onSubmit(values: RoomFormValues) {
        setLoading(true);
        try {
            let result;
            if (initialData?.id) {
                result = await updateRoom(initialData.id, values);
            } else {
                result = await createRoom({
                    ...values,
                    tenantId,
                });
            }

            if (result.success) {
                onSuccess();
                form.reset();
            } else {
                form.setError("root", { message: result.error || "Erro ao salvar sala" });
            }
        } catch (error: any) {
            console.error(error);
            form.setError("root", { message: "Ocorreu um erro inesperado." });
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    Nome da Sala
                </label>
                <input
                    {...form.register("name")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="Ex: Sala 101, Lab de Informática"
                />
                {form.formState.errors.name && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-500" />
                    Capacidade (Opcional)
                </label>
                <input
                    type="number"
                    {...form.register("capacity")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="Ex: 30"
                />
                {form.formState.errors.capacity && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.capacity.message}</p>
                )}
            </div>

            {form.formState.errors.root && (
                <p className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-xl border border-red-100 italic">
                    {form.formState.errors.root.message}
                </p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Salvando..." : (initialData?.id ? "Salvar Alterações" : "Criar Sala")}
            </button>
        </form>
    );
}
