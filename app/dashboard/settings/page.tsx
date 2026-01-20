import { supabase } from "@/lib/supabase";
import { Settings as SettingsIcon, Shield, CreditCard, Layout, Bell, Globe } from "lucide-react";

export default async function SettingsPage() {
    const { data: tenant } = await supabase.from('Tenant').select('*').limit(1).single();

    return (
        <div className="space-y-8 max-w-5xl">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Configurações</h2>
                <p className="text-gray-500">Gerencie as preferências e configurações da sua instituição.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-2">
                    {[
                        { label: "Geral", icon: SettingsIcon, active: true },
                        { label: "Aparência", icon: Layout, active: false },
                        { label: "Segurança", icon: Shield, active: false },
                        { label: "Assinatura", icon: CreditCard, active: false },
                        { label: "Notificações", icon: Bell, active: false },
                        { label: "Domínio", icon: Globe, active: false },
                    ].map((item) => (
                        <button
                            key={item.label}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${item.active
                                ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20"
                                : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Informações da Escola</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Nome da Instituição</label>
                                <input
                                    type="text"
                                    defaultValue={tenant?.name}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Slug / URL</label>
                                <input
                                    type="text"
                                    defaultValue={tenant?.slug}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none"
                                    disabled
                                />
                                <p className="text-[10px] text-gray-400">O slug identifica sua escola na URL do sistema.</p>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <button className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all">
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Módulos Ativos</h3>
                        <div className="space-y-4">
                            {[
                                { name: "Financeiro", enabled: true },
                                { name: "CRM", enabled: true },
                                { name: "RH", enabled: true },
                                { name: "Biblioteca", enabled: true },
                                { name: "Comunicação", enabled: true },
                            ].map((module) => (
                                <div key={module.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <span className="font-bold text-gray-900">{module.name}</span>
                                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${module.enabled ? "bg-primary-600" : "bg-gray-300"}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${module.enabled ? "translate-x-6" : ""}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
