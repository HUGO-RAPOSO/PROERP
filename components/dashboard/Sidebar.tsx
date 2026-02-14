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
    { name: "Minhas Turmas", icon: Users, href: "/dashboard/teacher", role: "TEACHER" },
    { name: "Acadêmico", icon: GraduationCap, href: "/dashboard/academic", permission: PERMISSIONS.ACADEMIC_ACCESS },
    { name: "Financeiro", icon: DollarSign, href: "/dashboard/financial", permission: PERMISSIONS.FINANCIAL_ACCESS },
    { name: "CRM", icon: Users, href: "/dashboard/crm", permission: PERMISSIONS.CRM_ACCESS },
    { name: "RH", icon: Briefcase, href: "/dashboard/hr", permission: PERMISSIONS.HR_ACCESS },
    { name: "Comunicação", icon: MessageSquare, href: "/dashboard/communication", permission: PERMISSIONS.COMMUNICATION_ACCESS },
    { name: "Biblioteca", icon: BookOpen, href: "/dashboard/library", permission: PERMISSIONS.LIBRARY_ACCESS },
    { name: "Relatórios", icon: PieChart, href: "/dashboard/reports" },
    { name: "Configurações", icon: Settings, href: "/dashboard/settings", permission: PERMISSIONS.SETTINGS_ACCESS },
];

import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
    userPermissions?: string[];
    userRole?: string;
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export default function Sidebar({ userPermissions = [], userRole, isCollapsed, toggleSidebar }: SidebarProps) {
    const pathname = usePathname();
    const isAdmin = userRole === 'ADMIN' || userRole === 'admin';

    const filteredItems = menuItems.filter(item => {
        // Special case for Student: Only show Library and Grades
        if (userRole === 'STUDENT') {
            return item.name === 'Biblioteca' || item.name === 'Minhas Notas';
        }

        // Special case for Teacher: Only show Library and Grades Input
        if (userRole === 'TEACHER') {
            return item.name === 'Biblioteca' || item.name === 'Minhas Turmas';
        }

        if (item.role && userRole !== item.role) return false;
        if (!item.permission) return true; // Always show if no permission required
        if (isAdmin) return true; // Admin sees everything
        return hasPermission(userPermissions, item.permission);
    });

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out flex flex-col",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className={cn("p-6 flex items-center justify-between", isCollapsed && "px-4 justify-center")}>
                {!isCollapsed && (
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent truncate">
                            ProERP
                        </h1>
                        <p className="text-xs text-gray-500 mt-1 truncate">Escola Exemplo</p>
                    </div>
                )}
                {isCollapsed && (
                    <div className="w-8 h-8 rounded-lg bg-primary-100/50 flex items-center justify-center text-primary-600 font-bold text-sm">
                        P
                    </div>
                )}
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-9 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-200 shadow-sm transition-all z-50"
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </button>

            <nav className="mt-4 px-3 space-y-1 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={isCollapsed ? item.name : undefined}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-primary-50 text-primary-600"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                isCollapsed ? "justify-center" : ""
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors shrink-0",
                                isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"
                            )} />
                            {!isCollapsed && <span className="font-medium truncate">{item.name}</span>}
                            {!isCollapsed && isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0" />
                            )}
                        </Link>
                    );
                })}
            </nav>


        </aside>
    );
}
