"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createStudent, updateStudent, createStudentDocuments } from "@/lib/actions/academic";
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
            enrollmentSlipNumber: "",
        },
    });

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
                const res = await createStudent({
                    ...values,
                    tenantId,
                    enrollmentSlipUrl
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
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Erro ao salvar aluno");
        } finally {
            setLoading(false);
        }
    }

    const addDoc = () => setExtraDocs([...extraDocs, { type: "", file: null }]);
    const removeDoc = (index: number) => setExtraDocs(extraDocs.filter((_, i) => i !== index));
    const updateDoc = (index: number, data: Partial<{ type: string, file: File | null }>) => {
        const newDocs = [...extraDocs];
        newDocs[index] = { ...newDocs[index], ...data };
        setExtraDocs(newDocs);
    };

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

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-gray-700">Documentos do Aluno</label>
                        <button
                            type="button"
                            onClick={addDoc}
                            className="text-[10px] font-black text-primary-600 uppercase hover:text-primary-700"
                        >
                            + Adicionar Documento
                        </button>
                    </div>

                    <div className="space-y-3">
                        {extraDocs.map((doc, index) => (
                            <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3 relative group/doc">
                                {extraDocs.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeDoc(index)}
                                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tipo de Documento</label>
                                    <select
                                        value={doc.type}
                                        onChange={(e) => updateDoc(index, { type: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                                    >
                                        <option value="">Selecione o tipo...</option>
                                        <option value="BI/Passaporte">BI / Passaporte</option>
                                        <option value="Certificado">Certificado de Habilitações</option>
                                        <option value="Atestado">Atestado Médico</option>
                                        <option value="Foto">Fotografias</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                    {doc.type === "Outro" && (
                                        <input
                                            type="text"
                                            placeholder="Especifique o tipo..."
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold mt-2"
                                            onChange={(e) => updateDoc(index, { type: e.target.value })}
                                        />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {!doc.file ? (
                                        <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-200 rounded-xl bg-white hover:bg-primary-50 hover:border-primary-200 transition-all cursor-pointer text-center">
                                            <div className="flex items-center gap-2">
                                                <FileUp className="w-4 h-4 text-gray-400" />
                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Anexar Ficheiro</span>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*,.pdf"
                                                onChange={(e) => updateDoc(index, { file: e.target.files?.[0] || null })}
                                            />
                                        </label>
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 bg-primary-50 border border-primary-100 rounded-xl">
                                            <FileUp className="w-4 h-4 text-primary-600" />
                                            <p className="flex-1 text-[10px] font-bold text-primary-900 truncate">{doc.file.name}</p>
                                            <button
                                                type="button"
                                                onClick={() => updateDoc(index, { file: null })}
                                                className="text-primary-400 hover:text-red-500"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Comprovativo de Depósito (Matrícula)</label>
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

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Número do Talão</label>
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
