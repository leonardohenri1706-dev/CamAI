import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/components/QueryProvider';

export const metadata: Metadata = {
  title: 'LeadPulse B2B - Prospecção Inteligente para Desenvolvedores',
  description: 'Encontre clientes locais em potencial para seus projetos GitHub com análise preditiva de fechamento por IA.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
