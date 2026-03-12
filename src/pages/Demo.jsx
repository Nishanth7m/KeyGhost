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
    <div className="min-h-screen bg-[#030712] text-[#f0f4ff] font-sans p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-2 bg-[#0a0f1e] border border-[#1a2035] rounded-full px-4 py-2">
        <span className="text-xs font-mono text-[#8892b0]">🏆 HACKATHON MODE</span>
        <button 
          onClick={() => setHackathonMode(!hackathonMode)}
          className={`w-10 h-5 rounded-full relative transition-colors ${hackathonMode ? 'bg-[#ff2d55]' : 'bg-[#1a2035]'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${hackathonMode ? 'translate-x-5' : 'translate-x-1'}`}></div>
        </button>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
        {/* LEFT PANEL - REGISTER */}
        <div className={`glass-panel rounded-2xl p-8 transition-all duration-500 ${mode === 'locked' || mode === 'test' ? 'opacity-50 scale-95' : 'scale-100 shadow-[0_0_30px_rgba(0,255,136,0.2)]'}`}>
          <h2 className="text-3xl font-display font-bold mb-2 text-[#00ff88]">1. REGISTER AS DEMO USER</h2>
          <p className="text-[#8892b0] font-mono text-sm mb-8">Type a phrase 5 times to build your profile.</p>
          
          {mode === 'register' ? (
            <div className="space-y-6">
              <div className="flex justify-between font-mono text-xs text-[#00ff88]">
                <span>PROGRESS</span>
                <span>{samples.length} / 5</span>
              </div>
              <div className="h-2 bg-[#030712] rounded-full overflow-hidden">
                <div className="h-full bg-[#00ff88] transition-all" style={{ width: `${(samples.length/5)*100}%` }}></div>
              </div>
              
              <KeystrokeInput 
                mode="training" 
                placeholder={samples.length === 0 ? "Type anything..." : `Type: "${registeredPhrase}"`} 
                value={demoPhrase}
                onChange={e => setDemoPhrase(e.target.value)}
                onTypingComplete={(events, finalPhrase) => { handleRegisterComplete(events, finalPhrase); setDemoPhrase(''); }}
                onRealtimeUpdate={setCurrentMetrics}
                type="text"
                className="text-2xl text-center"
              />
              {errorMsg && <p className="text-[#ff2d55] text-sm font-mono text-center animate-pulse">{errorMsg}</p>}
              <TypingVisualizer metrics={currentMetrics} isComplete={false} />
            </div>
          ) : (
            <div className="text-center space-y-4 py-12">
              <div className="w-24 h-24 mx-auto border-4 border-[#00ff88] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.5)]">
                <span className="text-4xl">🔐</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-[#00ff88]">PROFILE LOCKED</h3>
              <div className="font-mono text-xs text-[#8892b0] space-y-1">
                <div>DWELL: {profile.mean_dwell.toFixed(0)}ms</div>
                <div>FLIGHT: {profile.mean_flight.toFixed(0)}ms</div>
                <div>SPEED: {profile.speed.toFixed(1)} cps</div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL - TEST */}
        <div className={`glass-panel rounded-2xl p-8 transition-all duration-500 ${(mode === 'locked' || mode === 'test') ? 'scale-100 shadow-[0_0_30px_rgba(0,212,255,0.2)]' : 'opacity-50 scale-95 pointer-events-none'}`}>
          <h2 className="text-3xl font-display font-bold mb-2 text-[#00d4ff]">2. NOW TRY TO FOOL IT</h2>
          <p className="text-[#8892b0] font-mono text-sm mb-8">Have someone else type the exact same phrase.</p>
          
          <div className="space-y-6">
            <KeystrokeInput 
              mode="login" 
              placeholder="Type the phrase..." 
              value={testPhrase}
              onChange={e => setTestPhrase(e.target.value)}
              onTypingComplete={(events, finalPhrase) => { handleTestComplete(events, finalPhrase); setTestPhrase(''); }}
              onRealtimeUpdate={setTestMetrics}
              type="text"
              className="text-2xl text-center"
            />
            <TypingVisualizer metrics={testMetrics} isComplete={false} />
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
