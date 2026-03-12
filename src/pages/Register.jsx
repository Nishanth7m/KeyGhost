import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import KeystrokeInput from '../components/biometric/KeystrokeInput';
import TypingVisualizer from '../components/biometric/TypingVisualizer';
import { ShieldCheck, UserPlus, Fingerprint, ArrowRight, Loader } from 'lucide-react';

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
            <div className="text-center space-y-2">
              <UserPlus className="w-12 h-12 text-[#00ff88] mx-auto mb-4" />
              <h2 className="text-3xl font-display font-bold">CREATE ACCOUNT</h2>
              <p className="text-[#8892b0] text-sm">Step 1: Basic Details</p>
            </div>

            {error && <div className="p-3 bg-[#ff2d55]/10 border border-[#ff2d55]/50 text-[#ff2d55] rounded-lg text-sm text-center">{error}</div>}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#8892b0] mb-1">USERNAME</label>
                <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-[#030712] border border-[#1a2035] rounded-lg px-4 py-3 focus:outline-none focus:border-[#00d4ff] text-[#f0f4ff]" />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#8892b0] mb-1">EMAIL</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#030712] border border-[#1a2035] rounded-lg px-4 py-3 focus:outline-none focus:border-[#00d4ff] text-[#f0f4ff]" />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#8892b0] mb-1">PASSWORD</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-[#030712] border border-[#1a2035] rounded-lg px-4 py-3 focus:outline-none focus:border-[#00d4ff] text-[#f0f4ff]" />
              </div>
              <button disabled={loading} type="submit" className="w-full py-4 bg-[#00ff88] text-[#030712] font-bold rounded-lg hover:bg-[#00d4ff] transition-colors flex items-center justify-center space-x-2 mt-8">
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <><span>NEXT STEP</span><ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <Fingerprint className="w-12 h-12 text-[#00d4ff] mx-auto mb-4" />
              <h2 className="text-3xl font-display font-bold">BIOMETRIC TRAINING</h2>
              <p className="text-[#8892b0] text-sm">Step 2: Type your password 5 times to build your profile.</p>
            </div>

            <div className="flex justify-between items-center font-mono text-xs text-[#8892b0] mb-2">
              <span>PROGRESS</span>
              <span className="text-[#00d4ff]">{trainingSamples.length} / 5 SAMPLES</span>
            </div>
            
            <div className="w-full h-2 bg-[#030712] rounded-full overflow-hidden border border-[#1a2035]">
              <div className="h-full bg-[#00d4ff] transition-all duration-500" style={{ width: `${(trainingSamples.length / 5) * 100}%` }}></div>
            </div>

            {error && <div className="p-3 bg-[#ff2d55]/10 border border-[#ff2d55]/50 text-[#ff2d55] rounded-lg text-sm text-center">{error}</div>}

            <div className="space-y-4">
              <label className="block text-xs font-mono text-[#8892b0] mb-1">TYPE YOUR PASSWORD ({formData.password})</label>
              <KeystrokeInput 
                mode="training" 
                placeholder="Start typing..." 
                onTypingComplete={handleTrainingComplete}
                onRealtimeUpdate={setCurrentMetrics}
                className="text-center text-xl tracking-widest"
              />
            </div>

            <div className="pt-4">
              <TypingVisualizer metrics={currentMetrics} isComplete={false} />
            </div>
            
            {loading && <div className="flex justify-center"><Loader className="w-6 h-6 text-[#00d4ff] animate-spin" /></div>}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 text-center animate-fade-in">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 bg-[#00ff88]/20 rounded-full animate-ping"></div>
              <div className="relative z-10 w-full h-full bg-[#0a0f1e] border-2 border-[#00ff88] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.5)]">
                <ShieldCheck className="w-16 h-16 text-[#00ff88]" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-bold text-[#00ff88]">PROFILE LOCKED</h2>
              <p className="text-[#8892b0]">Your typing fingerprint has been created. You are now protected.</p>
            </div>

            <div className="bg-[#030712] border border-[#1a2035] rounded-xl p-4 font-mono text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-[#8892b0]">CONFIDENCE THRESHOLD</span>
                <span className="text-[#00ff88]">65.0%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8892b0]">SAMPLES ANALYZED</span>
                <span className="text-[#00ff88]">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8892b0]">STATUS</span>
                <span className="text-[#00ff88]">ACTIVE</span>
              </div>
            </div>

            <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-[#00ff88] text-[#030712] font-bold rounded-lg hover:bg-[#00d4ff] transition-colors shadow-[0_0_20px_rgba(0,255,136,0.3)]">
              GO TO DASHBOARD
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
