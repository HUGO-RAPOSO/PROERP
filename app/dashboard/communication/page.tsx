import { supabase } from "@/lib/supabase";
import MessageList from "@/components/communication/MessageList";
import MessageManager from "./MessageManager";
import { MessageSquare, Bell, Filter, Search } from "lucide-react";

export default async function CommunicationPage() {
    const { data: firstTenant } = await supabase.from('Tenant').select('id').limit(1).single();
    const tenantId = firstTenant?.id;

    if (!tenantId) return <div>Tenant not found</div>;

    const { data: messages } = await supabase
        .from('Message')
        .select('*')
        .eq('tenantId', tenantId)
        .order('createdAt', { ascending: false });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Comunicação</h2>
                    <p className="text-gray-500">Envie avisos, e-mails e gerencie as notificações da escola.</p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm">
                        <Bell className="w-5 h-5" />
                        Histórico de Avisos
                    </button>
                    <MessageManager tenantId={tenantId} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h3 className="text-xl font-bold text-gray-900">Últimas Mensagens</h3>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar mensagem..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                />
                            </div>
                        </div>
                        <MessageList messages={messages || []} />
                        {(messages || []).length === 0 && (
                            <div className="p-20 text-center">
                                <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-500">Nenhuma mensagem encontrada.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Canais de Envio</h3>
                        <div className="space-y-4">
                            {[
                                { label: "App ProERP", value: "Ativo", color: "text-green-600", bg: "bg-green-50" },
                                { label: "WhatsApp API", value: "Configurar", color: "text-primary-600", bg: "bg-primary-50" },
                                { label: "E-mail (SMTP)", value: "Ativo", color: "text-green-600", bg: "bg-green-50" },
                                { label: "SMS Gateway", value: "Desativado", color: "text-gray-400", bg: "bg-gray-50" },
                            ].map((channel) => (
                                <div key={channel.label} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                                    <span className="font-bold text-gray-900">{channel.label}</span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${channel.bg} ${channel.color}`}>
                                        {channel.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-3xl p-8 text-white shadow-xl shadow-primary-500/20">
                        <h4 className="font-bold mb-2">Dica de Engajamento</h4>
                        <p className="text-sm text-primary-50 opacity-90 leading-relaxed">
                            Avisos enviados via App têm 3x mais taxa de leitura do que e-mails tradicionais.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
