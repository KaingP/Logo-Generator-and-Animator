import React, { useState } from "react";
import { Sparkles, Image as ImageIcon, Download, Settings, ChevronRight, Layers, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { GeneratedLogo, LogoSize } from "../types";

interface LogoDesignerProps {
  onLogoCreated: (logo: GeneratedLogo) => void;
}

const PRESET_STYLES = [
  { name: "Minimalist Grid", prompt: "Minimalist clean geometric design, perfect radial symmetry, abstract vector symbol, pristine white background, modern corporate brand aesthetic" },
  { name: "Luxury Crest", prompt: "Luxurious royal monogram crest with elegant ornamental scrollwork, metallic gold gradient, symmetrical crest emblem, fine detail vector illustration" },
  { name: "Cyberpunk Tech", prompt: "Futuristic tech corporate logo, glowing cyan helix circuitry grid, dark digital matte canvas, sharp neon geometric outline" },
  { name: "Organic Botanical", prompt: "Minimal botanical leaf logo asset, organic hand-drawn fluid curves, earth tone terracotta palette, flat vector illustration" },
  { name: "Retro Mascot", prompt: "Vintage bold corporate cartoon mascot, 1970s playful aesthetic, clean thick lines, warm solid cream background" }
];

export default function LogoDesigner({ onLogoCreated }: LogoDesignerProps) {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<LogoSize>("1K");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLogo, setCurrentLogo] = useState<GeneratedLogo | null>(null);

  const [showExportMenu, setShowExportMenu] = useState(false);

  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadLogo = (format: "png" | "svg") => {
    if (!currentLogo) return;
    setShowExportMenu(false);

    if (format === "svg") {
      if (currentLogo.isFallback) {
        triggerDownload(currentLogo.imageUrl, `logo-${currentLogo.size.toLowerCase()}.svg`);
      } else {
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><image href="${currentLogo.imageUrl}" width="1024" height="1024" /></svg>`;
        const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
        const svgUrl = URL.createObjectURL(svgBlob);
        triggerDownload(svgUrl, `logo-${currentLogo.size.toLowerCase()}.svg`);
        URL.revokeObjectURL(svgUrl);
      }
    } else {
      if (!currentLogo.isFallback) {
        triggerDownload(currentLogo.imageUrl, `logo-${currentLogo.size.toLowerCase()}.png`);
      } else {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
          if (ctx) {
            canvas.width = img.width || 1024;
            canvas.height = img.height || 1024;
            ctx.fillStyle = "#050505";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const pngUrl = canvas.toDataURL("image/png");
            triggerDownload(pngUrl, `logo-${currentLogo.size.toLowerCase()}.png`);
          }
        };
        img.src = currentLogo.imageUrl;
      }
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-logo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          size: size,
          aspectRatio: aspectRatio,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Logo generation failed");
      }

      const newLogo: GeneratedLogo = {
        imageUrl: data.imageUrl,
        base64: data.base64,
        description: data.description,
        timestamp: new Date().toLocaleTimeString(),
        prompt: prompt,
        size: size,
        aspectRatio: aspectRatio,
        engine: data.engine,
        isFallback: data.isFallback
      };

      setCurrentLogo(newLogo);
      onLogoCreated(newLogo);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong generating your logo. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const selectPreset = (presetPrompt: string) => {
    setPrompt(presetPrompt);
  };

  return (
    <div id="logo-designer-panel" className="glass rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Subtle background glow inside panel */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <ImageIcon className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Step 1: Design Brand Logo</h2>
        </div>
        <span className={`text-[10px] uppercase tracking-wider font-mono px-2.5 py-0.5 rounded border ${
          currentLogo?.isFallback 
            ? "bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold"
            : "bg-white/5 text-white/45 border-white/10"
        }`}>
          {currentLogo?.engine || "gemini-3.pro-image"}
        </span>
      </div>

      <form onSubmit={handleGenerate} className="space-y-5 relative z-10">
        {/* Brand Prompt Description */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-white/60 flex items-center justify-between" id="prompt-label">
            <span>Describe Your Company & Brand Theme</span>
            <span className="text-white/30 text-[10px] font-mono">Detailed prompt works best</span>
          </label>
          <textarea
            aria-labelledby="prompt-label"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="e.g. A futuristic renewable energy company logo featuring a clean minimalist emerald leaf integrated with a wind turbine vector icon, premium gradient on solid color, corporate styling..."
            className="w-full text-sm py-3 px-4 rounded-2xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none shadow-inner"
          />
        </div>

        {/* Preset Prompt Shortcuts */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-white/45">Quick Styles & Themes:</span>
          <div className="flex flex-wrap gap-2">
            {PRESET_STYLES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => selectPreset(preset.prompt)}
                className="sidebar-item text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border border-white/10 text-white/70 hover:text-white transition cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Quality and Size Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-white/50 flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5 text-white/30" />
              Image Resolution
            </span>
            <div className="grid grid-cols-3 gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              {(["1K", "2K", "4K"] as LogoSize[]).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setSize(res)}
                  className={`text-xs font-bold py-1.5 rounded-lg transition-all cursor-pointer ${
                    size === res
                      ? "accent-gradient text-white shadow-lg shadow-blue-500/10"
                      : "text-white/40 hover:text-white/80"
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/30 font-mono mt-0.5 pl-1">
              {size === "1K" ? "1024 × 1024 (Standard)" : size === "2K" ? "2048 × 2048 (Print-Ready)" : "4096 × 4096 (Cinematic Ultra)"}
            </p>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-white/50 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-white/30" />
              Layout Template
            </span>
            <div className="grid grid-cols-4 gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              {["1:1", "16:9", "4:3", "9:16"].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`text-xs font-mono font-bold py-1.5 rounded-lg transition-all cursor-pointer ${
                    aspectRatio === ratio
                      ? "bg-white/10 text-white border border-white/10"
                      : "text-white/40 hover:text-white/80"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/30 font-mono mt-0.5 pl-1">Ideal vector framing scale</p>
          </div>
        </div>

        {/* Generate Trigger Button */}
        <button
          type="submit"
          disabled={generating || !prompt.trim()}
          className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
            generating
              ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
              : !prompt.trim()
              ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
              : "accent-gradient hover:scale-[1.01] active:scale-[0.99] text-white shadow-blue-500/15 shadow-xl hover:shadow-blue-500/25"
          }`}
        >
          {generating ? (
            <>
              <div className="h-4 w-4 border-2 border-t-transparent border-white/80 rounded-full animate-spin"></div>
              <span>Formulating Creative Vector Asset...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 animate-pulse text-amber-300" />
              <span>GENERATE LOGO</span>
            </>
          )}
        </button>
      </form>

      {/* Error Feedback */}
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex flex-col gap-1 z-10 relative">
          <strong className="font-semibold">Logo Generation Error:</strong>
          <p>{error}</p>
        </div>
      )}

      {/* Showcase Result Frame with Blue/Purple Blur Spot behind SVG/PNG */}
      {currentLogo ? (
        <div className="border border-white/10 rounded-2xl bg-white/5 p-4 space-y-4 shadow-inner relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Rendered Logo Asset</span>
            <span className="text-[10px] text-white/40 font-mono">{currentLogo.timestamp}</span>
          </div>

          <div className="relative aspect-video sm:aspect-square bg-[#050505]/40 rounded-xl overflow-hidden border border-white/15 flex items-center justify-center max-h-80 mx-auto group">
            {/* Spotlight behind SVG/PNG */}
            <div className="absolute inset-0 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
            
            <img
              src={currentLogo.imageUrl}
              alt="AI Designed Brand Logo"
              referrerPolicy="no-referrer"
              className="object-contain w-full h-full max-h-80 select-none pointer-events-none p-4 relative z-10"
              id="designed-logo-preview"
            />
            {/* Resolution indicator tag */}
            <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-[10px] font-mono text-white/70 flex items-center gap-1.5 z-20">
              <span>{currentLogo.aspectRatio}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping"></span>
              <span>{currentLogo.size} Quality</span>
            </div>
          </div>

          <div className="space-y-2 pl-1">
            <p className="text-xs text-white/60 italic line-clamp-2">
              &ldquo;{currentLogo.prompt}&rdquo;
            </p>
          </div>

          {currentLogo.isFallback && (
            <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-[11px] text-amber-300/90 leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-400">
                <span>✨ Immersive Vector Synthesis Active</span>
              </p>
              <p>
                Standard image generation quotas are temporarily reached, so our automated fallback engine custom-designed this premium XML Vector Asset matching your business vibe. Proceed instantly to animate it in Step 2!
              </p>
            </div>
          )}

          <div className="flex gap-2 relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex-1 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 text-xs text-white py-2.5 rounded-xl font-bold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              EXPORT LOGO
              {showExportMenu ? <ChevronUp className="h-3.5 w-3.5 opacity-50" /> : <ChevronDown className="h-3.5 w-3.5 opacity-50" />}
            </button>
            
            {showExportMenu && (
              <div className="absolute top-full mt-2 w-full bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl p-1 z-50 overflow-hidden flex flex-col">
                <button
                  onClick={() => downloadLogo("png")}
                  className="w-full text-left px-3 py-2.5 text-xs font-semibold hover:bg-white/5 rounded-lg text-white/80 hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>Download PNG Image</span>
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/10">Raster</span>
                </button>
                <div className="h-px w-full bg-white/5 my-0.5" />
                <button
                  onClick={() => downloadLogo("svg")}
                  className="w-full text-left px-3 py-2.5 text-xs font-semibold hover:bg-white/5 rounded-lg text-white/80 hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>Download SVG Vector</span>
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/10">Vector</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-white/10 rounded-2xl py-12 px-6 text-center text-white/30 bg-white/[0.02] relative z-10">
          <ImageIcon className="h-8 w-8 mx-auto stroke-1.5 mb-2.5 text-white/20" />
          <p className="text-sm font-semibold">No Logo Designed Yet</p>
          <p className="text-xs text-white/40 mt-1 max-w-xs mx-auto">
            Use the form above to outline your business concept and render your custom high-quality corporate branding asset.
          </p>
        </div>
      )}
    </div>
  );
}
