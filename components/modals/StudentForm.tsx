"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createStudent, updateStudent, createStudentDocuments } from "@/lib/actions/academic";
import { useState } from "react";
import { Loader2, FileUp, X, CreditCard, User as UserIcon, Check, ChevronRight, ChevronLeft, GraduationCap, FileText } from "lucide-react";
import { uploadFileAdmin } from "@/lib/actions/storage-actions";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const studentSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    phone: z.string().optional(),
    courseId: z.string().min(1, "O curso é obrigatório"),
    classId: z.string().optional().or(z.literal("")),
    enrollmentSlipNumber: z.string().optional(),
    accountId: z.string().optional(),
    paymentDate: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentModalProps {
    tenantId: string;
    onSuccess: () => void;
    initialData?: StudentFormValues & { id: string };
    courses: { id: string; name: string }[];
    accounts: { id: string; name: string }[];
    turmas: { id: string; name: string; courseId: string }[];
}

export default function StudentForm({ tenantId, onSuccess, initialData, courses, accounts, turmas }: StudentModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [extraDocs, setExtraDocs] = useState<{ type: string, file: File | null }[]>([
        { type: "BI/Passaporte", file: null }
    ]);
    const [enrollmentSlip, setEnrollmentSlip] = useState<File | null>(null);

    const form = useForm<StudentFormValues>({
        resolver: zodResolver(studentSchema),
        defaultValues: initialData || {
            name: "",
            email: "",
            phone: "",
            courseId: "",
            classId: "",
            enrollmentSlipNumber: "",
        },
    });

    const selectedCourseId = form.watch("courseId");
    const availableTurmas = turmas.filter(t => t.courseId === selectedCourseId);

    async function onSubmit(values: StudentFormValues) {
        setLoading(true);
        try {
            let enrollmentSlipUrl = "";

            // 1. Upload Enrollment Slip
            if (enrollmentSlip) {
                const formData = new FormData();
                formData.append('file', enrollmentSlip);
                const path = `students/${tenantId}/slip_${Date.now()}_${enrollmentSlip.name}`;
                const res = await uploadFileAdmin(formData, path);
                if (res.success) enrollmentSlipUrl = res.path || "";
            }

            // 2. Create/Update Student
            let studentId = initialData?.id;
            if (initialData) {
                const res = await updateStudent(initialData.id, {
                    ...values,
                    enrollmentSlipUrl: enrollmentSlipUrl || undefined
                });
                if (!res.success) throw new Error(res.error || "Erro ao atualizar aluno");
            } else {
                const { accountId, paymentDate, ...cleanValues } = values;
                const res = await createStudent({
                    ...cleanValues,
                    tenantId,
                    enrollmentSlipUrl,
                    accountId: accountId,
                    paymentDate: paymentDate ? new Date(paymentDate) : undefined
                });
                if (!res.success) throw new Error(res.error || "Erro ao criar aluno");
                studentId = res.data.id;
            }

            // 3. Upload and save Extra Documents
            const docsToSave = [];
            for (const doc of extraDocs) {
                if (doc.file && studentId) {
                    const formData = new FormData();
                    formData.append('file', doc.file);
                    const path = `students/${tenantId}/doc_${Date.now()}_${doc.file.name}`;
                    const res = await uploadFileAdmin(formData, path);
                    if (res.success) {
                        docsToSave.push({
                            studentId: studentId,
                            type: doc.type,
                            url: res.path || "",
                            tenantId: tenantId
                        });
                    }
                }
            }

            if (docsToSave.length > 0) {
                const res = await createStudentDocuments(docsToSave);
                if (!res.success) {
                    console.error("Erro ao salvar documentos extras:", res.error);
                    alert("Aluno cadastrado, mas houve um erro ao salvar alguns documentos: " + res.error);
                }
            }

            onSuccess();
            form.reset();
            setExtraDocs([{ type: "BI/Passaporte", file: null }]);
            setEnrollmentSlip(null);
            setStep(1);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Erro ao salvar aluno");
        } finally {
            setLoading(false);
        }
    }

    const nextStep = async () => {
        const fields = step === 1 ? ["name", "email", "phone"] : ["courseId"];
        const isValid = await form.trigger(fields as any);
        if (isValid) setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const addDoc = () => setExtraDocs([...extraDocs, { type: "", file: null }]);
    const removeDoc = (index: number) => setExtraDocs(extraDocs.filter((_, i) => i !== index));
    const updateDoc = (index: number, data: Partial<{ type: string, file: File | null }>) => {
        const newDocs = [...extraDocs];
        newDocs[index] = { ...newDocs[index], ...data };
        setExtraDocs(newDocs);
    };

    const steps = [
        { id: 1, name: "Identificação", icon: UserIcon },
        { id: 2, name: "Matrícula", icon: GraduationCap },
        { id: 3, name: "Documentos", icon: FileText },
    ];

    return (
        <div className="space-y-8 min-h-[500px] flex flex-col justify-between">
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
                                <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Nome Completo</label>
                                <input
                                    {...form.register("name")}
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-gray-900 font-bold"
                                    placeholder="Ex: Ana Maria Silva"
                                />
                                {form.formState.errors.name && (
                                    <p className="text-xs text-red-500 font-bold mt-1">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 uppercase tracking-wider">E-mail</label>
                                    <input
                                        {...form.register("email")}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-gray-900 font-bold"
                                        placeholder="ana@email.com"
                                    />
                                    {form.formState.errors.email && (
                                        <p className="text-xs text-red-500 font-bold mt-1">{form.formState.errors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Telefone</label>
                                    <input
                                        {...form.register("phone")}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-gray-900 font-bold"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Curso de Ingresso</label>
                                    <select
                                        {...form.register("courseId")}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none text-gray-900 font-bold"
                                        onChange={(e) => {
                                            form.setValue("courseId", e.target.value);
                                            form.setValue("classId", ""); // Reset class when course changes
                                        }}
                                    >
                                        <option value="">Selecione o curso...</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.name}
                                            </option>
                                        ))}
                                    </select>
                                    {form.formState.errors.courseId && (
                                        <p className="text-xs text-red-500 font-bold mt-1">{form.formState.errors.courseId.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Turma (Opcional)</label>
                                    <select
                                        {...form.register("classId")}
                                        disabled={!selectedCourseId}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none text-gray-900 font-bold disabled:opacity-50"
                                    >
                                        <option value="">Selecione a turma...</option>
                                        {availableTurmas.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Número do Talão</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            {...form.register("enrollmentSlipNumber")}
                                            className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-gray-900 font-bold"
                                            placeholder="Ex: 12345678"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Data do Pagamento</label>
                                    <input
                                        type="date"
                                        {...form.register("paymentDate")}
                                        defaultValue={new Date().toISOString().split('T')[0]}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-gray-900 font-bold"
                                    />
                                </div>
                            </div>

                            {!initialData && (
                                <div className="space-y-4 p-6 bg-primary-50/50 border border-primary-100 rounded-3xl">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-primary-700 uppercase tracking-wider">Registrar em Conta (Opcional)</label>
                                        <select
                                            {...form.register("accountId")}
                                            className="w-full px-4 py-3 bg-white border border-primary-100 rounded-xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-gray-700"
                                        >
                                            <option value="">Não registrar automaticamente</option>
                                            {accounts.map((acc) => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.name}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-primary-600 font-bold uppercase tracking-wide">Os valores da matrícula serão debitados nesta conta.</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Talão de Matrícula</label>
                                    {!enrollmentSlip ? (
                                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 hover:bg-primary-50 hover:border-primary-300 transition-all cursor-pointer group">
                                            <div className="flex flex-col items-center justify-center px-4">
                                                <CreditCard className="w-8 h-8 text-gray-300 group-hover:text-primary-500 mb-3 group-hover:scale-110 transition-transform" />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary-700 text-center">Anexar Comprovativo de Depósito</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*,.pdf"
                                                onChange={(e) => setEnrollmentSlip(e.target.files?.[0] || null)}
                                            />
                                        </label>
                                    ) : (
                                        <div className="flex items-center gap-4 p-5 bg-primary-50 border border-primary-200 rounded-[2rem] shadow-sm relative group">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                <Check className="w-6 h-6 text-green-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-primary-900 truncate uppercase tracking-tighter">{enrollmentSlip.name}</p>
                                                <p className="text-[10px] font-bold text-primary-400 uppercase mt-0.5">Pronto para upload</p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEnrollmentSlip(null); }}
                                                className="p-2.5 bg-white border border-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Documentos Extras</label>
                                        <button
                                            type="button"
                                            onClick={addDoc}
                                            className="text-[10px] font-black text-primary-600 uppercase hover:text-primary-700 tracking-widest bg-primary-50 px-3 py-1.5 rounded-lg"
                                        >
                                            + Adicionar
                                        </button>
                                    </div>

                                    <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                                        {extraDocs.map((doc, index) => (
                                            <div key={index} className="p-5 bg-gray-50 border border-gray-200 rounded-3xl space-y-4 relative group/doc">
                                                {extraDocs.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDoc(index)}
                                                        className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-red-500 hover:bg-white rounded-lg transition-all shadow-sm"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo</label>
                                                    <select
                                                        value={doc.type}
                                                        onChange={(e) => updateDoc(index, { type: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-black outline-none focus:ring-4 focus:ring-primary-500/10 transition-all uppercase tracking-wider"
                                                    >
                                                        <option value="">Selecione...</option>
                                                        <option value="BI/Passaporte">BI / Passaporte</option>
                                                        <option value="Certificado">Certificado</option>
                                                        <option value="Atestado">Atestado Médico</option>
                                                        <option value="Foto">Fotografias (3x4)</option>
                                                        <option value="Outro">Outro</option>
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    {!doc.file ? (
                                                        <label className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-200 rounded-2xl bg-white hover:bg-primary-50 hover:border-primary-200 transition-all cursor-pointer text-center group">
                                                            <div className="flex items-center gap-2">
                                                                <FileUp className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary-700">Anexar Ficheiro</span>
                                                            </div>
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*,.pdf"
                                                                onChange={(e) => updateDoc(index, { file: e.target.files?.[0] || null })}
                                                            />
                                                        </label>
                                                    ) : (
                                                        <div className="flex items-center gap-3 p-3 bg-white border border-primary-100 rounded-[1.25rem] shadow-sm">
                                                            <div className="p-2 bg-green-50 text-green-500 rounded-lg">
                                                                <Check className="w-4 h-4" />
                                                            </div>
                                                            <p className="flex-1 text-[10px] font-black text-gray-700 truncate uppercase tracking-tighter">{doc.file.name}</p>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateDoc(index, { file: null })}
                                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
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
                        {loading ? "Processando..." : (initialData ? "Salvar" : "Finalizar Matrícula")}
                        {!loading && <Check className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>
    );
}
