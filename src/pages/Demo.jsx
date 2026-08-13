import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import KeystrokeInput from '../components/biometric/KeystrokeInput';
import TypingVisualizer from '../components/biometric/TypingVisualizer';
import { KeystrokeEngine } from '../lib/keystrokeEngine';
import MatrixLogo from '../components/effects/MatrixLogo';
import { Shield, Fingerprint, Lock, Zap, ArrowRight, RefreshCw, AlertTriangle, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

const Demo = () => {
  const [mode, setMode] = useState('register'); // register, locked, test
  const [profile, setProfile] = useState(null);
  const [samples, setSamples] = useState([]);
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testMetrics, setTestMetrics] = useState(null);
  const [strictness, setStrictness] = useState(false);
  const [demoPhrase, setDemoPhrase] = useState('');
  const [testPhrase, setTestPhrase] = useState('');
  const [registeredPhrase, setRegisteredPhrase] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const engine = new KeystrokeEngine();

  const handleRegisterComplete = (events, phrase) => {
    if (events.length < 4) return;
    
    if (samples.length === 0) {
      setRegisteredPhrase(phrase);
    } else if (phrase !== registeredPhrase) {
      setErrorMsg(`Phrase must match exactly: "${registeredPhrase}"`);
      return;
    }
    
    setErrorMsg('');
    const newSamples = [...samples, events];
    setSamples(newSamples);
    
    if (newSamples.length >= 5) {
      const allFeatures = newSamples.map(s => engine.extractFeatures(s));
      const mean_dwell = allFeatures.reduce((acc, f) => acc + f.pressure_proxy, 0) / 5;
      const mean_flight = allFeatures.reduce((acc, f) => acc + (f.flight_times.length ? f.flight_times.reduce((a,b)=>a+b,0)/f.flight_times.length : 0), 0) / 5;
      const speed = allFeatures.reduce((acc, f) => acc + f.typing_speed, 0) / 5;
      const rhythm = allFeatures.reduce((acc, f) => acc + f.rhythm_score, 0) / 5;
      
      setProfile({ mean_dwell, mean_flight, speed, rhythm });
      setMode('locked');
    }
  };

  const handleTestComplete = (events, phrase) => {
    if (events.length < 4) return;
    
    const threshold = strictness ? 0.85 : 0.65;

    if (phrase !== registeredPhrase) {
      setTestResult({
        score: 0,
        threshold,
        verdict: 'WRONG_PASSWORD'
      });
      setMode('test');
      return;
    }

    const liveFeatures = engine.extractFeatures(events);
    const score = engine.computeSimilarity(profile, liveFeatures);
    
    setTestResult({
      score,
      threshold,
      verdict: score >= threshold ? 'MATCH' : 'BLOCKED'
    });
    setMode('test');
  };

  const resetLab = () => {
    setMode('register');
    setProfile(null);
    setSamples([]);
    setDemoPhrase('');
    setTestPhrase('');
    setRegisteredPhrase('');
    setTestResult(null);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans pb-16">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <Link to="/" className="flex items-center gap-2">
            <MatrixLogo text="KEYGHOST" fontSize={22} />
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-mono text-slate-400">SIMULATION LAB</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-900/80 border border-white/10 rounded-full px-4 py-1.5 text-xs font-mono">
            <span className="text-slate-400">STRICT_MODE:</span>
            <button 
              onClick={() => setStrictness(!strictness)}
              className={`w-8 h-4 rounded-full relative transition-all duration-300 ${strictness ? 'bg-rose-500' : 'bg-slate-700'}`}
            >
              <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform duration-200 ${strictness ? 'translate-x-4.5' : 'translate-x-0.5'}`}></div>
            </button>
          </div>
          <button 
            onClick={resetLab} 
            className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors"
            title="Reset Simulation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs mb-3">
          <Zap className="w-3.5 h-3.5" />
          <span>INTERACTIVE BIOMETRIC LABORATORY</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">
          Test Behavioral Biometrics Live
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-2">
          Step 1: Type a passphrase 5 times to synthesize your baseline cadence. <br />
          Step 2: Challenge your profile or try typing at a different rhythm!
        </p>
      </div>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 z-10 relative">
        
        {/* PANEL 1: ENROLLMENT */}
        <div className={`glass-panel p-8 rounded-2xl border transition-all duration-500 ${mode === 'locked' || mode === 'test' ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-white/10 shadow-2xl'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-emerald-400 text-xs">
                01
              </div>
              <h2 className="text-lg font-display font-bold text-white">Enrollment Phase</h2>
            </div>
            {mode === 'locked' && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> PROFILE LOCKED
              </span>
            )}
          </div>

          {mode === 'register' ? (
            <div className="space-y-6">
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs text-slate-400">
                  <span>SAMPLE SYNTHESIS</span>
                  <span className="text-emerald-400 font-bold">{samples.length} / 5</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" 
                    style={{ width: `${(samples.length / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Input field */}
              <div className="space-y-3">
                <label className="block text-xs font-mono text-slate-300">
                  {samples.length === 0 ? "1. Choose & Type a Passphrase:" : `2. Repeat exact phrase: "${registeredPhrase}"`}
                </label>
                <KeystrokeInput 
                  mode="training" 
                  placeholder="e.g. keyghost_secure_2026" 
                  value={demoPhrase}
                  onChange={e => setDemoPhrase(e.target.value)}
                  onTypingComplete={(events, finalPhrase) => { handleRegisterComplete(events, finalPhrase); setDemoPhrase(''); }}
                  onRealtimeUpdate={setCurrentMetrics}
                  type="text"
                  className="text-lg text-center cyber-input py-4 rounded-xl"
                />
              </div>

              {errorMsg && (
                <p className="text-rose-400 text-xs font-mono text-center bg-rose-500/10 py-2.5 rounded-lg border border-rose-500/20">
                  {errorMsg}
                </p>
              )}

              {/* Visualizer */}
              <TypingVisualizer metrics={currentMetrics} isComplete={false} />
            </div>
          ) : (
            <div className="py-8 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Fingerprint className="w-10 h-10 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white">Biometric Signature Synthesized</h3>
                <p className="text-xs font-mono text-slate-400 mt-1">Passphrase: "{registeredPhrase}"</p>
              </div>

              {profile && (
                <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-white/5">
                    <span className="text-slate-500 block text-[10px]">AVG DWELL</span>
                    <span className="text-emerald-400 font-bold">{profile.mean_dwell.toFixed(0)} ms</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-white/5">
                    <span className="text-slate-500 block text-[10px]">AVG FLIGHT</span>
                    <span className="text-emerald-400 font-bold">{profile.mean_flight.toFixed(0)} ms</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-white/5">
                    <span className="text-slate-500 block text-[10px]">TYPING SPEED</span>
                    <span className="text-emerald-400 font-bold">{profile.speed.toFixed(1)} CPS</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PANEL 2: VERIFICATION CHALLENGE */}
        <div className={`glass-panel p-8 rounded-2xl border transition-all duration-500 ${mode === 'locked' || mode === 'test' ? 'border-cyan-500/30 shadow-2xl' : 'opacity-40 pointer-events-none border-white/5'}`}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-cyan-400 text-xs">
              02
            </div>
            <h2 className="text-lg font-display font-bold text-white">Identity Challenge</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-xs font-mono text-slate-300">
                Type passphrase to test biometric match:
              </label>
              <KeystrokeInput 
                mode="login" 
                placeholder={registeredPhrase || "Type verification phrase..."} 
                value={testPhrase}
                onChange={e => setTestPhrase(e.target.value)}
                onTypingComplete={(events, finalPhrase) => { handleTestComplete(events, finalPhrase); setTestPhrase(''); }}
                onRealtimeUpdate={setTestMetrics}
                type="text"
                className="text-lg text-center cyber-input py-4 rounded-xl"
              />
            </div>

            <TypingVisualizer metrics={testMetrics} isComplete={false} />

            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-400 space-y-1 font-mono">
              <span className="text-cyan-400 font-bold">INFO:</span>
              <p>Try typing faster, slower, or having someone else type the password to see how the neural match score detects variations!</p>
            </div>
          </div>
        </div>

      </main>

      {/* RESULT MODAL DIALOG */}
      {testResult && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => { setTestResult(null); setMode('locked'); }}
        >
          <div 
            className={`glass-panel max-w-lg w-full p-8 rounded-3xl border-2 text-center space-y-6 shadow-2xl ${testResult.verdict === 'MATCH' ? 'border-emerald-500 shadow-emerald-500/20' : 'border-rose-500 shadow-rose-500/20'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-slate-900 border border-white/10">
              {testResult.verdict === 'MATCH' ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-10 h-10 text-rose-400" />
              )}
            </div>

            <div>
              <h2 className={`text-2xl font-display font-extrabold ${testResult.verdict === 'MATCH' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {testResult.verdict === 'MATCH' ? 'IDENTITY CONFIRMED' : testResult.verdict === 'WRONG_PASSWORD' ? 'INCORRECT PASSPHRASE' : 'BIOMETRIC ANOMALY BLOCKED'}
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-1">
                {testResult.verdict === 'MATCH' 
                  ? 'Keystroke timing pattern matches the enrolled user fingerprint.' 
                  : 'Flight times & dwell latency deviated significantly from enrolled profile.'}
              </p>
            </div>

            {/* Score Ring / Bar */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">BIOMETRIC SIMILARITY SCORE</span>
                <span className={`font-bold text-base ${testResult.verdict === 'MATCH' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(testResult.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full transition-all duration-700 ${testResult.verdict === 'MATCH' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(100, Math.max(0, testResult.score * 100))}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
                <span>SECURITY THRESHOLD: {(testResult.threshold * 100).toFixed(0)}%</span>
                <span>MODE: {strictness ? 'STRICT (85%)' : 'STANDARD (65%)'}</span>
              </div>
            </div>

            <button 
              onClick={() => { setTestResult(null); setMode('locked'); }}
              className="cyber-button w-full py-3.5 rounded-xl text-xs font-bold"
            >
              TEST ANOTHER SAMPLE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Demo;
