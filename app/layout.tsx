import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Transporte Escolar",
  description: "Sistema de gestión de transporte escolar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

