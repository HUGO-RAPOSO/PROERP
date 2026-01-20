"use client";

import React, { useState } from 'react';
import { User, FileText, DollarSign } from "lucide-react";

interface EmployeeTabsProps {
    profile: React.ReactNode;
    docs: React.ReactNode;
    financial: React.ReactNode;
}

export default function EmployeeTabs({ profile, docs, financial }: EmployeeTabsProps) {
    const [activeTab, setActiveTab] = useState("profile");

    const tabs = [
        { id: "profile", label: "Visão Geral", icon: User },
        { id: "docs", label: "Documentos", icon: FileText },
        { id: "financial", label: "Financeiro", icon: DollarSign },
    ];

    return (
        <div className="w-full">
            <div className="flex border-b border-gray-100 px-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-2
                            ${activeTab === tab.id
                                ? "border-primary-600 text-primary-600"
                                : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                            }
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="p-8 bg-gray-50/50 min-h-[400px]">
                {activeTab === "profile" && profile}
                {activeTab === "docs" && docs}
                {activeTab === "financial" && financial}
            </div>
        </div>
    );
}
