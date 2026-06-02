import { Outlet } from 'react-router-dom';
export default function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071828] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#071828] via-[#0d2f57] to-[#193e70]" />
      <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%)]" />
      <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-[#00d7ff]/20 blur-3xl animate-blob" />
      <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-[#f9c34c]/20 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute left-1/2 top-36 h-64 w-64 -translate-x-1/2 rounded-full bg-[#ffffff]/10 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-60 w-60 rounded-full bg-[#21e3ff]/20 blur-3xl animate-blob animation-delay-1500" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-10 top-24 h-16 w-16 rounded-full bg-[#fcd34d]/80 shadow-[0_0_120px_rgba(252,211,77,0.4)] animate-coin-spin"></div>
        <div className="absolute right-20 top-10 h-14 w-14 rounded-full bg-[#34d399]/90 shadow-[0_0_100px_rgba(52,211,153,0.3)] animate-coin-float animation-delay-500"></div>
        <div className="absolute left-8 bottom-24 h-20 w-20 rounded-full bg-[#f472b6]/70 shadow-[0_0_130px_rgba(244,114,182,0.3)] animate-coin-float animation-delay-1200"></div>
        <div className="absolute right-24 bottom-16 h-12 w-12 rounded-full bg-[#60a5fa]/80 shadow-[0_0_90px_rgba(96,165,250,0.35)] animate-coin-spin animation-delay-800"></div>
      </div>
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        <span className="text-lg font-bold tracking-tight text-white">STOCHY</span>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-200/80">
          <a href="#" className="hover:text-white transition-colors">Home</a>
          <a href="#" className="hover:text-white transition-colors">Services</a>
          <a href="#" className="hover:text-white transition-colors">Reviews</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </nav>
      </header>
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl p-6 lg:p-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr] items-center">
              <div className="space-y-4 p-4 rounded-3xl bg-white/5 border border-white/10 shadow-inner shadow-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#ffb703] text-xl font-extrabold text-slate-950 shadow-lg">S</div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">STOCHY</h1>
                    <p className="text-sm text-slate-200/80">Gestion intelligente de votre portefeuille</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-lg font-semibold">Bienvenue</p>
                  <p className="text-sm text-slate-200/80">Accédez à vos finances avec un tableau clair, des objectifs, et des alertes personnalisées.</p>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-3xl bg-slate-950/80 p-4 text-slate-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Portefeuille</p>
                    <p className="text-2xl font-semibold">12 420€</p>
                  </div>
                  <div className="rounded-3xl bg-slate-950/80 p-4 text-slate-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Transactions</p>
                    <p className="text-2xl font-semibold">+ 8 ce mois</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-950/95 rounded-[2rem] p-6 shadow-2xl border border-white/10">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
