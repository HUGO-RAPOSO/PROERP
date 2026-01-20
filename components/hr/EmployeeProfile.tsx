import { formatCurrency } from "@/lib/utils";
import { Mail, Phone, Briefcase, Calendar, DollarSign, FileText } from "lucide-react";

interface EmployeeProfileProps {
    employee: any;
}

export default function EmployeeProfile({ employee }: EmployeeProfileProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-gray-900">Informações Pessoais</h3>

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{employee.email || "Não informado"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Telefone</p>
                            <p className="font-medium text-gray-900">{employee.phone || "Não informado"}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-gray-900">Informações Contratuais</h3>

                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Cargo</p>
                            <p className="font-medium text-gray-900">{employee.role?.name || "Sem cargo"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Salário Base</p>
                            <p className="font-medium text-gray-900">{formatCurrency(employee.salary)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tipo de Contrato</p>
                            <p className="font-medium text-gray-900">{employee.contract?.name || "Não definido"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Data de Admissão</p>
                            <p className="font-medium text-gray-900">
                                {new Date(employee.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
