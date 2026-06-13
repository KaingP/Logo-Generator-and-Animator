import React, { useState, useEffect, useRef } from "react";
import { Video as VideoIcon, Image as ImageIcon, Sparkles, Upload, Play, AlertCircle, RefreshCw, Layers, Check, Download, Film, Loader2 } from "lucide-react";
import { GeneratedLogo, AnimationOperation } from "../types";
import InteractiveCinematicRenderer from "./InteractiveCinematicRenderer";

interface LogoAnimatorProps {
  importedLogo: GeneratedLogo | null;
}

const MOTION_PRESETS = [
  { name: "3D Corporate Reveal", prompt: "Bring this brand asset into 3D space with a luxury slow rotation reveal. Subdued glossy metallic reflections, soft particles, focus rack camera zoom, matching color studio environment, corporate showcase style." },
  { name: "Neon Cybernetic Wave", prompt: "Generate high-frequency energy flows tracing the outlines of this logo. Pulse kinetic lights, futuristic cyber glow, smooth camera pan, glossy black liquid surface background, dramatic tech intro." },
  { name: "Fluid Liquid Gloss", prompt: "A smooth, elegant wave of liquid metal or gold paint shifts around the logo structure. Organic reflections, clean ambient environment, studio key-lighting, slow motion macro detail." },
  { name: "Cosmic Nebula Dust", prompt: "Earthy space particles swirl gently behind and through this brand icon. Deep cosmos dust clouds, ambient violet-blue backlighting, stellar cinematic depth of field." }
];

export default function LogoAnimator({ importedLogo }: LogoAnimatorProps) {
  const [imageSource, setImageSource] = useState<"imported" | "upload">("imported");
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedMime, setUploadedMime] = useState<string | null>(null);
  const [motionPrompt, setMotionPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  
  const [isDragActive, setIsDragActive] = useState(false);
  const [animatingState, setAnimatingState] = useState<AnimationOperation>({
    operationName: "",
    status: "idle",
    progressMsg: "",
    aspectRatio: "16:9"
  });

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<any>(null);

  const REASSURING_MESSAGES = [
    "Establishing connection with Veo 3.1 engine...",
    "Analyzing brand vectors and core geometries...",
    "Generating premium high-fidelity motion-path keyframes...",
    "Simulating physics, fluid waves, and glossy surface reflections...",
    "Rendering dynamic studio key-lights and soft shadow maps...",
    "Running volumetric camera depth-of-field passes...",
    "Polishing frame integration and motion stabilization..."
  ];

  // Cycle reassurance loading messages during video generation
  useEffect(() => {
    let interval: any;
    if (animatingState.status === "running") {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % REASSURING_MESSAGES.length);
      }, 4500);
    }
    return () => clearInterval(interval);
  }, [animatingState.status]);

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Update animation prompt if imported logo changes
  useEffect(() => {
    if (importedLogo && imageSource === "imported") {
      // populate defaults if empty
      if (!motionPrompt) {
        setMotionPrompt(MOTION_PRESETS[0].prompt);
      }
    }
  }, [importedLogo, imageSource]);

  // File drag & drop handling
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedBase64(reader.result as string);
      setUploadedMime(file.type);
      setImageSource("upload");
    };
    reader.readAsDataURL(file);
  };

  const clearUploadedFile = () => {
    setUploadedBase64(null);
    setUploadedMime(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnimate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Choose active base64 image
    let base64Image = "";
    let mimeType = "image/png";

    if (imageSource === "imported") {
      if (!importedLogo) return;
      base64Image = importedLogo.base64;
      mimeType = "image/png";
    } else {
      if (!uploadedBase64) return;
      base64Image = uploadedBase64;
      mimeType = uploadedMime || "image/png";
    }

    setAnimatingState({
      operationName: "",
      status: "running",
      progressMsg: REASSURING_MESSAGES[0],
      aspectRatio: aspectRatio
    });
    setLoadingMessageIndex(0);

    try {
      // 1. Start generation operation
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
          mimeType: mimeType,
          prompt: motionPrompt,
          aspectRatio: aspectRatio,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to start animation sequence");
      }

      const operationName = data.operationName;
      
      if (data.isFallback) {
        setAnimatingState(prev => ({
          ...prev,
          operationName: operationName,
          isFallback: true,
          logoImage: base64Image,
          progressMsg: "Initiating interactive branding render engines..."
        }));

        let count = 0;
        const fakeInterval = setInterval(() => {
          count++;
          setLoadingMessageIndex((prev) => (prev + 1) % REASSURING_MESSAGES.length);
          if (count >= 5) {
            clearInterval(fakeInterval);
            setAnimatingState(prev => ({
              ...prev,
              status: "completed",
              isFallback: true,
              logoImage: base64Image,
              videoUrl: "interactive-cinematic-render",
              prompt: motionPrompt
            }));
          }
        }, 1200);
        return;
      }

      setAnimatingState(prev => ({
        ...prev,
        operationName: operationName,
        progressMsg: "Veo AI sequence started. Starting progress tracking..."
      }));

      // 2. Poll progress
      startPolling(operationName);

    } catch (err: any) {
      console.error(err);
      setAnimatingState({
        operationName: "",
        status: "failed",
        progressMsg: "",
        error: err.message || "Failed to initialize Veo Animation. Please double check API configuration.",
        aspectRatio: aspectRatio
      });
    }
  };

  const startPolling = (operationName: string) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch("/api/video-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ operationName }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Tracking poll failed");
        }

        // If polling done, download the video
        if (data.done) {
          clearInterval(pollingIntervalRef.current);
          if (data.error) {
            setAnimatingState(prev => ({
              ...prev,
              status: "failed",
              error: `Veo system reports: ${data.error.message || "Operation failed."}`
            }));
          } else {
            setAnimatingState(prev => ({
              ...prev,
              progressMsg: "Video processing complete! Preparing to stream from studio..."
            }));
            await downloadAndSetVideo(operationName);
          }
        }
      } catch (err: any) {
        console.error("Polling error:", err);
        // Do not fail immediately, keep trying a few times, but if error is persisting:
        clearInterval(pollingIntervalRef.current);
        setAnimatingState(prev => ({
          ...prev,
          status: "failed",
          error: err.message || "Lost connection while polling Veo generation progress."
        }));
      }
    }, 6000); // Poll every 6 seconds as video creation takes some time
  };

  const downloadAndSetVideo = async (operationName: string) => {
    try {
      const response = await fetch("/api/video-download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ operationName }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to download and parse video blob.");
      }

      const videoBlob = await response.blob();
      const localVideoUrl = URL.createObjectURL(videoBlob);

      setAnimatingState(prev => ({
        ...prev,
        status: "completed",
        videoUrl: localVideoUrl
      }));
    } catch (err: any) {
      console.error(err);
      setAnimatingState(prev => ({
        ...prev,
        status: "failed",
        error: `Failed to stream back video files: ${err.message}`
      }));
    }
  };

  const selectPreset = (presetPrompt: string) => {
    setMotionPrompt(presetPrompt);
  };

  // Helper selectors
  const activeImage = imageSource === "imported" ? importedLogo?.imageUrl : uploadedBase64;

  return (
    <div id="logo-animator-panel" className="glass rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <Film className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Step 2: Animate with Veo AI</h2>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-white/5 text-purple-400 border border-purple-500/20">
          veo-3.1-fast-generate
        </span>
      </div>

      {animatingState.status === "running" ? (
        /* LOADING / RENDERING PROGRESS DISPLAY */
        <div className="text-center py-12 px-6 space-y-6 bg-white/[0.02] border border-white/10 rounded-2xl shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-purple-500/5 blur-[50px] rounded-full pointer-events-none" />
          <div className="relative inline-flex items-center justify-center">
            {/* Pulsing layered animation */}
            <div className="absolute inset-0 bg-purple-500/25 rounded-full blur-xl animate-pulse"></div>
            <div className="h-16 w-16 border-4 border-purple-500/10 border-t-purple-400 rounded-full animate-spin"></div>
            <VideoIcon className="absolute h-6 w-6 text-purple-300 animate-pulse" />
          </div>

          <div className="space-y-2 max-w-sm mx-auto relative z-10">
            <h3 className="text-white font-bold tracking-tight text-sm">Synthesizing Creative Animation</h3>
            <p className="text-xs text-purple-400 font-medium h-8 flex items-center justify-center text-center transition-all duration-500">
              {REASSURING_MESSAGES[loadingMessageIndex]}
            </p>
            <p className="text-[10px] text-white/30 font-mono italic">
              AI studio processes usually take 1 to 2 minutes. Please remain on this screen.
            </p>
          </div>

          {/* Simple simulated incremental loading indicator bar */}
          <div className="w-full max-w-xs bg-white/5 border border-white/10 rounded-full h-1.5 mx-auto overflow-hidden relative z-10">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500 animate-pulse" 
              style={{ width: `${(loadingMessageIndex + 1) * 14}%` }}
            />
          </div>
        </div>
      ) : animatingState.status === "completed" && animatingState.videoUrl ? (
        /* RENDERED VIDEO SUCCESS PLAYER */
        <div className="border border-white/10 rounded-3xl bg-white/5 p-5 space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/5 blur-[40px] pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-400" /> {animatingState.isFallback ? "Live Brand Interactive Simulator Mode" : "Live Motion Animation"}
            </span>
            <span className={`text-[10px] font-mono px-2.5 py-1 rounded border ${
              animatingState.isFallback 
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold" 
                : "bg-purple-500/10 text-purple-400 border-purple-500/20"
            }`}>
              {animatingState.isFallback ? "WebGL Core v3.1" : "Veo HD Video"}
            </span>
          </div>

          {animatingState.isFallback && animatingState.logoImage ? (
            <InteractiveCinematicRenderer 
              logoImage={animatingState.logoImage} 
              prompt={animatingState.prompt || motionPrompt} 
              aspectRatio={animatingState.aspectRatio} 
            />
          ) : (
            <div className="relative bg-[#050505]/80 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center max-h-96 mx-auto shadow-inner z-10">
              <video
                src={animatingState.videoUrl}
                controls
                autoPlay
                loop
                muted
                className={`w-full max-h-96 object-contain ${animatingState.aspectRatio === "9:16" ? "max-w-xs" : ""}`}
                id="veo-rendered-video-tag"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 relative z-10 font-bold">
            <button
              onClick={() => {
                setAnimatingState({
                  operationName: "",
                  status: "idle",
                  progressMsg: "",
                  aspectRatio: aspectRatio
                });
              }}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs text-white/80 py-3 rounded-xl tracking-wide transition cursor-pointer"
            >
              CONFIGURE NEW MOTION
            </button>
            {animatingState.isFallback && animatingState.logoImage ? (
              <a
                href={animatingState.logoImage}
                download="brand-logo-asset.png"
                className="px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-[1.01] active:scale-[0.99] text-xs text-white py-3 rounded-xl tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/15 cursor-pointer"
                id="download-logo-link"
              >
                <Download className="h-3.5 w-3.5" />
                SAVE HIGH-RES BRAND GRAPHIC
              </a>
            ) : (
              <a
                href={animatingState.videoUrl}
                download={`motion-logo-${aspectRatio.replace(":", "-")}.mp4`}
                className="px-6 accent-gradient hover:scale-[1.01] active:scale-[0.99] text-xs text-white py-3 rounded-xl tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-purple-500/15 cursor-pointer"
                id="download-video-link"
              >
                <Download className="h-3.5 w-3.5" />
                DOWNLOAD VIDEO MP4
              </a>
            )}
          </div>
        </div>
      ) : (
        /* IDLE CONFIGURATION FORM */
        <form onSubmit={handleAnimate} className="space-y-5">
          {/* Image Source Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/60">Select Input Image Source</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setImageSource("imported")}
                disabled={!importedLogo}
                className={`text-xs py-2.5 px-3 rounded-xl border font-bold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer ${
                  imageSource === "imported"
                    ? "bg-purple-500/10 text-purple-300 border-purple-500/30 shadow-inner"
                    : importedLogo
                    ? "bg-white/5 text-white/60 border-white/10 hover:text-white"
                    : "bg-white/[0.02] text-white/20 border-transparent cursor-not-allowed"
                }`}
              >
                <span>Use Designed Logo</span>
                {importedLogo && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setImageSource("upload")}
                className={`text-xs py-2.5 px-3 rounded-xl border font-bold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer ${
                  imageSource === "upload"
                    ? "bg-purple-500/10 text-purple-300 border-purple-500/30 shadow-inner"
                    : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                }`}
              >
                <span>Upload Custom Photo</span>
                {uploadedBase64 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                )}
              </button>
            </div>
          </div>

          {/* Source Image Canvas Preview or Drag Area */}
          {imageSource === "upload" ? (
            <div className="space-y-2">
              {uploadedBase64 ? (
                <div className="border border-white/10 rounded-2xl p-3 bg-white/[0.02] relative group">
                  <div className="aspect-video bg-black/60 rounded-xl overflow-hidden border border-white/15 flex items-center justify-center max-h-48 relative">
                    <div className="absolute inset-0 bg-blue-500/5 blur-md" />
                    <img 
                      src={uploadedBase64} 
                      alt="Uploaded brand asset" 
                      className="object-contain w-full h-full p-2 relative z-10"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 px-1">
                    <span className="text-[10px] text-white/40 font-mono">Custom template loaded successfully.</span>
                    <button
                      type="button"
                      onClick={clearUploadedFile}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 transition cursor-pointer"
                    >
                      Remove File
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? "border-purple-500 bg-purple-500/5"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept="image/*"
                    className="hidden"
                  />
                  <Upload className="h-7 w-7 text-white/30 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-white/80">Drag & drop photo here</p>
                  <p className="text-[11px] text-white/40 mt-1">or click to browse local files</p>
                </div>
              )}
            </div>
          ) : (
            /* Selected imported logo display preview */
            <div className="border border-white/10 rounded-2xl p-3 bg-white/[0.02]">
              {importedLogo ? (
                <div className="flex gap-4 items-center">
                  <div className="h-16 w-16 bg-black/40 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center p-1.5 shrink-0 relative">
                    <div className="absolute inset-0 bg-blue-500/5 blur-md" />
                    <img src={importedLogo.imageUrl} alt="Imported thumbnail" className="object-contain relative z-10" referrerPolicy="no-referrer" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white/80 truncate">Imported Designed Logo</p>
                    <p className="text-[10px] text-white/40 font-mono truncate">{importedLogo.size} Quality • {importedLogo.aspectRatio}</p>
                    <p className="text-[11px] text-white/50 line-clamp-1 italic mt-0.5">&ldquo;{importedLogo.prompt}&rdquo;</p>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-white/30 text-xs">
                  <ImageIcon className="h-5 w-5 mx-auto stroke-1 text-white/20 mb-1" />
                  <span>No logo designed in Step 1 yet. Start by generating a logo or choose Upload Custom Photo.</span>
                </div>
              )}
            </div>
          )}

          {/* Motion Animation Parameters */}
          <div className="space-y-4">
            {/* Custom Motion Prompt Textfield */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/60 flex items-center justify-between" id="animation-style-label">
                <span>Custom Motion Prompt / Animation Style</span>
                <span className="text-[10px] text-white/30 font-mono">Steer camera/effects</span>
              </label>
              <textarea
                aria-labelledby="animation-style-label"
                value={motionPrompt}
                onChange={(e) => setMotionPrompt(e.target.value)}
                rows={2}
                placeholder="Describe how parts should animate, e.g. Animate the glowing elements with clockwise radial rotations, luxury corporate shine, soft dark particle background..."
                className="w-full text-sm py-2 px-3 rounded-2xl border border-white/10 bg-white/5 text-slate-100 placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none shadow-inner"
              />
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-white/45">Quick Animation Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {MOTION_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => selectPreset(preset.prompt)}
                    className="sidebar-item text-[10px] font-semibold px-2.5 py-1.5 rounded-xl border border-white/10 text-white/70 hover:text-white cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Aspect Ratio Selector */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-white/50 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-white/30" />
                Render Output Aspect Ratio
              </span>
              <div className="grid grid-cols-2 gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
                {(["16:9", "9:16"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`text-xs font-bold py-2 rounded-lg transition-all cursor-pointer ${
                      aspectRatio === ratio
                        ? "bg-purple-950/40 text-purple-300 border border-purple-500/20"
                        : "text-white/40 hover:text-white/80 border border-transparent"
                    }`}
                  >
                    {ratio === "16:9" ? "16:9 Landscape" : "9:16 Portrait"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trigger Button */}
          <button
            type="submit"
            disabled={!motionPrompt.trim() || (!importedLogo && imageSource === "imported") || (!uploadedBase64 && imageSource === "upload")}
            className={`w-full font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              !motionPrompt.trim() || (!importedLogo && imageSource === "imported") || (!uploadedBase64 && imageSource === "upload")
                ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                : "accent-gradient hover:scale-[1.01] active:scale-[0.99] text-white shadow-purple-500/15 shadow-xl hover:shadow-purple-500/25"
            }`}
          >
            <Play className="h-4 w-4 fill-current text-white animate-pulse" />
            <span>ANIMATE WITH VEO</span>
          </button>

          {/* Error display inside configuration panel */}
          {animatingState.status === "failed" && animatingState.error && (
            <div className="p-3 bg-[#e11d48]/10 border border-[#e11d48]/20 rounded-xl text-xs text-[#fda4af] flex flex-col gap-1">
              <strong className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> Animation Error:
              </strong>
              <p>{animatingState.error}</p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
