"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CreditCard, Check, ChevronRight, ChevronLeft, BookOpen, DollarSign, Settings, GraduationCap, X } from "lucide-react";
import { createCourse, updateCourse } from "@/lib/actions/academic-courses";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
    const [step, setStep] = useState(1);
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
            setStep(1);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Erro ao salvar curso. Verifique se todos os campos estão corretos.");
        } finally {
            setLoading(false);
        }
    }

    const nextStep = async () => {
        const fields = step === 1 ? ["name", "type", "duration", "periodType"] : ["price", "enrollmentFee"];
        const isValid = await form.trigger(fields as any);
        if (isValid) setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const steps = [
        { id: 1, name: "Básico", icon: BookOpen },
        { id: 2, name: "Financeiro", icon: DollarSign },
        { id: 3, name: "Regras", icon: Settings },
    ];

    return (
        <div className="space-y-8 min-h-[450px] flex flex-col justify-between">
            {/* Progress Stepper */}
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
                <div className="relative flex justify-between z-10 px-4">
                    {steps.map((s) => {
                        const Icon = s.icon;
                        const isActive = step === s.id;
                        const isCompleted = step > s.id;

                        return (
                            <div key={s.id} className="flex flex-col items-center">
                                <div className={cn(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                                    isActive ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-110" :
                                        isCompleted ? "bg-green-500 text-white" : "bg-white border-2 border-gray-100 text-gray-400"
                                )}>
                                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest mt-2",
                                    isActive ? "text-primary-600" : isCompleted ? "text-green-600" : "text-gray-400"
                                )}>
                                    {s.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 mt-4">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Nome do Curso</label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        {...form.register("name")}
                                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-gray-900 font-bold"
                                        placeholder="Ex: Engenharia Civil, Ensino Médio"
                                    />
                                </div>
                                {form.formState.errors.name && (
                                    <p className="text-xs text-red-500 font-bold mt-1">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Tipo</label>
                                    <select
                                        {...form.register("type")}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none text-gray-900 font-bold"
                                    >
                                        <option value="DEGREE">Graduação (Faculdade)</option>
                                        <option value="TECHNICAL">Curso Técnico</option>
                                        <option value="SCHOOL">Ensino Regular (Escola)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Tipo de Período</label>
                                    <select
                                        {...form.register("periodType")}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none text-gray-900 font-bold"
                                    >
                                        <option value="YEARS">Anual (Anos)</option>
                                        <option value="SEMESTERS">Semestral (Semestres)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-wider">
                                    Duração Total ({form.watch("periodType") === "YEARS" ? "Anos" : "Semestres"})
                                </label>
                                <input
                                    type="number"
                                    {...form.register("duration")}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-gray-900 font-bold"
                                />
                                {form.formState.errors.duration && (
                                    <p className="text-xs text-red-500 font-bold mt-1">{form.formState.errors.duration.message}</p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-4">
                                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                                        <CreditCard className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Valor Mensalidade (MZN)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...form.register("price")}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all text-gray-900 font-bold text-xl"
                                            placeholder="0,00"
                                        />
                                        {form.formState.errors.price && (
                                            <p className="text-xs text-red-500 font-bold mt-1">{form.formState.errors.price.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-4">
                                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center">
                                        <Check className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Valor Matrícula (MZN)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...form.register("enrollmentFee")}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-gray-900 font-bold text-xl"
                                            placeholder="0,00"
                                        />
                                        {form.formState.errors.enrollmentFee && (
                                            <p className="text-xs text-red-500 font-bold mt-1">{form.formState.errors.enrollmentFee.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="p-8 bg-primary-50/50 rounded-[3rem] border border-primary-100/50 space-y-8">
                                <h4 className="text-xs font-black text-primary-700 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <span className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
                                    Configuração de Multas
                                </h4>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest ml-1">Início (Dia)</label>
                                        <input
                                            {...form.register("paymentStartDay")}
                                            type="number"
                                            min="1"
                                            max="31"
                                            className="w-full px-5 py-4 bg-white border border-primary-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold text-gray-700 text-center"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest ml-1">Fim (Dia)</label>
                                        <input
                                            {...form.register("paymentEndDay")}
                                            type="number"
                                            min="1"
                                            max="31"
                                            className="w-full px-5 py-4 bg-white border border-primary-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold text-gray-700 text-center"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest ml-1">Taxa de Multa</label>
                                        <input
                                            {...form.register("lateFeeValue")}
                                            type="number"
                                            step="0.01"
                                            className="w-full px-5 py-4 bg-white border border-primary-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold text-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest ml-1">Tipo de Multa</label>
                                        <select
                                            {...form.register("lateFeeType")}
                                            className="w-full px-5 py-4 bg-white border border-primary-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold text-gray-700 appearance-none"
                                        >
                                            <option value="FIXED">Valor Fixo (MZN)</option>
                                            <option value="PERCENTAGE">Porcentagem (%)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <button
                    type="button"
                    onClick={step === 1 ? onSuccess : prevStep}
                    className="py-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                    {step === 1 ? <X className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    {step === 1 ? "Cancelar" : "Voltar"}
                </button>

                {step < 3 ? (
                    <button
                        type="button"
                        onClick={nextStep}
                        className="py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        Continuar
                        <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={loading}
                        className="py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Processando..." : (initialData ? "Salvar Alterações" : "Criar Curso")}
                        {!loading && <Check className="w-4 h-4" />}
                    </button>
                )}
            </div>
            );
}
