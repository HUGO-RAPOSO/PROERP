"use client";

import { motion } from "framer-motion";
import { Book, GraduationCap, PenTool, School, Star, Compass } from "lucide-react";

const icons = [
    { Icon: Book, size: 24, top: "10%", left: "5%", duration: 15, delay: 0 },
    { Icon: GraduationCap, size: 32, top: "15%", left: "85%", duration: 18, delay: 2 },
    { Icon: PenTool, size: 20, top: "45%", left: "3%", duration: 12, delay: 5 },
    { Icon: School, size: 28, top: "65%", left: "92%", duration: 20, delay: 1 },
    { Icon: Star, size: 18, top: "85%", left: "7%", duration: 14, delay: 3 },
    { Icon: Compass, size: 22, top: "10%", left: "45%", duration: 16, delay: 4 },
];

export default function BackgroundDecoration() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20 opacity-[0.03]">
            {icons.map((item, index) => (
                <motion.div
                    key={index}
                    className="absolute text-slate-900"
                    style={{ top: item.top, left: item.left }}
                    animate={{
                        y: [0, -40, 0],
                        rotate: [0, 15, -15, 0],
                    }}
                    transition={{
                        duration: item.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: item.delay,
                    }}
                >
                    <item.Icon size={item.size} />
                </motion.div>
            ))}

            {/* Subtle Gradient Spots */}
            <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[120px] opacity-30"></div>
            <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-30"></div>
        </div>
    );
}
