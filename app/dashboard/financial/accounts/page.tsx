import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getAccounts } from "@/lib/actions/accounts";
import AccountsClient from "./AccountsClient";

export default async function AccountsPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    const tenantId = session.user.tenantId;
    const { data: accounts } = await getAccounts(tenantId);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/financial"
                    className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Contas Financeiras</h2>
                    <p className="text-gray-500">Gerencie seus bancos, caixas e carteiras móveis.</p>
                </div>
            </div>

            <AccountsClient initialAccounts={(accounts || []) as any} tenantId={tenantId} />
        </div>
    );
}
