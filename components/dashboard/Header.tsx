"use client";

import { Bell, Search, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
    const { data: session } = useSession();

    return (
        <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-white/80">
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-all relative">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>

                <div className="h-8 w-px bg-gray-200 mx-2" />

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 p-1.5 pr-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                            {session?.user?.name?.[0] || "U"}
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-bold text-gray-900">{session?.user?.name || "Usuário"}</p>
                            <p className="text-xs text-gray-500">{session?.user?.role || "Usuário"}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => signOut({ callbackUrl: "/auth/login" })}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 group"
                        title="Sair"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </header>
    );
}
