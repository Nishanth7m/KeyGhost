import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import KeystrokeInput from '../components/biometric/KeystrokeInput';
import TypingVisualizer from '../components/biometric/TypingVisualizer';
import { ShieldCheck, UserPlus, Fingerprint, ArrowRight, Loader } from 'lucide-react';
import HackerText from '../components/effects/HackerText';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [trainingSamples, setTrainingSamples] = useState([]);
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.register(formData);
      // Automatically log them in to start training
      const res = await authAPI.login({ username: formData.username, password: formData.password, keystroke_events: [] });
      localStorage.setItem('keyghost_token', res.data.access_token);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTrainingComplete = async (events, finalPhrase) => {
    if (events.length < 4) {
      setError('Too few keystrokes. Please type the full phrase.');
      return;
    }
    if (finalPhrase !== formData.password) {
      setError(`Please type your exact password: "${formData.password}"`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.submitTrainingSample(events);
      setTrainingSamples([...trainingSamples, events]);
      
      if (res.data.is_complete) {
        setStep(3);
      }
    } catch (err) {
      setError('Failed to submit sample');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#1a2035]">
          <div className="h-full bg-[#00ff88] transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <UserPlus className="w-16 h-16 text-[#00ff88] mx-auto mb-2 drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-[#00ff88]"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-[#00ff88]"></div>
              </div>
              <h2 className="text-3xl font-display font-bold tracking-widest text-[#f0f4ff]">
                <HackerText text="INITIALIZE_USER" speed={100} />
              </h2>
              <p className="text-[#8892b0] font-mono text-[10px] tracking-[0.2em]">PHASE_01: CREDENTIAL_SETUP</p>
            </div>

            {error && <div className="p-4 bg-[#ff2d55]/10 border border-[#ff2d55]/30 text-[#ff2d55] rounded font-mono text-xs text-center animate-pulse">ERROR: {error}</div>}

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-[#00ff88] tracking-widest">USERNAME</label>
                <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="cyber-input w-full rounded px-4 py-3 text-sm" placeholder="root" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-[#00ff88] tracking-widest">EMAIL_ADDRESS</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="cyber-input w-full rounded px-4 py-3 text-sm" placeholder="user@secure.net" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-[#00ff88] tracking-widest">ENCRYPTION_KEY</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="cyber-input w-full rounded px-4 py-3 text-sm" placeholder="••••••••" />
              </div>
              <button disabled={loading} type="submit" className="cyber-button w-full py-4 font-bold rounded flex items-center justify-center space-x-3 mt-10">
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <><span>CONTINUE_TO_PHASE_02</span><ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <Fingerprint className="w-16 h-16 text-[#00d4ff] mx-auto mb-2 drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
                <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-[#00d4ff]"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-[#00d4ff]"></div>
              </div>
              <h2 className="text-3xl font-display font-bold tracking-widest text-[#f0f4ff]">BIOMETRIC_SYNC</h2>
              <p className="text-[#8892b0] font-mono text-[10px] tracking-[0.2em]">PHASE_02: PATTERN_RECOGNITION</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center font-mono text-[10px] text-[#8892b0] tracking-widest">
                <span>SYNC_PROGRESS</span>
                <span className="text-[#00d4ff]">{trainingSamples.length} / 5 SAMPLES</span>
              </div>
              <div className="w-full h-1.5 bg-[#030712] rounded-full overflow-hidden border border-[#1a2035]">
                <div className="h-full bg-[#00d4ff] transition-all duration-1000 shadow-[0_0_10px_rgba(0,212,255,0.5)]" style={{ width: `${(trainingSamples.length / 5) * 100}%` }}></div>
              </div>
            </div>

            {error && <div className="p-4 bg-[#ff2d55]/10 border border-[#ff2d55]/30 text-[#ff2d55] rounded font-mono text-xs text-center animate-pulse">ERROR: {error}</div>}

            <div className="space-y-4">
              <label className="block text-[10px] font-mono text-[#00d4ff] tracking-widest mb-2">INPUT_CHALLENGE: "{formData.password}"</label>
              <KeystrokeInput 
                mode="training" 
                placeholder="Awaiting input..." 
                onTypingComplete={handleTrainingComplete}
                onRealtimeUpdate={setCurrentMetrics}
                className="text-center text-2xl tracking-[0.3em] cyber-input py-6"
              />
            </div>

            <div className="pt-4">
              <TypingVisualizer metrics={currentMetrics} isComplete={false} />
            </div>
            
            {loading && <div className="flex justify-center"><Loader className="w-6 h-6 text-[#00d4ff] animate-spin" /></div>}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 text-center animate-fade-in">
            <div className="relative w-40 h-40 mx-auto">
              <div className="absolute inset-0 bg-[#00ff88]/10 rounded-full animate-ping"></div>
              <div className="relative z-10 w-full h-full bg-[#0a0f1e] border border-[#00ff88] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,255,136,0.3)]">
                <ShieldCheck className="w-20 h-20 text-[#00ff88]" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl font-display font-black tracking-widest text-[#00ff88]">PROFILE_LOCKED</h2>
              <p className="text-[#8892b0] font-mono text-sm leading-relaxed">Behavioral fingerprint successfully synthesized. Identity protection active.</p>
            </div>

            <div className="bg-[#030712]/50 border border-[#1a2035] rounded-lg p-6 font-mono text-[10px] text-left space-y-3 tracking-widest">
              <div className="flex justify-between border-b border-[#1a2035] pb-2">
                <span className="text-[#8892b0]">CONFIDENCE_THRESHOLD</span>
                <span className="text-[#00ff88]">65.0%</span>
              </div>
              <div className="flex justify-between border-b border-[#1a2035] pb-2">
                <span className="text-[#8892b0]">SAMPLES_ANALYZED</span>
                <span className="text-[#00ff88]">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8892b0]">PROTECTION_STATUS</span>
                <span className="text-[#00ff88] animate-pulse">ACTIVE</span>
              </div>
            </div>

            <button onClick={() => navigate('/dashboard')} className="cyber-button w-full py-5 font-bold rounded-lg text-lg glow-pulse">
              ENTER_DASHBOARD
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
