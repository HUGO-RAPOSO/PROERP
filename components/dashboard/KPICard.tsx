import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend: string;
    color: "blue" | "purple" | "green" | "orange";
}

const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
};

const iconColorMap = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
};

export default function KPICard({ title, value, icon: Icon, trend, color }: KPICardProps) {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl", colorMap[color])}>
                    <Icon className="w-6 h-6" />
                </div>
                <span className={cn(
                    "text-xs font-bold px-2 py-1 rounded-lg",
                    trend.startsWith("+") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}>
                    {trend}
                </span>
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>

            <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000", iconColorMap[color])}
                    style={{ width: "70%" }}
                />
            </div>
        </div>
    );
}
