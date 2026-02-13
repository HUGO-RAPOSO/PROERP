"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    GraduationCap,
    Users,
    DollarSign,
    Settings,
    LogOut,
    MessageSquare,
    BookOpen,
    PieChart,
    Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

import { PERMISSIONS, hasPermission } from "@/lib/utils/permissions";

const menuItems = [
    { name: "Visão Geral", icon: LayoutDashboard, href: "/dashboard" }, // Public or basic access
    { name: "Minhas Notas", icon: PieChart, href: "/dashboard/student/grades", role: "STUDENT" },
    { name: "Lançar Notas", icon: GraduationCap, href: "/dashboard/teacher/grades", role: "TEACHER" },
    { name: "Acadêmico", icon: GraduationCap, href: "/dashboard/academic", permission: PERMISSIONS.ACADEMIC_ACCESS },
    { name: "Financeiro", icon: DollarSign, href: "/dashboard/financial", permission: PERMISSIONS.FINANCIAL_ACCESS },
    { name: "CRM", icon: Users, href: "/dashboard/crm", permission: PERMISSIONS.CRM_ACCESS },
    { name: "RH", icon: Briefcase, href: "/dashboard/hr", permission: PERMISSIONS.HR_ACCESS },
    { name: "Comunicação", icon: MessageSquare, href: "/dashboard/communication", permission: PERMISSIONS.COMMUNICATION_ACCESS },
    { name: "Biblioteca", icon: BookOpen, href: "/dashboard/library", permission: PERMISSIONS.LIBRARY_ACCESS },
    { name: "Relatórios", icon: PieChart, href: "/dashboard/reports" },
    { name: "Configurações", icon: Settings, href: "/dashboard/settings", permission: PERMISSIONS.SETTINGS_ACCESS },
];

interface SidebarProps {
    userPermissions?: string[];
    userRole?: string;
}

export default function Sidebar({ userPermissions = [], userRole }: SidebarProps) {
    const pathname = usePathname();
    const isAdmin = userRole === 'ADMIN' || userRole === 'admin';

    const filteredItems = menuItems.filter(item => {
        // Special case for Student: Only show Library and Grades
        if (userRole === 'STUDENT') {
            return item.name === 'Biblioteca' || item.name === 'Minhas Notas';
        }

        if (item.role && userRole !== item.role) return false;
        if (!item.permission) return true; // Always show if no permission required
        if (isAdmin) return true; // Admin sees everything
        return hasPermission(userPermissions, item.permission);
    });

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-50 overflow-y-auto">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    ProERP
                </h1>
                <p className="text-xs text-gray-500 mt-1">Escola Exemplo</p>
            </div>

            <nav className="mt-4 px-4 space-y-1">
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary-50 text-primary-600"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"
                            )} />
                            <span className="font-medium">{item.name}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="absolute bottom-6 left-0 w-full px-6">
                <button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sair</span>
                </button>
            </div>
        </aside>
    );
}
