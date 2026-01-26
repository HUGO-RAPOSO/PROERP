"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createStudent, updateStudent } from "@/lib/actions/academic";
import { useState } from "react";
import { Loader2, FileUp, X, CreditCard, User as UserIcon } from "lucide-react";
import { uploadFileAdmin } from "@/lib/actions/storage-actions";

const studentSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    phone: z.string().optional(),
    courseId: z.string().min(1, "O curso é obrigatório"),
    enrollmentSlipNumber: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentModalProps {
    tenantId: string;
    onSuccess: () => void;
    initialData?: StudentFormValues & { id: string };
    courses: { id: string; name: string }[];
}

export default function StudentForm({ tenantId, onSuccess, initialData, courses }: StudentModalProps) {
    const [loading, setLoading] = useState(false);
    const [studentDoc, setStudentDoc] = useState<File | null>(null);
    const [enrollmentSlip, setEnrollmentSlip] = useState<File | null>(null);

    const form = useForm<StudentFormValues>({
        resolver: zodResolver(studentSchema),
        defaultValues: initialData || {
            name: "",
            email: "",
            phone: "",
            courseId: "",
            enrollmentSlipNumber: "",
        },
    });

    async function onSubmit(values: StudentFormValues) {
        setLoading(true);
        try {
            let documentUrl = "";
            let enrollmentSlipUrl = "";

            if (studentDoc) {
                const formData = new FormData();
                formData.append('file', studentDoc);
                const path = `students/${tenantId}/docs_${Date.now()}_${studentDoc.name}`;
                const res = await uploadFileAdmin(formData, path);
                if (res.success) documentUrl = res.path || "";
            }

            if (enrollmentSlip) {
                const formData = new FormData();
                formData.append('file', enrollmentSlip);
                const path = `students/${tenantId}/slip_${Date.now()}_${enrollmentSlip.name}`;
                const res = await uploadFileAdmin(formData, path);
                if (res.success) enrollmentSlipUrl = res.path || "";
            }

            if (initialData) {
                await updateStudent(initialData.id, {
                    ...values,
                    documentUrl: documentUrl || undefined,
                    enrollmentSlipUrl: enrollmentSlipUrl || undefined
                } as any);
            } else {
                await createStudent({
                    ...values,
                    tenantId,
                    documentUrl,
                    enrollmentSlipUrl
                });
            }
            onSuccess();
            form.reset();
            setStudentDoc(null);
            setEnrollmentSlip(null);
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar aluno");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Nome Completo</label>
                <input
                    {...form.register("name")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    placeholder="Ex: Ana Maria Silva"
                />
                {form.formState.errors.name && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Curso</label>
                <select
                    {...form.register("courseId")}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none"
                >
                    <option value="">Selecione o curso...</option>
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.name}
                        </option>
                    ))}
                </select>
                {form.formState.errors.courseId && (
                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.courseId.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">E-mail</label>
                    <input
                        {...form.register("email")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="ana@email.com"
                    />
                    {form.formState.errors.email && (
                        <p className="text-xs text-red-500 font-medium">{form.formState.errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Telefone</label>
                    <input
                        {...form.register("phone")}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                        placeholder="(11) 99999-9999"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-xs font-black text-primary-600 uppercase tracking-widest border-b border-primary-100 pb-2">Documentação e Matrícula</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Documento do Aluno (BI/Passaporte)</label>
                        {!studentDoc ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100/50 hover:border-primary-300 transition-all cursor-pointer group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                    <FileUp className="w-6 h-6 text-gray-400 group-hover:text-primary-600 mb-2" />
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Anexar Documento</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={(e) => setStudentDoc(e.target.files?.[0] || null)}
                                />
                            </label>
                        ) : (
                            <div className="flex items-center gap-3 p-4 bg-primary-50 border border-primary-100 rounded-2xl">
                                <FileUp className="w-5 h-5 text-primary-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-primary-900 truncate">{studentDoc.name}</p>
                                </div>
                                <button onClick={() => setStudentDoc(null)} className="p-2 hover:bg-white rounded-xl transition-colors text-primary-400 hover:text-red-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Comprovativo de Depósito</label>
                        {!enrollmentSlip ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100/50 hover:border-primary-300 transition-all cursor-pointer group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                    <CreditCard className="w-6 h-6 text-gray-400 group-hover:text-primary-600 mb-2" />
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Anexar Talão</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={(e) => setEnrollmentSlip(e.target.files?.[0] || null)}
                                />
                            </label>
                        ) : (
                            <div className="flex items-center gap-3 p-4 bg-primary-50 border border-primary-100 rounded-2xl">
                                <CreditCard className="w-5 h-5 text-primary-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-primary-900 truncate">{enrollmentSlip.name}</p>
                                </div>
                                <button onClick={() => setEnrollmentSlip(null)} className="p-2 hover:bg-white rounded-xl transition-colors text-primary-400 hover:text-red-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Número do Talão de Matrícula</label>
                    <div className="relative">
                        <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                            {...form.register("enrollmentSlipNumber")}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                            placeholder="Ex: 12345678"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? "Salvando..." : (initialData ? "Salvar Alterações" : "Cadastrar Aluno")}
                </button>
            </div>
        </form>
    );
}
