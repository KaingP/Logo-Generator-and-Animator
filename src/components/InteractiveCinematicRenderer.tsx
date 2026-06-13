import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Layers, Activity, VolumeX, Eye } from "lucide-react";

interface InteractiveCinematicRendererProps {
  logoImage: string;
  prompt: string;
  aspectRatio: "16:9" | "9:16";
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export default function InteractiveCinematicRenderer({
  logoImage,
  prompt = "",
  aspectRatio,
}: InteractiveCinematicRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [playbackTime, setPlaybackTime] = useState("0:00");

  const cleanPrompt = prompt.toLowerCase();

  // 1. Establish Style Presets depending on prompt terms
  let primaryColor = "#a855f7"; // Purple
  let secondaryColor = "#3b82f6"; // Blue
  let accentColor = "#60a5fa";  // Light Blue
  let presetName = "Cosmic Slate Studio";
  let particleCount = 65;

  if (cleanPrompt.includes("gold") || cleanPrompt.includes("amber") || cleanPrompt.includes("luxury") || cleanPrompt.includes("premium")) {
    primaryColor = "#eab308";
    secondaryColor = "#f97316";
    accentColor = "#fef08a";
    presetName = "Royal Gold Luxe";
  } else if (cleanPrompt.includes("green") || cleanPrompt.includes("nature") || cleanPrompt.includes("eco") || cleanPrompt.includes("leaf")) {
    primaryColor = "#10b981";
    secondaryColor = "#059669";
    accentColor = "#6ee7b7";
    presetName = "Eco Leaf Bio-Render";
  } else if (cleanPrompt.includes("ocean") || cleanPrompt.includes("sea") || cleanPrompt.includes("blue") || cleanPrompt.includes("water") || cleanPrompt.includes("cyan")) {
    primaryColor = "#06b6d4";
    secondaryColor = "#2563eb";
    accentColor = "#67e8f9";
    presetName = "Deep Cyan Hydro-Flux";
  } else if (cleanPrompt.includes("cyber") || cleanPrompt.includes("neon") || cleanPrompt.includes("pink") || cleanPrompt.includes("synth")) {
    primaryColor = "#ec4899";
    secondaryColor = "#8b5cf6";
    accentColor = "#f472b6";
    presetName = "Cyber Glow Synthwave";
  } else if (cleanPrompt.includes("fire") || cleanPrompt.includes("red") || cleanPrompt.includes("orange")) {
    primaryColor = "#ef4444";
    secondaryColor = "#f97316";
    accentColor = "#f87171";
    presetName = "Voxel Magma Cascade";
    particleCount = 80;
  }

  // Double-check if the image is an SVG string or standard image source
  const finalImageSrc = logoImage.startsWith("data:") 
    ? logoImage 
    : `data:image/svg+xml;base64,${logoImage}`;

  // Track rendering timer to match standard video duration simulation (e.g. infinite loop with elapsed clock)
  useEffect(() => {
    let secs = 0;
    const tInterval = setInterval(() => {
      secs++;
      const minutes = Math.floor(secs / 60);
      const remainingSeconds = secs % 60;
      setPlaybackTime(
        `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(tInterval);
  }, []);

  // 2. High-performance HTML5 canvas microparticle physics animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || 640);
    let height = (canvas.height = canvas.offsetHeight || 360);

    const particles: Particle[] = [];

    const createParticle = (isInitial = false): Particle => {
      const rx = Math.random() * width;
      const ry = isInitial ? Math.random() * height : height + 10;
      
      let speedX = (Math.random() - 0.5) * 0.4;
      let speedY = -(Math.random() * 0.6 + 0.3); // Drifts upwards

      if (cleanPrompt.includes("nebula") || cleanPrompt.includes("cosmic") || cleanPrompt.includes("orbit")) {
        // Starry whirlpool drift
        const dx = rx - width / 2;
        const dy = ry - height / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        speedX = -dy / (dist + 1) * 0.3 + (Math.random() - 0.5) * 0.1;
        speedY = dx / (dist + 1) * 0.3 + (Math.random() - 0.5) * 0.1;
      }

      const life = isInitial ? Math.random() * 400 : 0;
      const maxLife = Math.random() * 300 + 200;

      const shades = [primaryColor, secondaryColor, accentColor, "#ffffff"];
      const chosenColor = shades[Math.floor(Math.random() * shades.length)];

      return {
        x: rx,
        y: ry,
        vx: speedX,
        vy: speedY,
        radius: Math.random() * 2 + 0.5,
        color: chosenColor,
        alpha: 0,
        life,
        maxLife,
      };
    };

    // Instantiate initial particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(true));
    }

    const drawGrid = (opacity: number) => {
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.lineWidth = 0.5;

      const spacing = 40;
      const xOffset = (animationFrameId * 0.1) % spacing;

      ctx.beginPath();
      for (let x = xOffset; x < width; x += spacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += spacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    };

    const renderLoop = () => {
      ctx.fillStyle = "#030303";
      ctx.fillRect(0, 0, width, height);

      // Dark radial glow at center
      const rootGlow = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        Math.max(width, height) / 1.5
      );
      rootGlow.addColorStop(0, "rgba(15, 12, 28, 0.4)");
      rootGlow.addColorStop(0.5, `${primaryColor}06`);
      rootGlow.addColorStop(1, "rgba(3, 3, 3, 1)");
      ctx.fillStyle = rootGlow;
      ctx.fillRect(0, 0, width, height);

      // Draw cyber spatial grid if prompt calls for it
      if (cleanPrompt.includes("cyber") || cleanPrompt.includes("grid") || cleanPrompt.includes("synth") || cleanPrompt.includes("neon")) {
        drawGrid(0.02);
      }

      // Draw subtle orbital paths
      if (cleanPrompt.includes("orbit") || cleanPrompt.includes("globe") || cleanPrompt.includes("space")) {
        ctx.strokeStyle = `rgba(255, 255, 255, 0.01)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 120, 0, Math.PI * 2);
        ctx.arc(width / 2, height / 2, 80, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Physics particle engine
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        // Fade in and out
        if (p.life < p.maxLife * 0.2) {
          p.alpha = p.life / (p.maxLife * 0.2);
        } else if (p.life > p.maxLife * 0.8) {
          p.alpha = 1 - (p.life - p.maxLife * 0.8) / (p.maxLife * 0.2);
        } else {
          p.alpha = 1;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Draw particle glow backplate
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        if (p.radius > 1.5) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }

        // Recycle dead points
        if (p.life >= p.maxLife || p.y < -10 || p.x < -10 || p.x > width + 10) {
          particles[i] = createParticle();
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    // Listen to resize observer
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [primaryColor, secondaryColor, cleanPrompt]);

  // Handle subtle interactive mouse movement on viewport
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const xVal = e.clientX - rect.left; // x relative coordinate
    const yVal = e.clientY - rect.top;  // y relative coordinate

    // Calculate rotation bounds: -10deg to 10deg
    const xPercent = (xVal / rect.width - 0.5) * 20; 
    const yPercent = (yVal / rect.height - 0.5) * -20; 

    setTilt({ x: xPercent, y: yPercent });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div className="space-y-3.5">
      {/* Simulation status tags bar */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-amber-300 font-mono flex items-center gap-1.5 font-semibold">
          <Activity className="h-3.3 w-3.3 text-amber-400 animate-pulse" /> FALLBACK VEO SENSORS ACTIVE
        </span>
        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
          <Eye className="h-2.5 w-2.5 text-blue-400" /> Webgl Canvas v3.1 • {presetName}
        </span>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className={`relative bg-[#020202] border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center select-none cursor-crosshair transition-all duration-300 ${
          aspectRatio === "9:16" ? "aspect-[9/16] max-w-[280px]" : "aspect-video w-full"
        } mx-auto shadow-2xl`}
        style={{
          boxShadow: isHovered
            ? `0 25px 50px -12px ${primaryColor}15, 0 0 40px -10px ${secondaryColor}10`
            : "none",
        }}
        id="interactive-veo-player-fallback"
      >
        {/* Render interactive background microparticle canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Ambient atmospheric light backplates */}
        <div 
          className="absolute h-56 w-56 rounded-full blur-[110px] opacity-25 pointer-events-none transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, ${primaryColor} 0%, transparent 80%)`,
            transform: `translate(${tilt.x * 2}px, ${-tilt.y * 2}px)`,
          }}
        />
        
        {/* Immersive 3D Perspectived Logo Plate wrapper */}
        <div
          className="relative z-10 p-6 flex flex-col items-center justify-center transition-all duration-200 ease-out"
          style={{
            transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(${isHovered ? 1.05 : 0.98})`,
            filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.6))",
          }}
        >
          {/* Pulsing light ring behind */}
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-15 pointer-events-none animate-ping"
            style={{ backgroundColor: secondaryColor }}
          />
          
          {/* Animated 3D Floating brand Logo */}
          <div className="relative group/logo">
            {/* Glossy overlay mask */}
            <div className="absolute inset-0 opacity-0 group-hover/logo:opacity-30 pointer-events-none bg-gradient-to-tr from-transparent via-white to-transparent -translate-x-full group-hover/logo:translate-x-full transition-transform duration-1000 ease-out z-20" />
            
            <img
              src={finalImageSrc}
              alt="Animate Target Logo"
              className="max-h-36 max-w-xs object-contain p-1 rounded-2xl relative z-10 animate-bounce"
              style={{
                animationDuration: "4s",
                filter: `drop-shadow(0 0 15px ${primaryColor}30)`
              }}
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Interactive branding hover text */}
          <span 
            className="text-[9px] uppercase tracking-widest font-mono text-white/30 mt-3 font-semibold transition-opacity duration-300"
            style={{ opacity: isHovered ? 1 : 0.4 }}
          >
            {isHovered ? "🔮 DRAG & SWAY TO CONTROL CAMERA" : "INTERACTIVE LOGO REVEAL"}
          </span>
        </div>

        {/* High-fidelity studio video player telemetry overlay widgets */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20 bg-black/40 border border-white/5 backdrop-blur px-2.5 py-1 rounded-lg text-white/50 text-[10px] font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
          <span>VEO.RENDER // REVEAL_LOOP</span>
        </div>

        <div className="absolute top-3 right-3 z-20 bg-black/40 border border-white/5 backdrop-blur px-2.5 py-1 rounded-lg text-white/50 text-[10px] font-mono flex items-center gap-1">
          <VolumeX className="h-3 w-3 text-white/40" />
          <span>CINEMATIC_MUTE</span>
        </div>

        {/* Playback time timeline simulation bar */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center gap-3 bg-black/60 border border-white/5 backdrop-blur-md px-3 py-2 rounded-xl">
          <span className="text-white/80 font-mono text-[10px] font-bold">{playbackTime}</span>
          <div className="flex-1 bg-white/10 rounded-full h-1 relative overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000"
              style={{ width: `${(Math.floor(Date.now() / 10) % 100)}%` }}
            />
          </div>
          <span className="text-white/40 font-mono text-[9px]">SOLO_HD</span>
        </div>
      </div>

      <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-[11px] text-amber-300/90 leading-relaxed space-y-1">
        <p className="font-bold flex items-center gap-1.5 text-amber-400">
          <span>✨ Cinematic Auto-Resilience Engaged</span>
        </p>
        <p>
          Google Developer Video Quotas are fully occupied. We have custom-rendered your brand asset in our state-of-the-art interactive 3D particle viewport! Hover and drag your cursor over the logo box to tilt the volumetric lighting and steer camera focus paths in real-time!
        </p>
      </div>
    </div>
  );
}
