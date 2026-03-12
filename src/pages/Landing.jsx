import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Activity, Lock, Search, Database } from 'lucide-react';

const Landing = () => {
  useEffect(() => {
    // Disabled for performance in preview iframe
    /*
    if (window.particlesJS) {
      window.particlesJS('particles-js', {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: '#00ff88' },
          shape: { type: 'circle' },
          opacity: { value: 0.5, random: false },
          size: { value: 3, random: true },
          line_linked: { enable: true, distance: 150, color: '#00ff88', opacity: 0.4, width: 1 },
          move: { enable: true, speed: 2, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
        },
        interactivity: {
          detect_on: 'canvas',
          events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
          modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
        },
        retina_detect: true
      });
    }
    */
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-[#f0f4ff] font-sans overflow-x-hidden">
      <div id="particles-js" className="absolute inset-0 z-0 opacity-30"></div>
      
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-[#1a2035] bg-[#0a0f1e]/80 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Shield className="w-8 h-8 text-[#00ff88]" />
          <span className="font-display font-bold text-2xl tracking-wider">KEYGHOST</span>
        </div>
        <div className="space-x-6 font-mono text-sm">
          <Link to="/login" className="text-[#8892b0] hover:text-[#00ff88] transition-colors">LOGIN</Link>
          <Link to="/register" className="px-6 py-2 bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/50 rounded-md hover:bg-[#00ff88]/20 hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all">CREATE ACCOUNT</Link>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-4 pt-24 pb-32">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <h1 className="font-display font-black text-6xl md:text-8xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00d4ff] drop-shadow-[0_0_30px_rgba(0,255,136,0.3)]">
            YOUR PASSWORD ISN'T ENOUGH
          </h1>
          <p className="text-xl md:text-2xl text-[#8892b0] font-light max-w-2xl mx-auto">
            KeyGhost learns <span className="text-[#f0f4ff] font-medium">HOW</span> you type. Not just <span className="text-[#f0f4ff] font-medium">WHAT</span> you type. Invisible biometric security for the modern web.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-[#00ff88] text-[#030712] font-bold rounded-lg hover:bg-[#00d4ff] hover:shadow-[0_0_30px_rgba(0,255,136,0.5)] transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>CREATE ACCOUNT</span>
            </Link>
            <Link to="/demo" className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-[#1a2035] text-[#f0f4ff] font-bold rounded-lg hover:border-[#00d4ff] hover:text-[#00d4ff] hover:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all flex items-center justify-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>LIVE DEMO &rarr;</span>
            </Link>
          </div>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-[#0a0f1e] border border-[#1a2035] hover:border-[#00ff88]/50 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
            <Activity className="w-12 h-12 text-[#00ff88] mb-6" />
            <h3 className="text-xl font-bold mb-3 font-display">Zero Extra Steps</h3>
            <p className="text-[#8892b0]">No hardware tokens or SMS codes. Just type your password normally. The security is invisible.</p>
          </div>
          <div className="p-8 rounded-2xl bg-[#0a0f1e] border border-[#1a2035] hover:border-[#00d4ff]/50 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00d4ff]/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
            <Search className="w-12 h-12 text-[#00d4ff] mb-6" />
            <h3 className="text-xl font-bold mb-3 font-display">ML-Powered Analysis</h3>
            <p className="text-[#8892b0]">Analyzes dwell times, flight times, and typing rhythm using advanced statistical models.</p>
          </div>
          <div className="p-8 rounded-2xl bg-[#0a0f1e] border border-[#1a2035] hover:border-[#ff2d55]/50 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff2d55]/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
            <Database className="w-12 h-12 text-[#ff2d55] mb-6" />
            <h3 className="text-xl font-bold mb-3 font-display">Real-time Threat Dashboard</h3>
            <p className="text-[#8892b0]">Monitor anomalies and blocked attempts instantly with our comprehensive security operations center.</p>
          </div>
        </div>

        <div className="mt-32 max-w-3xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-12">LIVE THREAT FEED</h2>
          <div className="bg-[#0a0f1e] border border-[#1a2035] rounded-xl p-6 font-mono text-sm space-y-4 h-64 overflow-hidden relative shadow-inner">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#0a0f1e] z-10"></div>
            <div className="animate-[slideUp_10s_linear_infinite] space-y-4">
              <div className="flex items-center space-x-4 text-[#ff2d55] bg-[#ff2d55]/10 p-3 rounded border border-[#ff2d55]/20">
                <span className="w-2 h-2 rounded-full bg-[#ff2d55] animate-pulse"></span>
                <span>BLOCKED — User @alex_k — Typing anomaly detected — 2 min ago</span>
              </div>
              <div className="flex items-center space-x-4 text-[#00ff88] bg-[#00ff88]/10 p-3 rounded border border-[#00ff88]/20">
                <span className="w-2 h-2 rounded-full bg-[#00ff88]"></span>
                <span>ALLOWED — User @priya_m — Biometric match 94% — 4 min ago</span>
              </div>
              <div className="flex items-center space-x-4 text-[#ff2d55] bg-[#ff2d55]/10 p-3 rounded border border-[#ff2d55]/20">
                <span className="w-2 h-2 rounded-full bg-[#ff2d55] animate-pulse"></span>
                <span>BLOCKED — User @raj_dev — Possible account takeover — 7 min ago</span>
              </div>
              <div className="flex items-center space-x-4 text-[#ffb800] bg-[#ffb800]/10 p-3 rounded border border-[#ffb800]/20">
                <span className="w-2 h-2 rounded-full bg-[#ffb800]"></span>
                <span>UNCERTAIN — User @sarah_j — New device detected — 12 min ago</span>
              </div>
              <div className="flex items-center space-x-4 text-[#00ff88] bg-[#00ff88]/10 p-3 rounded border border-[#00ff88]/20">
                <span className="w-2 h-2 rounded-full bg-[#00ff88]"></span>
                <span>ALLOWED — User @mike_t — Biometric match 98% — 15 min ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-[#1a2035] py-8 text-center text-[#8892b0] font-mono text-xs">
        <p>Built for Hackathon Glory. 👻 KeyGhost 2024</p>
      </footer>
    </div>
  );
};

export default Landing;
