import { Sparkles, Crown, Cpu } from "lucide-react";

export default function Header({ 
  onHistoryClick,
  onExportSettingsClick
}: { 
  onHistoryClick?: () => void;
  onExportSettingsClick?: () => void;
}) {
  return (
    <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Side: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 accent-gradient rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-500/20">
            L
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Logo<span className="text-blue-400 glow font-extrabold">Forge</span> AI
            </h1>
            <p className="text-[10px] text-white/50 tracking-wider uppercase font-mono">Next-Gen Brand Motion Studio</p>
          </div>
        </div>

        {/* Navigation Items aligned with Design Theme */}
        <nav className="flex gap-6 text-sm font-medium text-white/60">
          <span className="text-white hover:text-white transition cursor-pointer">Dashboard</span>
          <button onClick={onHistoryClick} className="hover:text-white transition cursor-pointer flex items-center gap-1">
            History
          </button>
          <button onClick={onExportSettingsClick} className="hover:text-white transition cursor-pointer flex items-center gap-1">
            Export Settings
          </button>
          <span className="hover:text-white transition cursor-pointer text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/20 text-blue-300">Veo v3.1</span>
        </nav>

        {/* Right Side: Quick info tags & Premium */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-medium text-white/70">
            <Cpu className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
            <span>gemini-3-pro</span>
          </div>

          <button className="px-5 py-1.5 rounded-full glass text-xs font-semibold border-white/20 hover:bg-white/10 active:scale-95 transition text-white cursor-pointer">
            Premium Upgrade
          </button>
        </div>
      </div>
    </header>
  );
}
