import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../lib/api';
import KeystrokeInput from '../components/biometric/KeystrokeInput';
import TypingVisualizer from '../components/biometric/TypingVisualizer';
import MatrixLogo from '../components/effects/MatrixLogo';
import { ShieldCheck, UserPlus, Fingerprint, ArrowRight, Loader, Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen text-slate-100 font-sans flex flex-col justify-between p-4 md:p-8 relative">
      
      {/* Top Header */}
      <header className="flex items-center justify-between w-full max-w-5xl mx-auto py-2">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <MatrixLogo text="KEYGHOST" fontSize={22} />
        </Link>
        <div className="flex items-center space-x-4 text-xs font-mono">
          <span className="text-slate-400 hidden sm:inline">Already registered?</span>
          <Link to="/login" className="cyber-button-secondary px-4 py-2 rounded-lg text-xs">
            PORTAL LOGIN
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto glass-panel rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden my-8">
        {/* Step Progress Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-900">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <UserPlus className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-display font-extrabold text-white">
                Create Account
              </h2>
              <p className="text-slate-400 font-mono text-xs">STEP 1: CREDENTIAL INITIALIZATION</p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl font-mono text-xs text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-300">USERNAME</label>
                <input 
                  required 
                  type="text" 
                  value={formData.username} 
                  onChange={e => setFormData({...formData, username: e.target.value})} 
                  className="cyber-input w-full rounded-xl px-4 py-3 text-sm" 
                  placeholder="e.g. alex_dev" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-300">EMAIL ADDRESS</label>
                <input 
                  required 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className="cyber-input w-full rounded-xl px-4 py-3 text-sm" 
                  placeholder="user@domain.com" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-300">PASSWORD (USED FOR BIOMETRIC SAMPLE)</label>
                <input 
                  required 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  className="cyber-input w-full rounded-xl px-4 py-3 text-sm" 
                  placeholder="••••••••" 
                />
              </div>

              <button 
                disabled={loading} 
                type="submit" 
                className="cyber-button w-full py-3.5 font-bold rounded-xl flex items-center justify-center space-x-2 mt-6 text-xs"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <><span>PROCEED TO BIOMETRIC TRAINING</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="pt-4 border-t border-white/5 text-center font-mono text-xs text-slate-400">
              Already enrolled in KeyGhost?{' '}
              <Link to="/login" className="text-cyan-400 font-bold hover:underline">
                Portal Login &rarr;
              </Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <Fingerprint className="w-7 h-7 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-display font-extrabold text-white">Biometric Synthesis</h2>
              <p className="text-slate-400 font-mono text-xs">STEP 2: TYPE PASSWORD 5 TIMES TO ENROLL</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center font-mono text-xs text-slate-400">
                <span>TRAINING SAMPLES</span>
                <span className="text-cyan-400 font-bold">{trainingSamples.length} / 5 COMPLETED</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-cyan-400 transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                  style={{ width: `${(trainingSamples.length / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl font-mono text-xs text-center">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-mono text-slate-300">
                Re-type password: <span className="text-cyan-400 font-bold">"{formData.password}"</span>
              </label>
              <KeystrokeInput 
                mode="training" 
                placeholder="Type exact password..." 
                onTypingComplete={handleTrainingComplete}
                onRealtimeUpdate={setCurrentMetrics}
                className="text-center text-xl tracking-wider cyber-input py-3.5 rounded-xl"
              />
            </div>

            <TypingVisualizer metrics={currentMetrics} isComplete={false} />
            
            {loading && (
              <div className="flex justify-center pt-2">
                <Loader className="w-5 h-5 text-cyan-400 animate-spin" />
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center animate-fade-in py-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="w-10 h-10 text-emerald-400" />
            </div>
            
            <div>
              <h2 className="text-2xl font-display font-extrabold text-emerald-400">Profile Enrolled!</h2>
              <p className="text-slate-400 font-mono text-xs mt-1">Behavioral typing signature successfully synthesized & encrypted.</p>
            </div>

            <div className="bg-slate-950 border border-white/5 rounded-2xl p-5 font-mono text-xs text-left space-y-2.5 text-slate-300">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">SECURITY THRESHOLD</span>
                <span className="text-emerald-400 font-bold">65.0% MATCH</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">SAMPLES SYNTHESIZED</span>
                <span className="text-cyan-400 font-bold">5 SAMPLES</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">BEHAVIORAL GUARD</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
                </span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/dashboard')} 
              className="cyber-button w-full py-4 font-bold rounded-xl text-xs glow-pulse"
            >
              LAUNCH SOC DASHBOARD
            </button>
          </div>
        )}
      </div>

      {/* Footer link */}
      <footer className="text-center font-mono text-xs text-slate-500 py-2">
        <Link to="/" className="hover:text-slate-300 transition-colors inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home Page
        </Link>
      </footer>

    </div>
  );
};

export default Register;
