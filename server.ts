import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

function generateLocalSvgLogo(promptText: string, aspectRatioLabel: string): string {
  const cleanPrompt = promptText.toLowerCase();

  // 1. Try to extract a brand name from the prompt
  // Check for quoted strings first, e.g. "NovaStream" or 'NovaStream'
  let brandName = "";
  const quotedMatch = promptText.match(/["']([^"']+)["']/);
  if (quotedMatch && quotedMatch[1]) {
    brandName = quotedMatch[1].trim();
  } else {
    // Look for capitalized words that look like brand names
    const words = promptText.split(/\s+/);
    const capitalizedWords = words.filter(w => /^[A-Z][a-zA-Z0-9]+$/.test(w) && w.toLowerCase() !== "logo" && w.toLowerCase() !== "ai");
    if (capitalizedWords.length > 0) {
      brandName = capitalizedWords[0];
    } else {
      brandName = "AETHER";
    }
  }
  // Standardize the brand name: upper case for great display logo feel
  brandName = brandName.toUpperCase();
  const initialLetter = brandName.charAt(0) || "A";

  // 2. Select beautiful matching colors/gradients based on prompt keywords
  let stopColor1 = "#3b82f6"; // Tech Blue
  let stopColor2 = "#8b5cf6"; // Tech Violet
  let accentColor = "#60a5fa";
  let themeName = "Neo-Cosmic";

  if (cleanPrompt.includes("gold") || cleanPrompt.includes("amber") || cleanPrompt.includes("luxury") || cleanPrompt.includes("royal") || cleanPrompt.includes("premium")) {
    stopColor1 = "#f5af19";
    stopColor2 = "#e65c00";
    accentColor = "#fcd34d";
    themeName = "Royal Gold";
  } else if (cleanPrompt.includes("green") || cleanPrompt.includes("leaf") || cleanPrompt.includes("eco") || cleanPrompt.includes("nature") || cleanPrompt.includes("forest") || cleanPrompt.includes("bio")) {
    stopColor1 = "#10b981";
    stopColor2 = "#059669";
    accentColor = "#34d399";
    themeName = "Eco Leaf";
  } else if (cleanPrompt.includes("ocean") || cleanPrompt.includes("water") || cleanPrompt.includes("sea") || cleanPrompt.includes("teal") || cleanPrompt.includes("cyan")) {
    stopColor1 = "#06b6d4";
    stopColor2 = "#0891b2";
    accentColor = "#67e8f9";
    themeName = "Cyan Stream";
  } else if (cleanPrompt.includes("fire") || cleanPrompt.includes("orange") || cleanPrompt.includes("red") || cleanPrompt.includes("heat") || cleanPrompt.includes("magma")) {
    stopColor1 = "#ef4444";
    stopColor2 = "#f97316";
    accentColor = "#fca5a5";
    themeName = "Voxel Magma";
  } else if (cleanPrompt.includes("neon") || cleanPrompt.includes("cyber") || cleanPrompt.includes("pink") || cleanPrompt.includes("purple") || cleanPrompt.includes("synth")) {
    stopColor1 = "#d946ef";
    stopColor2 = "#8b5cf6";
    accentColor = "#f472b6";
    themeName = "Cyber Glow";
  }

  // 3. Select Glyph Path depending on prompt keywords
  let glyphPath = "";
  let tagLine = "STUDIO INTEL ASSET";

  if (cleanPrompt.includes("leaf") || cleanPrompt.includes("nature") || cleanPrompt.includes("eco") || cleanPrompt.includes("green")) {
    // Bio Leaf Glyph Path
    glyphPath = `
      <!-- Bio Leaf Path -->
      <g transform="translate(150, 80) scale(4)">
        <path d="M25,5 C10,15 5,30 5,40 C5,45 10,48 15,48 C25,48 45,30 45,15 C45,10 40,5 25,5 Z" fill="url(#brandGradient)" />
        <path d="M25,5 Q15,18 20,35 Q22,38 25,44 Q28,38 30,35 Q35,18 25,5 Z" fill="#ffffff" opacity="0.3" />
        <path d="M5,40 Q25,25 45,15" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 3" opacity="0.5" />
      </g>
    `;
    tagLine = "BIOMIMETIC SYSTEM";
  } else if (cleanPrompt.includes("globe") || cleanPrompt.includes("orbit") || cleanPrompt.includes("cloud") || cleanPrompt.includes("network") || cleanPrompt.includes("world")) {
    // Orbital Cloud/Network Glyph Path
    glyphPath = `
      <!-- Orbital Geodesic Globe -->
      <g transform="translate(250, 195)">
        <circle r="85" fill="none" stroke="url(#brandGradient)" stroke-width="2.5" opacity="0.2" />
        <circle r="65" fill="none" stroke="url(#brandGradient)" stroke-width="1.5" />
        <ellipse rx="65" ry="25" fill="none" stroke="${accentColor}" stroke-width="2" />
        <ellipse rx="25" ry="65" fill="none" stroke="${accentColor}" stroke-width="1.5" stroke-dasharray="3 3"/>
        <line x1="-80" y1="0" x2="80" y2="0" stroke="url(#brandGradient)" stroke-width="1" opacity="0.5" />
        <line x1="0" y1="-80" x2="0" y2="80" stroke="url(#brandGradient)" stroke-width="1" opacity="0.5" />
        <!-- Floating Nodes -->
        <circle cx="0" cy="0" r="15" fill="url(#brandGradient)" />
        <circle cx="0" cy="0" r="6" fill="#ffffff" />
        <circle cx="45" cy="-18" r="7" fill="${accentColor}" />
        <circle cx="-45" cy="18" r="5" fill="${accentColor}" />
        <circle cx="0" cy="65" r="5" fill="#ffffff" opacity="0.8" />
        <circle cx="0" cy="-65" r="5" fill="#ffffff" opacity="0.8" />
      </g>
    `;
    tagLine = "ORBITAL NET STRUCTURE";
  } else if (cleanPrompt.includes("bolt") || cleanPrompt.includes("energy") || cleanPrompt.includes("lightning") || cleanPrompt.includes("power") || cleanPrompt.includes("volt")) {
    // Sharp Lightning Glyph Path
    glyphPath = `
      <!-- Lightning Force Ascent -->
      <g transform="translate(195, 110)">
        <polygon points="60,10 10,100 50,100 40,170 110,70 70,70" fill="url(#brandGradient)" />
        <polygon points="65,15 20,95 55,95 45,160 100,75 75,75" fill="#ffffff" opacity="0.2" />
        <circle cx="60" cy="90" r="40" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-dasharray="8 6" opacity="0.6" />
      </g>
    `;
    tagLine = "DYNAMIC POWER SYSTEM";
  } else if (cleanPrompt.includes("data") || cleanPrompt.includes("helix") || cleanPrompt.includes("dna") || cleanPrompt.includes("quantum") || cleanPrompt.includes("cyber")) {
    // Double Helix Path
    glyphPath = `
      <!-- Cyber Helix Grid -->
      <g transform="translate(160, 110) scale(1.8)">
        <path d="M10,40 Q30,10 50,40 T90,40" fill="none" stroke="url(#brandGradient)" stroke-width="4" stroke-linecap="round" />
        <path d="M10,40 Q30,70 50,40 T90,40" fill="none" stroke="${accentColor}" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 3" />
        <line x1="23" y1="24" x2="23" y2="56" stroke="#ffffff" stroke-width="1.5" opacity="0.6" />
        <circle cx="23" cy="24" r="4" fill="${accentColor}" />
        <circle cx="23" cy="56" r="4" fill="#ffffff" />
        
        <circle cx="50" cy="40" r="4" fill="url(#brandGradient)" />
        
        <line x1="77" y1="24" x2="77" y2="56" stroke="#ffffff" stroke-width="1.5" opacity="0.6" />
        <circle cx="77" cy="24" r="4" fill="#ffffff" />
        <circle cx="77" cy="56" r="4" fill="${accentColor}" />
      </g>
    `;
    tagLine = "HIGH-FREQUENCY SYMMETRY";
  } else {
    // Default: Majestic Geometric Crystalline Overlapping Hexagons
    glyphPath = `
      <!-- Overlapping Crystalline Hexagons -->
      <g transform="translate(250, 195)">
        <circle cx="-60" cy="-60" r="2" fill="#ffffff" opacity="0.3" />
        <circle cx="70" cy="-40" r="1.5" fill="#ffffff" opacity="0.4" />
        <circle cx="-50" cy="60" r="2" fill="#ffffff" opacity="0.2" />
        
        <polygon points="0,-110 95,-55 95,55 0,110 -95,55 -95,-55" fill="none" stroke="url(#brandGradient)" stroke-width="2" />
        <polygon points="0,-85 73,-42 73,42 0,85 -73,42 -73,-42" fill="url(#brandGradient)" opacity="0.15" />
        <polygon points="0,-85 73,-42 73,42 0,85 -73,42 -73,-42" fill="none" stroke="${accentColor}" stroke-width="1" stroke-dasharray="5 5" opacity="0.8" />
        
        <circle cx="0" cy="0" r="40" fill="url(#brandGradient)" />
        <circle cx="0" cy="0" r="32" fill="#000000" opacity="0.4" />
        
        <text x="0" y="14" font-family="'Inter', 'Space Grotesk', system-ui, sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-0.05em">${initialLetter}</text>
        
        <line x1="0" y1="-110" x2="0" y2="-85" stroke="#ffffff" stroke-width="1.5" opacity="0.7" />
        <line x1="0" y1="110" x2="0" y2="85" stroke="#ffffff" stroke-width="1.5" opacity="0.7" />
        <line x1="-95" y1="-55" x2="-73" y2="-42" stroke="#ffffff" stroke-width="1.5" opacity="0.7" />
        <line x1="95" y1="55" x2="73" y2="42" stroke="#ffffff" stroke-width="1.5" opacity="0.7" />
      </g>
    `;
    tagLine = "VECTOR ENGINE v3.1";
  }

  // 4. Assemble standard highly styled Vector branding box
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%" style="background-color: #050505; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
  <defs>
    <!-- Background grid pattern -->
    <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="1"/>
    </pattern>
    <!-- Premium Linear Grand Gradient -->
    <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${stopColor1}" />
      <stop offset="100%" stop-color="${stopColor2}" />
    </linearGradient>
    <!-- Deep Ambient Glow Filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background overlay grid -->
  <rect width="100%" height="100%" fill="#050505" />
  <rect width="100%" height="100%" fill="url(#grid)" />

  <!-- Back ambient atmosphere lights -->
  <circle cx="250" cy="200" r="160" fill="${stopColor1}" opacity="0.08" filter="url(#glow)" />
  <circle cx="300" cy="300" r="140" fill="${stopColor2}" opacity="0.08" filter="url(#glow)" />

  <!-- Render selected dynamic glyph block -->
  ${glyphPath}

  <!-- Typography Suite -->
  <g transform="translate(250, 395)">
    <!-- Brand Name Title -->
    <text x="0" y="0" font-family="'Space Grotesk', 'Inter', system-ui, sans-serif" font-size="34" font-weight="950" fill="#ffffff" text-anchor="middle" letter-spacing="-0.04em" style="text-shadow: 0 0 20px rgba(255,255,255,0.15)">${brandName}</text>
    
    <!-- Tagline description -->
    <text x="0" y="24" font-family="'JetBrains Mono', 'Fira Code', monospace" font-size="10" font-weight="700" fill="${accentColor}" opacity="0.75" text-anchor="middle" letter-spacing="0.45em">${tagLine}</text>
    
    <!-- Render Engine Indicator tag decoration in background -->
    <text x="0" y="44" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="400" fill="#ffffff" opacity="0.25" text-anchor="middle" letter-spacing="0.10em">VECTOR DESIGN STUDIO</text>
  </g>

  <!-- Small corner telemetry lines matching modern immersive grid theme -->
  <path d="M 25,45 L 25,25 L 45,25" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
  <path d="M 475,45 L 475,25 L 455,25" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
  <path d="M 25,455 L 25,475 L 45,475" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
  <path d="M 475,455 L 475,475 L 455,475" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
  
  <text x="35" y="468" font-family="'JetBrains Mono', monospace" font-size="8" fill="#ffffff" opacity="0.25">FALLBACK_RENDER_ACTIVE</text>
  <text x="465" y="468" font-family="'JetBrains Mono', monospace" font-size="8" fill="#ffffff" opacity="0.25" text-anchor="end">SYS_OK_v3.1</text>
</svg>
  `.trim();

  return svg;
}

async function generateFallbackSvgWithGemini(promptText: string): Promise<string | null> {
  try {
    console.log(`[Logo Gen Fallback] Generating intelligent custom SVG with Gemini text model: gemini-2.5-flash`);
    const ai = getGemini();
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `You are an elite, world-class branding graphic designer. Due to primary image model quotas, we are dynamically serving customized vector SVG code. Please design a magnificent, beautiful vector-style SVG logo strictly based on this brand theme option: "${promptText}".

Technical Requirements:
1. Output ONLY a valid, self-contained SVG XML block commencing with "<svg" and concluding with "</svg>".
2. Do NOT wrap your output with markdown formatting (e.g. do not put \`\`\`xml or \`\`\`svg). Start immediately with '<svg' and end with '</svg>'.
3. Support scaling with a clean 'viewBox="0 0 500 500"'.
4. Include a dark themed canvas background suited to an immersive dark workflow ('#050505' or '#000000').
5. Design a sophisticated, modern, futuristic visual graphic shape/icon centered in the coordinate space.
6. Beneath the graphic, place cleanly styled brand name text (rendered using generic elegant standard system fonts like sans-serif, system-ui, or Space Grotesk/Inter). Use standard SVG text elements.
7. Integrate gorgeous modern gradient gradients (<linearGradient> or <radialGradient>) in the <defs> to give a luxury look. Match colors from the user prompt instructions (e.g. bioluminescent cyan/blue, warm royal gold, or high contrast cyber pinks/purples). Ensure colors contrasts are beautiful and extremely high quality.`
          }
        ]
      }
    });

    let text = result.text || "";
    text = text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```[a-zA-Z]*\n?/, "");
      text = text.replace(/```$/, "");
      text = text.trim();
    }

    if (text.includes("<svg") && text.includes("</svg>")) {
      console.log("[Logo Gen Fallback] Success! Generated raw customized SVG via text Gemini.");
      return text;
    }
    return null;
  } catch (err: any) {
    console.warn("[Logo Gen Fallback] Gemini text-based SVG design failed:", err.message || err);
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json({ limit: "50mb" }));

  // 1. Generate Logo Endpoint
  app.post("/api/generate-logo", async (req, res) => {
    try {
      const { prompt, size, aspectRatio } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      console.log(`[Logo Gen] Starting generation with prompt: "${prompt}", size: ${size}, aspect ratio: ${aspectRatio}`);
      const ai = getGemini();

      // We define a cascading fallback tier list of image models.
      // 1. gemini-3.1-flash-image (High Quality model with standard free/developer tier support)
      // 2. gemini-2.5-flash-image (Highly responsive general image model with great quota availability)
      // 3. gemini-3-pro-image-preview (Premium model)
      const modelsToTry = [
        'gemini-3.1-flash-image',
        'gemini-2.5-flash-image',
        'gemini-3-pro-image-preview'
      ];

      let response = null;
      let lastError = null;
      let usedModel = "";

      for (const modelName of modelsToTry) {
        try {
          console.log(`[Logo Gen] Trying model: ${modelName} ...`);
          
          const imageConfig: any = {
            aspectRatio: aspectRatio || "1:1"
          };

          // imageSize is supported by gemini-3.1-flash-image and gemini-3-pro-image,
          // but NOT supported by gemini-2.5-flash-image.
          if (modelName !== 'gemini-2.5-flash-image' && size) {
            imageConfig.imageSize = size;
          }

          response = await ai.models.generateContent({
            model: modelName,
            contents: {
              parts: [
                {
                  text: `${prompt}. Create a clean, modern, high-quality, professional corporate vector-style logo suitable for branding. Minimize clutter, no background photos, centered single graphic icon composition on solid neutral or minimalist background. Vector logo design asset.`,
                },
              ],
            },
            config: {
              imageConfig
            },
          });

          if (response) {
            usedModel = modelName;
            console.log(`[Logo Gen] Successfully generated logo using model: ${modelName}`);
            break;
          }
        } catch (err: any) {
          console.warn(`[Logo Gen] Model ${modelName} failed/quota exceeded:`, err.message || err);
          lastError = err;
        }
      }

      let base64Data = "";
      let textOutput = "";
      let isFallback = false;

      if (!response) {
        const errorDetail = lastError?.message || JSON.stringify(lastError) || "Unknown error";
        console.warn("[Logo Gen] All available raw image generation models failed/quota exceeded. Activating Vector SVG fallback suites.", errorDetail);
        
        let svgCode = await generateFallbackSvgWithGemini(prompt);
        if (svgCode) {
          usedModel = "gemini-2.5-flash-svg";
          textOutput = "A custom designed branding vector asset constructed dynamically via Gemini fallback model.";
        } else {
          console.warn("[Logo Gen Fallback] Gemini text-based design also reached limit. Engaging high-quality local algorithmic vector generator.");
          svgCode = generateLocalSvgLogo(prompt, aspectRatio || "1:1");
          usedModel = "local-vector-engine";
          textOutput = "A professional geometric branding crest synthesized locally based on core concepts within your prompt.";
        }

        base64Data = Buffer.from(svgCode).toString("base64");
        isFallback = true;
      } else {
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              base64Data = part.inlineData.data;
            } else if (part.text) {
              textOutput += part.text;
            }
          }
        }
      }

      if (!base64Data) {
        return res.status(500).json({ error: "Failed to render visual asset. Please try a different or more descriptive prompt." });
      }

      res.json({
        imageUrl: isFallback ? `data:image/svg+xml;base64,${base64Data}` : `data:image/png;base64,${base64Data}`,
        base64: base64Data,
        description: textOutput || "Corporate Logo Asset",
        engine: usedModel,
        isFallback
      });
    } catch (err: any) {
      console.error("[Logo Gen] General Error:", err);
      res.status(500).json({ error: err.message || "An error occurred during logo generation." });
    }
  });

  // 2. Start Video Animation Endpoint
  app.post("/api/generate-video", async (req, res) => {
    const { image, mimeType, prompt, aspectRatio } = req.body;
    try {
      if (!image) {
        return res.status(400).json({ error: "An image of the logo is required for animation." });
      }

      console.log(`[Video Gen] Request received with prompt: "${prompt}", aspect ratio: ${aspectRatio}`);
      const ai = getGemini();
      
      const cleanBase64 = image.includes("base64,") ? image.split("base64,")[1] : image;
      let cleanMimeType = mimeType || "image/png";
      if (image.includes("image/svg+xml") || image.includes("svg+xml")) {
        cleanMimeType = "image/svg+xml";
      }

      // Call Veo model
      const operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'Animate this logo into life dynamically. Create a premium 3D reveal with smooth rotation, elegant floating particles, soft luxury volumetric lighting against a clean, matching minimalist background. High-fidelity studio brand motion graphic, high quality corporate logo intro.',
        image: {
          imageBytes: cleanBase64,
          mimeType: cleanMimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio || '16:9',
        },
      });

      console.log(`[Video Gen] Operation structured. Name: ${operation.name}`);
      res.json({ operationName: operation.name });
    } catch (err: any) {
      console.warn("[Video Gen] Veo AI primary video engine limit/quota exceeded. Activating local interactive showcase fallback model.", err.message || err);
      
      // Return a simulated success with isFallback flag so the client handles beautifully.
      res.json({
        operationName: `fallback-veo-${Date.now()}`,
        isFallback: true,
        logoImage: image,
        engine: "local-simulation-engine",
        message: "Activating real-time cinematic canvas renderer."
      });
    }
  });

  // 3. Track Animation Status Endpoint
  app.post("/api/video-status", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        return res.status(400).json({ error: "operationName is required" });
      }

      if (operationName.startsWith("fallback-veo-")) {
        return res.json({ done: true, error: null, metadata: { isFallback: true } });
      }

      const ai = getGemini();
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      
      res.json({ 
        done: updated.done, 
        error: updated.error,
        metadata: updated.metadata
      });
    } catch (err: any) {
      console.error("[Video Status] Track Error:", err);
      res.status(500).json({ error: err.message || "An error occurred while polling status." });
    }
  });

  // 4. Download and Stream Video Endpoint
  app.post("/api/video-download", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName) {
        return res.status(400).json({ error: "operationName is required" });
      }

      if (operationName.startsWith("fallback-veo-")) {
        return res.json({ isFallback: true });
      }

      const ai = getGemini();
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      
      if (!uri) {
        return res.status(404).json({ error: "Video URI not found. Ensure generation is complete." });
      }

      const key = process.env.GEMINI_API_KEY;
      const videoRes = await fetch(uri, {
        headers: { 'x-goog-api-key': key || "" },
      });

      res.setHeader('Content-Type', 'video/mp4');
      const reader = videoRes.body?.getReader();
      if (reader) {
        let chunk;
        while (!(chunk = await reader.read()).done) {
          res.write(chunk.value);
        }
        res.end();
      } else {
        res.status(500).json({ error: "Failed to read stream from the video generator." });
      }
    } catch (err: any) {
      console.error("[Video Stream] Download Error:", err);
      res.status(500).json({ error: err.message || "An error occurred while streaming the generated video." });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
