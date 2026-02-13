"use client";

import { useEffect } from "react";

export default function PrintTrigger() {
    useEffect(() => {
        window.print();
    }, []);

    return (
        <style jsx global>{`
            @media print {
                @page { margin: 1cm; size: A4; }
                body { -webkit-print-color-adjust: exact; }
            }
        `}</style>
    );
}
