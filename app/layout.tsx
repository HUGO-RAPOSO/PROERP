import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ProERP Educacional - Sistema de Gestão para Escolas e Faculdades",
    description: "Plataforma completa de gestão educacional com módulos financeiros, acadêmicos, CRM e muito mais.",
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
