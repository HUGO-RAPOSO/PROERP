"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Landmark, Wallet, Banknote } from "lucide-react";
import { createAccount } from "@/lib/actions/accounts";

const accountSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    type: z.enum(["CASH", "BANK", "MOBILE_WALLET"]),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

interface AccountFormProps {
    tenantId: string;
    onSuccess?: () => void;
}

export default function AccountForm({ tenantId, onSuccess }: AccountFormProps) {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        reset
    } = useForm<AccountFormValues>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            type: "CASH"
        }
    });

    const accountType = watch("type");

    const onSubmit = async (data: AccountFormValues) => {
        try {
            await createAccount({
                ...data,
                tenantId
            });
            reset();
            if (onSuccess) onSuccess();
        } catch (error) {
            alert("Erro ao criar conta");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { id: "CASH", label: "Dinheiro", icon: Banknote, color: "bg-green-50 text-green-600 border-green-200" },
                    { id: "BANK", label: "Banco", icon: Landmark, color: "bg-blue-50 text-blue-600 border-blue-200" },
                    { id: "MOBILE_WALLET", label: "Carteira Móvel", icon: Wallet, color: "bg-purple-50 text-purple-600 border-purple-200" }
                ].map((type) => (
                    <label
                        key={type.id}
                        className={`
                            relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all
                            ${accountType === type.id
                                ? `${type.color} border-current ring-2 ring-offset-2 ring-current/20`
                                : "bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50"}
                        `}
                    >
                        <input
                            type="radio"
                            {...register("type")}
                            value={type.id}
                            className="absolute opacity-0"
                        />
                        <type.icon className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                    </label>
                ))}
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                        Nome da Conta (Ex: Caixa Geral, Conta BCI Meticais, M-Pesa Principal)
                    </label>
                    <input
                        {...register("name")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="Digite o nome identificador"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>

                {accountType === "BANK" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                Nome do Banco
                            </label>
                            <input
                                {...register("bankName")}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                placeholder="Ex: BCI, Millennium BIM"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                Número da Conta / IBAN
                            </label>
                            <input
                                {...register("accountNumber")}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                placeholder="0000 0000 0000"
                            />
                        </div>
                    </div>
                )}

                {accountType === "MOBILE_WALLET" && (
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            Número de Celular / Referência
                        </label>
                        <input
                            {...register("accountNumber")}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            placeholder="Ex: 84XXXXXXX"
                        />
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
                {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        Salvar Conta
                    </>
                )}
            </button>
        </form>
    );
}
