export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-cyan-400 mb-2">404</h1>
      <p className="text-slate-400 text-sm mb-4">Página não encontrada.</p>
      <a href="/" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all">
        Voltar para o Início
      </a>
    </div>
  );
}
