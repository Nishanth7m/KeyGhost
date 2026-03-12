import React, { useState } from 'react';
import KeystrokeInput from '../components/biometric/KeystrokeInput';
import TypingVisualizer from '../components/biometric/TypingVisualizer';
import { KeystrokeEngine } from '../lib/keystrokeEngine';

const Demo = () => {
  const [mode, setMode] = useState('register'); // register, locked, test
  const [profile, setProfile] = useState(null);
  const [samples, setSamples] = useState([]);
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testMetrics, setTestMetrics] = useState(null);
  const [hackathonMode, setHackathonMode] = useState(false);
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
      setErrorMsg(`Please type the exact same phrase: "${registeredPhrase}"`);
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
    
    const threshold = hackathonMode ? 0.85 : 0.65;

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

  return (
    <div className="min-h-screen text-[#f0f4ff] font-sans p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-3 bg-[#0a0f1e]/80 border border-[#1a2035] rounded-full px-5 py-2 backdrop-blur-md">
        <span className="text-[10px] font-mono text-[#8892b0] tracking-[0.3em]">HACKATHON_MODE</span>
        <button 
          onClick={() => setHackathonMode(!hackathonMode)}
          className={`w-10 h-5 rounded-full relative transition-all duration-500 ${hackathonMode ? 'bg-[#ff2d55] shadow-[0_0_10px_rgba(255,45,85,0.5)]' : 'bg-[#1a2035]'}`}
        >
          <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform duration-300 ${hackathonMode ? 'translate-x-5.5' : 'translate-x-1'}`}></div>
        </button>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 z-10">
        {/* LEFT PANEL - REGISTER */}
        <div className={`glass-panel rounded-2xl p-10 transition-all duration-700 ${mode === 'locked' || mode === 'test' ? 'opacity-40 scale-95 blur-[1px]' : 'scale-100 shadow-[0_0_50px_rgba(0,255,136,0.15)] border-[#00ff88]/30'}`}>
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-10 h-10 bg-[#00ff88]/10 rounded flex items-center justify-center">
              <span className="text-[#00ff88] font-mono font-bold">01</span>
            </div>
            <h2 className="text-2xl font-display font-bold tracking-widest text-[#00ff88]">ENROLL_BIOMETRICS</h2>
          </div>
          
          {mode === 'register' ? (
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between font-mono text-[10px] text-[#8892b0] tracking-widest">
                  <span>SYNC_PROGRESS</span>
                  <span className="text-[#00ff88]">{samples.length} / 5</span>
                </div>
                <div className="h-1.5 bg-[#030712] rounded-full overflow-hidden border border-[#1a2035]">
                  <div className="h-full bg-[#00ff88] transition-all duration-1000 shadow-[0_0_10px_rgba(0,255,136,0.5)]" style={{ width: `${(samples.length/5)*100}%` }}></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="block text-[10px] font-mono text-[#8892b0] tracking-widest">
                  {samples.length === 0 ? "INPUT_INITIAL_PHRASE" : `REPLICATE_PHRASE: "${registeredPhrase}"`}
                </label>
                <KeystrokeInput 
                  mode="training" 
                  placeholder="Awaiting input..." 
                  value={demoPhrase}
                  onChange={e => setDemoPhrase(e.target.value)}
                  onTypingComplete={(events, finalPhrase) => { handleRegisterComplete(events, finalPhrase); setDemoPhrase(''); }}
                  onRealtimeUpdate={setCurrentMetrics}
                  type="text"
                  className="text-3xl text-center cyber-input py-8 tracking-[0.2em]"
                />
              </div>
              {errorMsg && <p className="text-[#ff2d55] text-xs font-mono text-center animate-pulse tracking-widest bg-[#ff2d55]/10 py-2 rounded border border-[#ff2d55]/20">{errorMsg}</p>}
              <TypingVisualizer metrics={currentMetrics} isComplete={false} />
            </div>
          ) : (
            <div className="text-center space-y-8 py-16">
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 bg-[#00ff88]/10 rounded-full animate-ping"></div>
                <div className="relative z-10 w-full h-full bg-[#0a0f1e] border border-[#00ff88] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,255,136,0.3)]">
                  <span className="text-5xl">🔐</span>
                </div>
              </div>
              <h3 className="text-3xl font-display font-black tracking-widest text-[#00ff88]">PROFILE_LOCKED</h3>
              <div className="grid grid-cols-3 gap-4 font-mono text-[10px] text-[#8892b0] tracking-tighter">
                <div className="bg-[#030712] p-3 rounded border border-[#1a2035]">DWELL: <span className="text-[#00ff88]">{profile.mean_dwell.toFixed(0)}ms</span></div>
                <div className="bg-[#030712] p-3 rounded border border-[#1a2035]">FLIGHT: <span className="text-[#00ff88]">{profile.mean_flight.toFixed(0)}ms</span></div>
                <div className="bg-[#030712] p-3 rounded border border-[#1a2035]">SPEED: <span className="text-[#00ff88]">{profile.speed.toFixed(1)}cps</span></div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - TEST */}
        <div className={`glass-panel rounded-2xl p-10 transition-all duration-700 ${(mode === 'locked' || mode === 'test') ? 'scale-100 shadow-[0_0_50px_rgba(0,212,255,0.15)] border-[#00d4ff]/30' : 'opacity-40 scale-95 pointer-events-none blur-[1px]'}`}>
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-10 h-10 bg-[#00d4ff]/10 rounded flex items-center justify-center">
              <span className="text-[#00d4ff] font-mono font-bold">02</span>
            </div>
            <h2 className="text-2xl font-display font-bold tracking-widest text-[#00d4ff]">CHALLENGE_IDENTITY</h2>
          </div>
          
          <div className="space-y-10">
            <div className="space-y-4">
              <label className="block text-[10px] font-mono text-[#8892b0] tracking-widest">INPUT_VERIFICATION_PHRASE</label>
              <KeystrokeInput 
                mode="login" 
                placeholder="Verify identity..." 
                value={testPhrase}
                onChange={e => setTestPhrase(e.target.value)}
                onTypingComplete={(events, finalPhrase) => { handleTestComplete(events, finalPhrase); setTestPhrase(''); }}
                onRealtimeUpdate={setTestMetrics}
                type="text"
                className="text-3xl text-center cyber-input py-8 tracking-[0.2em]"
              />
            </div>
            <TypingVisualizer metrics={testMetrics} isComplete={false} />
            <div className="bg-[#030712]/50 border border-[#1a2035] p-6 rounded-xl">
              <p className="text-[#8892b0] font-mono text-[10px] leading-relaxed tracking-widest">
                <span className="text-[#00d4ff]">&gt;</span> SYSTEM_ADVISORY: Behavioral biometrics are analyzed in real-time. Any deviation from the registered rhythm will trigger an immediate access block.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER DISPLAY - RESULT */}
      {testResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/90 backdrop-blur-md animate-fade-in" onClick={() => { setTestResult(null); setMode('locked'); }}>
          <div className={`text-center space-y-8 p-12 rounded-3xl border-4 ${testResult.verdict === 'MATCH' ? 'border-[#00ff88] shadow-[0_0_100px_rgba(0,255,136,0.5)]' : 'border-[#ff2d55] shadow-[0_0_100px_rgba(255,45,85,0.5)]'} bg-[#0a0f1e] max-w-2xl w-full mx-4`}>
            <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="128" cy="128" r="120" stroke="#1a2035" strokeWidth="16" fill="none" />
                <circle cx="128" cy="128" r="120" stroke={testResult.verdict === 'MATCH' ? '#00ff88' : '#ff2d55'} strokeWidth="16" fill="none" strokeDasharray="753.9" strokeDashoffset={753.9 * (1 - testResult.score)} className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="text-center">
                <div className="text-6xl font-display font-black">{(testResult.score * 100).toFixed(1)}%</div>
                <div className="font-mono text-sm text-[#8892b0] mt-2">MATCH SCORE</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className={`text-5xl font-display font-black tracking-tighter ${testResult.verdict === 'MATCH' ? 'text-[#00ff88]' : 'text-[#ff2d55]'}`}>
                {testResult.verdict === 'MATCH' ? '✓ IDENTITY CONFIRMED' : testResult.verdict === 'WRONG_PASSWORD' ? '✗ INCORRECT PASSWORD' : '✗ IMPOSTOR DETECTED'}
              </h2>
              <p className="font-mono text-[#8892b0]">Threshold: {(testResult.threshold * 100).toFixed(1)}%</p>
            </div>
            
            <p className="text-sm text-[#8892b0] animate-pulse">Click anywhere to try again</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Demo;
