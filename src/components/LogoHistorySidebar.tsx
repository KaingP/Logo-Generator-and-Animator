import React from "react";
import { GeneratedLogo } from "../types";
import { Clock, History, X, ChevronRight, Image as ImageIcon } from "lucide-react";

interface LogoHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedLogo[];
  onSelectLogo: (logo: GeneratedLogo) => void;
}

export default function LogoHistorySidebar({ isOpen, onClose, history, onSelectLogo }: LogoHistorySidebarProps) {
  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity xl:hidden cursor-pointer"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-80 bg-[#0a0a0a] border-l border-white/5 z-50 transform transition-transform duration-300 shadow-2xl flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-zinc-400" />
            <h3 className="text-sm font-bold text-white tracking-widest uppercase">Logo History</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
              <Clock className="h-8 w-8 text-zinc-600" />
              <p className="text-xs text-zinc-400">No logos generated yet.</p>
            </div>
          ) : (
            history.map((logo, index) => (
              <div 
                key={`${logo.timestamp}-${index}`}
                onClick={() => onSelectLogo(logo)}
                className="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
              >
                <div className="aspect-square bg-[#050505] p-3 flex items-center justify-center relative">
                  {logo.isFallback ? (
                    <img 
                      src={logo.imageUrl} 
                      alt="Thumbnail" 
                      className="w-full h-full object-contain filter drop-shadow-md pb-1"
                    />
                  ) : (
                    <img 
                      src={logo.imageUrl} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover rounded-md"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Restore
                    </div>
                  </div>
                </div>
                
                <div className="p-3 border-t border-white/5">
                  <p className="text-[10px] font-mono text-zinc-400 truncate pr-4">
                    {logo.prompt}
                  </p>
                  <p className="text-[9px] text-zinc-600 mt-1 uppercase tracking-wider">
                    {new Date(logo.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
