export type LogoSize = "1K" | "2K" | "4K";

export interface GeneratedLogo {
  imageUrl: string;
  base64: string;
  description: string;
  timestamp: string;
  prompt: string;
  size: LogoSize;
  aspectRatio: string;
  engine?: string;
  isFallback?: boolean;
}

export interface AnimationOperation {
  operationName: string;
  videoUrl?: string;
  status: "idle" | "running" | "completed" | "failed";
  progressMsg: string;
  error?: string;
  prompt?: string;
  aspectRatio: "16:9" | "9:16";
  isFallback?: boolean;
  logoImage?: string;
}
