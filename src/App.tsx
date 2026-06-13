import { useState } from "react";
import Header from "./components/Header";
import LogoDesigner from "./components/LogoDesigner";
import LogoAnimator from "./components/LogoAnimator";
import LogoHistorySidebar from "./components/LogoHistorySidebar";
import ExportSettingsModal from "./components/ExportSettingsModal";
import { GeneratedLogo } from "./types";
import { Compass, HelpCircle, Laptop, Film, Sparkles } from "lucide-react";

export default function App() {
  const [createdLogo, setCreatedLogo] = useState<GeneratedLogo | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportSettingsOpen, setIsExportSettingsOpen] = useState(false);
  const [logoHistory, setLogoHistory] = useState<GeneratedLogo[]>([]);

  const handleLogoCreated = (logo: GeneratedLogo) => {
    setCreatedLogo(logo);
    setLogoHistory(prev => [logo, ...prev]);
    // Smoothly scroll down to the Animation panel on mobile devices if needed
    const animatorPanel = document.getElementById("logo-animator-panel");
    if (animatorPanel) {
      animatorPanel.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectHistoryLogo = (logo: GeneratedLogo) => {
    setCreatedLogo(logo);
    setIsHistoryOpen(false);
    const animatorPanel = document.getElementById("logo-animator-panel");
    if (animatorPanel) {
      animatorPanel.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-white antialiased relative overflow-hidden">
      {/* Immersive UI Radial Atmospheric Ambient Lights */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Premium Header */}
      <Header 
        onHistoryClick={() => setIsHistoryOpen(true)} 
        onExportSettingsClick={() => setIsExportSettingsOpen(true)}
      />

      {/* History Sidebar Panel */}
      <LogoHistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={logoHistory} 
        onSelectLogo={handleSelectHistoryLogo} 
      />

      {/* Export Settings Modal */}
      <ExportSettingsModal 
        isOpen={isExportSettingsOpen}
        onClose={() => setIsExportSettingsOpen(false)}
      />

      {/* Main Studio Arena */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">
        {/* Intro & Showcase banner */}
        <section className="glass rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          {/* Subtle dotted matrix background for tech vibe */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-semibold text-blue-300">
              <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
              <span>Next-Gen Brand Motion Studio</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-none">
              Transform Your Vision Into <br className="hidden sm:block" />
              An <span className="accent-text-gradient glow">Animated Masterpiece</span>
            </h2>
            
            <p className="text-sm sm:text-base text-zinc-300/80 leading-relaxed max-w-2xl">
              An artificial intelligence workspace built to design spectacular vector-style branding logos up to 4K print quality, and immediately render luxurious 3D video intros using the state-of-the-art Veo studio engine.
            </p>

            {/* Simple Step Guidelines */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 mt-6">
              <div className="flex gap-3">
                <span className="h-6 w-6 rounded-md bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Describe Theme</h4>
                  <p className="text-[11px] text-zinc-500">Provide details about your business concept</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="h-6 w-6 rounded-md bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Scale up to 4K</h4>
                  <p className="text-[11px] text-zinc-500">Select precise resolution & pixel outputs</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="h-6 w-6 rounded-md bg-zinc-600/20 text-white/80 border border-white/20 text-xs font-mono font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Animate via Veo</h4>
                  <p className="text-[11px] text-zinc-500">Breathe life with professional motion physics</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workspace Dual-Panel Splitter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Split: Design Board */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/40 tracking-widest uppercase px-1">
              <Compass className="h-3.5 w-3.5 text-blue-400" />
              <span>Logo Synthesis</span>
            </div>
            <LogoDesigner onLogoCreated={handleLogoCreated} />
          </div>

          {/* Right Split: Motion Video Board */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/40 tracking-widest uppercase px-1">
              <Laptop className="h-3.5 w-3.5 text-purple-400" />
              <span>Motion Board</span>
            </div>
            <LogoAnimator importedLogo={createdLogo} />
          </div>
        </div>

        {/* Bottom Technical Overview Fold */}
        <footer className="border-t border-white/10 pt-8 pb-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-zinc-600" />
            <span>Need advice? Describe specific design textures (e.g. "matte ceramic", "gold leaf") for beautiful gradients.</span>
          </div>
          <p className="font-mono text-[10px] tracking-wider uppercase">
            Powered by <strong className="text-zinc-400">Google Gemini</strong> • <strong className="text-zinc-400">Veo 3.1</strong>
          </p>
        </footer>
      </main>
    </div>
  );
}
