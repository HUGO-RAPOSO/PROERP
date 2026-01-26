"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CreditCard } from "lucide-react";
import { createCourse, updateCourse } from "@/lib/actions/academic-courses";

const courseSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    type: z.enum(["DEGREE", "TECHNICAL", "SCHOOL"]),
    duration: z.coerce.number().min(1, "Duração mínima de 1 período"),
    periodType: z.enum(["YEARS", "SEMESTERS"]),
    price: z.coerce.number().min(0, "O preço deve ser maior ou igual a zero"),
    enrollmentFee: z.coerce.number().min(0, "O valor da matrícula deve ser maior ou igual a zero"),
    paymentStartDay: z.coerce.number().min(1).max(31).default(1),
    paymentEndDay: z.coerce.number().min(1).max(31).default(10),
    lateFeeValue: z.coerce.number().min(0).default(0),
    lateFeeType: z.enum(["FIXED", "PERCENTAGE"]).default("FIXED"),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
    tenantId: string;
    onSuccess: () => void;
    initialData?: CourseFormValues & { id: string };
}

export default function CourseForm({ tenantId, onSuccess, initialData }: CourseFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema) as any,
        defaultValues: initialData || {
            name: "",
            type: "DEGREE",
            duration: 4,
            periodType: "YEARS",
            price: 0,
            enrollmentFee: 0,
            paymentStartDay: 1,
            paymentEndDay: 10,
            lateFeeValue: 0,
            lateFeeType: "FIXED",
        },
    });

    async function onSubmit(values: CourseFormValues) {
        setLoading(true);
        try {
            if (initialData) {
                const res = await updateCourse(initialData.id, values);
                if (!res.success) throw new Error(res.error || "Erro ao atualizar curso");
            } else {
                const res = await createCourse({
                    ...values,
                    tenantId,
                });
                if (!res.success) throw new Error(res.error || "Erro ao criar curso");
            }
            onSuccess();
            form.reset();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar curso");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Nome do Curso</label>
                <input
                    {...form.register("name")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="Ex: Engenharia Civil, Ensino Médio"
                />
                {form.formState.errors.name && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.name.message}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Tipo</label>
                    <select
                        {...form.register("type")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    >
                        <option value="DEGREE">Graduação (Faculdade)</option>
                        <option value="TECHNICAL">Curso Técnico</option>
                        <option value="SCHOOL">Ensino Regular (Escola)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Tipo de Período</label>
                    <select
                        {...form.register("periodType")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    >
                        <option value="YEARS">Anual (Anos)</option>
                        <option value="SEMESTERS">Semestral (Semestres)</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Duração Total ({form.watch("periodType") === "YEARS" ? "Anos" : "Semestres"})</label>
                <input
                    type="number"
                    {...form.register("duration")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Valor da Mensalidade (MZN)</label>
                <input
                    type="number"
                    step="0.01"
                    {...form.register("price")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="0,00"
                />
                {form.formState.errors.price && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.price.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Valor da Matrícula (MZN)</label>
                <input
                    type="number"
                    step="0.01"
                    {...form.register("enrollmentFee")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="0,00"
                />
                {form.formState.errors.enrollmentFee && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.enrollmentFee.message}</p>
                )}
            </div>

            {/* Payment Rules Section */}
            <div className="space-y-4 p-6 bg-primary-50/50 rounded-[2rem] border border-primary-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CreditCard className="w-12 h-12 text-primary-600" />
                </div>

                <h4 className="text-xs font-black text-primary-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary-600 rounded-full" />
                    Regras de Cobrança e Multa
                </h4>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Início Período (Dia)</label>
                        <input
                            {...form.register("paymentStartDay")}
                            type="number"
                            min="1"
                            max="31"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-gray-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Fim Período (Dia)</label>
                        <input
                            {...form.register("paymentEndDay")}
                            type="number"
                            min="1"
                            max="31"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-gray-700"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Valor da Multa</label>
                        <input
                            {...form.register("lateFeeValue")}
                            type="number"
                            step="0.01"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-gray-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Tipo de Multa</label>
                        <select
                            {...form.register("lateFeeType")}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-gray-700 appearance-none"
                        >
                            <option value="FIXED">Valor Fixo (MZN)</option>
                            <option value="PERCENTAGE">Porcentagem (%)</option>
                        </select>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? "Salvando..." : (initialData ? "Salvar Alterações" : "Criar Curso")}
            </button>
        </form>
    );
}
