import React from "react";
import { X, Settings2, Image as ImageIcon, Box, MonitorUp } from "lucide-react";

interface ExportSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportSettingsModal({ isOpen, onClose }: ExportSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2.5">
            <Settings2 className="h-5 w-5 text-zinc-400" />
            <h3 className="text-sm font-bold text-white tracking-widest uppercase">Export Settings</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Default Format */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
               <ImageIcon className="h-3.5 w-3.5" />
               Default Rendering Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white/10 border border-white/20 text-white rounded-xl py-3 px-4 text-sm font-semibold flex flex-col items-center justify-center gap-1 transition-colors">
                <span>PNG</span>
                <span className="text-[10px] text-zinc-400 font-normal">Raster Graphic</span>
              </button>
              <button className="bg-white/5 border border-white/5 hover:border-white/20 text-zinc-400 hover:text-white rounded-xl py-3 px-4 text-sm font-semibold flex flex-col items-center justify-center gap-1 transition-colors">
                <span>SVG</span>
                <span className="text-[10px] text-zinc-500 font-normal">Vector Format</span>
              </button>
            </div>
          </div>

          {/* Canvas Density */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
               <Box className="h-3.5 w-3.5" />
               Output Resolution
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-white">Standard (1x)</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Used for general digital media</p>
                </div>
                <div className="h-4 w-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 hover:border-white/10 bg-white/5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                <div>
                  <p className="text-xs font-bold text-white">Retina HD (2x)</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">High-DPI display printing optimized</p>
                </div>
                <div className="h-4 w-4 rounded-full border-2 border-zinc-600" />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <button 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide py-3 rounded-xl mt-4 transition-colors flex items-center justify-center gap-2"
          >
            <MonitorUp className="h-4 w-4" />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
