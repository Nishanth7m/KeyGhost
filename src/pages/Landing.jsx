import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Activity, Lock, Search, Database } from 'lucide-react';
import HackerText from '../components/effects/HackerText';
import MatrixLogo from '../components/effects/MatrixLogo';

const Landing = () => {
  useEffect(() => {
    // Disabled for performance in preview iframe
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-[#f0f4ff] font-sans overflow-x-hidden">
      <div id="particles-js" className="absolute inset-0 z-0 opacity-30"></div>
      
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-[#1a2035] bg-[#0a0f1e]/40 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Shield className="w-8 h-8 text-[#00ff88] drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
          <Link to="/" className="flex items-center">
            <MatrixLogo text="KEYGHOST" fontSize={28} />
          </Link>
        </div>
        <div className="space-x-6 font-mono text-xs tracking-widest">
          <Link to="/login" className="text-[#8892b0] hover:text-[#00ff88] transition-colors">LOGIN</Link>
          <Link to="/register" className="cyber-button px-6 py-2 rounded-md">CREATE_ACCOUNT</Link>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-4 pt-24 pb-32">
        <div className="text-center max-w-5xl mx-auto space-y-12">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded text-[#00ff88] font-mono text-[10px] tracking-[0.3em] mb-4 animate-pulse">
              SYSTEM_STATUS: SECURED
            </div>
            <h1 
              className="glitch font-display font-black text-6xl md:text-9xl tracking-tighter text-[#f0f4ff] leading-none"
              data-text="YOUR PASSWORD ISN'T ENOUGH"
            >
              <HackerText text="YOUR PASSWORD ISN'T ENOUGH" speed={30} />
            </h1>
          </div>
          
          <p className="text-lg md:text-xl text-[#8892b0] font-mono max-w-3xl mx-auto leading-relaxed">
            <span className="text-[#00ff88]">&gt;</span> KeyGhost analyzes <span className="text-[#00d4ff] underline decoration-[#00d4ff]/30 underline-offset-4">behavioral biometrics</span>. 
            Invisible protection that learns <span className="text-[#f0f4ff] font-bold">HOW</span> you type, not just what you type.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-4">
            <Link to="/register" className="cyber-button w-full sm:w-auto px-10 py-5 text-lg font-bold rounded-lg flex items-center justify-center space-x-3 glow-pulse">
              <Lock className="w-5 h-5" />
              <span>INITIALIZE_PROTECTION</span>
            </Link>
            <Link to="/demo" className="w-full sm:w-auto px-10 py-5 bg-transparent border border-[#1a2035] text-[#8892b0] font-mono text-sm rounded-lg hover:border-[#00d4ff] hover:text-[#00d4ff] transition-all flex items-center justify-center space-x-3">
              <Zap className="w-5 h-5" />
              <span>RUN_SIMULATION</span>
            </Link>
          </div>
        </div>

        <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="glass-panel p-10 rounded-2xl border border-[#1a2035] hover:border-[#00ff88]/50 transition-all group">
            <div className="w-16 h-16 bg-[#00ff88]/10 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Activity className="w-8 h-8 text-[#00ff88]" />
            </div>
            <h3 className="text-xl font-bold mb-4 font-display tracking-wider">ZERO_FRICTION</h3>
            <p className="text-[#8892b0] font-mono text-sm leading-relaxed">No hardware tokens. No SMS codes. Just your natural typing rhythm as the second factor.</p>
          </div>
          <div className="glass-panel p-10 rounded-2xl border border-[#1a2035] hover:border-[#00d4ff]/50 transition-all group">
            <div className="w-16 h-16 bg-[#00d4ff]/10 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Search className="w-8 h-8 text-[#00d4ff]" />
            </div>
            <h3 className="text-xl font-bold mb-4 font-display tracking-wider">NEURAL_ENGINE</h3>
            <p className="text-[#8892b0] font-mono text-sm leading-relaxed">Advanced ML models analyze dwell times and flight times to verify identity with 99.9% accuracy.</p>
          </div>
          <div className="glass-panel p-10 rounded-2xl border border-[#1a2035] hover:border-[#ff2d55]/50 transition-all group">
            <div className="w-16 h-16 bg-[#ff2d55]/10 rounded-xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Database className="w-8 h-8 text-[#ff2d55]" />
            </div>
            <h3 className="text-xl font-bold mb-4 font-display tracking-wider">THREAT_INTEL</h3>
            <p className="text-[#8892b0] font-mono text-sm leading-relaxed">Monitor anomalies and blocked attempts instantly with our comprehensive security operations center.</p>
          </div>
        </div>

        <div className="mt-40 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold tracking-[0.3em] text-[#00ff88]">LIVE_THREAT_FEED</h2>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-[#8892b0]">
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></span>
              <span>REAL_TIME_MONITORING</span>
            </div>
          </div>
          <div className="glass-panel border border-[#1a2035] rounded-xl p-8 font-mono text-xs space-y-4 h-80 overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#0a0f1e]/80 z-10"></div>
            <div className="animate-[slideUp_15s_linear_infinite] space-y-6">
              <div className="flex items-center space-x-6 text-[#ff2d55] border-l-2 border-[#ff2d55] pl-4 py-1">
                <span className="opacity-50">[14:22:01]</span>
                <span className="font-bold">BLOCKED</span>
                <span className="text-[#8892b0]">User @alex_k — Typing anomaly detected — 0.42 confidence</span>
              </div>
              <div className="flex items-center space-x-6 text-[#00ff88] border-l-2 border-[#00ff88] pl-4 py-1">
                <span className="opacity-50">[14:19:45]</span>
                <span className="font-bold">VERIFIED</span>
                <span className="text-[#8892b0]">User @priya_m — Biometric match 94% — Session authorized</span>
              </div>
              <div className="flex items-center space-x-6 text-[#ff2d55] border-l-2 border-[#ff2d55] pl-4 py-1">
                <span className="opacity-50">[14:15:12]</span>
                <span className="font-bold">BLOCKED</span>
                <span className="text-[#8892b0]">User @raj_dev — Possible account takeover — IP: 192.168.1.1</span>
              </div>
              <div className="flex items-center space-x-6 text-[#ffb800] border-l-2 border-[#ffb800] pl-4 py-1">
                <span className="opacity-50">[14:12:30]</span>
                <span className="font-bold">WARNING</span>
                <span className="text-[#8892b0]">User @sarah_j — New device detected — Verification required</span>
              </div>
              <div className="flex items-center space-x-6 text-[#00ff88] border-l-2 border-[#00ff88] pl-4 py-1">
                <span className="opacity-50">[14:08:15]</span>
                <span className="font-bold">VERIFIED</span>
                <span className="text-[#8892b0]">User @mike_t — Biometric match 98% — Session authorized</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-[#1a2035] py-8 text-center text-[#8892b0] font-mono text-xs">
        <p>Built for Hackathon Glory. 👻 KeyGhost 2026</p>
      </footer>
    </div>
  );
};

export default Landing;
