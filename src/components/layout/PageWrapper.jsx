import React from 'react';

const PageWrapper = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative bg-[#030712] text-slate-100 selection:bg-emerald-500/30">
      <div className="cyber-grid"></div>
      
      {/* Subtle ambient spotlight glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none z-0" />

      <main className="flex-1 flex flex-col relative z-10">
        {children}
      </main>
      
      <footer className="relative z-10 py-6 border-t border-white/5 bg-[#080d1a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="font-mono text-xs tracking-wider text-slate-400">
              © 2026 Nishanth. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center space-x-6 text-[11px] font-mono tracking-widest text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80"></span> SYSTEM ACTIVE</span>
            <span className="text-slate-700">|</span>
            <span>AES-256 GCM</span>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-400/80">v2.4.0-PROD</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PageWrapper;
