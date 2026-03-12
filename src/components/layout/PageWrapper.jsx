import React from 'react';
import MatrixRain from '../effects/MatrixRain';

const PageWrapper = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <MatrixRain />
      <div className="cyber-grid"></div>
      <div className="crt-overlay"></div>
      <div className="scanline"></div>
      <main className="flex-1 flex flex-col relative z-10">
        {children}
      </main>
      <footer className="relative z-10 py-8 border-t border-[#1a2035] bg-[#0a0f1e]/40 backdrop-blur-md">
        <div className="container mx-auto px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-[#8892b0]">
              @ 2026 Scribble Squad. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <span className="font-mono text-[8px] tracking-widest text-[#00ff88]/50">SYSTEM_V1.0.4</span>
            <span className="font-mono text-[8px] tracking-widest text-[#00d4ff]/50">ENCRYPTION_AES_256</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PageWrapper;
