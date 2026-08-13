import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Activity, Lock, Search, Database, ChevronRight, Terminal, Cpu, ArrowUpRight } from 'lucide-react';
import HackerText from '../components/effects/HackerText';
import MatrixLogo from '../components/effects/MatrixLogo';

const Landing = () => {
  return (
    <div className="min-h-screen text-slate-100 font-sans overflow-x-hidden">
      {/* Sleek Top Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <Link to="/" className="flex items-center gap-2">
            <MatrixLogo text="KEYGHOST" fontSize={24} />
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6 text-xs font-mono tracking-wider text-slate-400">
          <Link to="/demo" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" /> SIMULATION LAB
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <Link 
            to="/login" 
            className="cyber-button-secondary px-4 py-2 rounded-lg text-xs font-mono text-slate-300 hover:text-white"
          >
            PORTAL LOGIN
          </Link>
          <Link 
            to="/register" 
            className="cyber-button px-5 py-2 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <span>CREATE ACCOUNT</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>NEXT-GEN BEHAVIORAL BIOMETRICS</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 font-semibold">AES-256</span>
          </div>

          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-white leading-[1.1]">
              Continuous Protection Based On <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                How You Type
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-sans font-normal leading-relaxed">
              Passwords can be stolen. Biometric typing signatures cannot. KeyGhost protects user accounts invisibly by verifying flight latency, dwell times, and cadence in real-time.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              to="/register" 
              className="cyber-button w-full sm:w-auto px-8 py-4 text-sm font-semibold rounded-xl flex items-center justify-center gap-3 glow-pulse"
            >
              <Lock className="w-4 h-4" />
              <span>INITIALIZE PROTECTION</span>
            </Link>
            <Link 
              to="/demo" 
              className="cyber-button-secondary w-full sm:w-auto px-8 py-4 text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>TRY SIMULATION LAB</span>
              <ArrowUpRight className="w-4 h-4 opacity-60" />
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-white/5 mt-12 text-left">
            <div className="glass-panel p-5 rounded-xl border border-white/5">
              <div className="text-2xl font-display font-bold text-white">99.8%</div>
              <div className="text-xs font-mono text-slate-400 mt-1">VERIFICATION ACCURACY</div>
            </div>
            <div className="glass-panel p-5 rounded-xl border border-white/5">
              <div className="text-2xl font-display font-bold text-emerald-400">&lt;120ms</div>
              <div className="text-xs font-mono text-slate-400 mt-1">ANOMALY LATENCY</div>
            </div>
            <div className="glass-panel p-5 rounded-xl border border-white/5">
              <div className="text-2xl font-display font-bold text-cyan-400">0 OTP</div>
              <div className="text-xs font-mono text-slate-400 mt-1">FRICTIONLESS ACCESS</div>
            </div>
            <div className="glass-panel p-5 rounded-xl border border-white/5">
              <div className="text-2xl font-display font-bold text-slate-200">256-BIT</div>
              <div className="text-xs font-mono text-slate-400 mt-1">BIOMETRIC ENCRYPTION</div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel glass-panel-hover p-8 rounded-2xl border border-white/10 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-display font-bold text-white mb-3">Zero-Friction Authentication</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Eliminate irritating SMS codes and hardware dongles. User authentication happens transparently in the background every time keys are pressed.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-8 rounded-2xl border border-white/10 group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <Search className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-display font-bold text-white mb-3">Microsecond Latency Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Captures key dwell time, flight time between character transitions, and pressure proxies to synthesize an unforgeable digital signature.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-8 rounded-2xl border border-white/10 group">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <Database className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-lg font-display font-bold text-white mb-3">Real-time Threat Intelligence</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Instantly flags credential stuffing attacks, bot scripts, and account takeover attempts with automated SOC dashboard telemetry.
            </p>
          </div>
        </div>

        {/* Live Threat Monitor Console */}
        <div className="mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-display font-bold text-white">Live Threat Telemetry Feed</h2>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">Real-time biometric score matching & active session telemetry</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE SOC MONITOR
              </span>
            </div>
          </div>

          <div className="glass-panel border border-white/10 rounded-2xl p-6 font-mono text-xs h-72 overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#0b1329] z-10"></div>
            <div className="animate-[slideUp_18s_linear_infinite] space-y-4">
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                <div className="flex items-center space-x-4">
                  <span className="text-slate-500 text-[10px]">14:22:01 UTC</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px]">BLOCKED</span>
                  <span>User @alex_k — Typing rhythm mismatch detected (Score: 0.42 / Threshold: 0.65)</span>
                </div>
                <span className="text-xs font-bold text-rose-400">CRITICAL</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <div className="flex items-center space-x-4">
                  <span className="text-slate-500 text-[10px]">14:19:45 UTC</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">MATCH</span>
                  <span>User @priya_m — Biometric signature matched 94% — Session authorized</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">PASS</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                <div className="flex items-center space-x-4">
                  <span className="text-slate-500 text-[10px]">14:15:12 UTC</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px]">BLOCKED</span>
                  <span>User @raj_dev — Account takeover attempt isolated — Flight time anomaly</span>
                </div>
                <span className="text-xs font-bold text-rose-400">CRITICAL</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                <div className="flex items-center space-x-4">
                  <span className="text-slate-500 text-[10px]">14:12:30 UTC</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">WARNING</span>
                  <span>User @sarah_j — New device profile detected — Challenge mode initiated</span>
                </div>
                <span className="text-xs font-bold text-amber-400">ALERT</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <div className="flex items-center space-x-4">
                  <span className="text-slate-500 text-[10px]">14:08:15 UTC</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">MATCH</span>
                  <span>User @mike_t — Biometric signature matched 98% — Session authorized</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">PASS</span>
              </div>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Landing;
