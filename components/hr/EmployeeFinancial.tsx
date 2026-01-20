import { formatCurrency } from "@/lib/utils";
import { DollarSign, Clock, CheckCircle } from "lucide-react";

interface EmployeeFinancialProps {
    payroll: any[];
}

export default function EmployeeFinancial({ payroll }: EmployeeFinancialProps) {
    const totalPaid = payroll
        .filter(p => p.status === 'PAID')
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const pending = payroll
        .filter(p => p.status === 'PENDING')
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-white rounded-xl text-green-600 shadow-sm">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-green-800 uppercase tracking-wider">Total Pago</span>
                    </div>
                    <p className="text-3xl font-extrabold text-green-900">{formatCurrency(totalPaid)}</p>
                </div>

                <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 bg-white rounded-xl text-orange-600 shadow-sm">
                            <Clock className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-orange-800 uppercase tracking-wider">Pendente</span>
                    </div>
                    <p className="text-3xl font-extrabold text-orange-900">{formatCurrency(pending)}</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Histórico de Pagamentos</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Data</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Valor</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payroll.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {new Date(item.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        {formatCurrency(item.amount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'PAID'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {item.status === 'PAID' ? 'Pago' : 'Pendente'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {payroll.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400 italic">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
