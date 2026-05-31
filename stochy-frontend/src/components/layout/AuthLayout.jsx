import { Outlet } from 'react-router-dom';
export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A3C6E] via-[#2E5FA3] to-[#0F2847] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F0A500] to-[#E09000] flex items-center justify-center text-white font-extrabold text-2xl shadow-lg">S</div>
            <span className="text-3xl font-bold text-white tracking-tight">STOCHY</span>
          </div>
          <p className="text-white/60 text-sm">Gestion intelligente de votre portefeuille</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8"><Outlet /></div>
      </div>
    </div>
  );
}
