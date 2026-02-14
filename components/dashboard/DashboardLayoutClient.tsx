"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import { cn } from "@/lib/utils";

interface DashboardLayoutClientProps {
    children: React.ReactNode;
    userPermissions: string[];
    userRole: string;
}

export default function DashboardLayoutClient({ children, userPermissions, userRole }: DashboardLayoutClientProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Persist state if desired, or default to open
    // For now, simple state

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar with dynamic width */}
            <Sidebar
                userPermissions={userPermissions}
                userRole={userRole}
                isCollapsed={isCollapsed}
                toggleSidebar={() => setIsCollapsed(!isCollapsed)}
            />

            {/* Main Content with dynamic margin */}
            <div className={cn(
                "flex-1 transition-all duration-300 ease-in-out",
                isCollapsed ? "ml-20" : "ml-64"
            )}>
                <Header />
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
