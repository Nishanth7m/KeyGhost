import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import KeystrokeInput from '../components/biometric/KeystrokeInput';
import TypingVisualizer from '../components/biometric/TypingVisualizer';
import MatrixLogo from '../components/effects/MatrixLogo';
import { Lock, AlertTriangle, CheckCircle, Loader, UserPlus, ArrowLeft, Shield } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [status, setStatus] = useState('idle'); // idle, analyzing, success, blocked
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [anomaly, setAnomaly] = useState(null);

  const handleLogin = async (events, finalPassword) => {
    setStatus('analyzing');
    setError(null);
    try {
      const res = await authAPI.login({
        username: formData.username,
        password: finalPassword || formData.password,
        keystroke_events: events,
        client_info: { ip: '127.0.0.1', user_agent: navigator.userAgent }
      });

      if (res.data.status === 'TRAINING_REQUIRED') {
        login(res.data.access_token, { username: formData.username });
        navigate('/register'); // Redirect to training flow
        return;
      }

      setStatus('success');
      setTimeout(() => {
        login(res.data.access_token, { username: formData.username });
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      if (err.response?.status === 403) {
        setStatus('blocked');
        setAnomaly(err.response.data.detail);
      } else {
        setStatus('idle');
        setError(err.response?.data?.detail || 'Login failed. Check your credentials or create an account first.');
      }
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
          <span className="text-slate-400 hidden sm:inline">First time visiting?</span>
          <Link to="/register" className="cyber-button px-4 py-2 rounded-lg text-xs flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" />
            <span>CREATE ACCOUNT</span>
          </Link>
        </div>
      </header>

      {/* Threat Anomaly Alert Modal */}
      {status === 'blocked' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0b1329] border-2 border-rose-500 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 animate-pulse"></div>
            
            <div className="flex items-center space-x-4 text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-extrabold text-rose-400">
                  BIOMETRIC ANOMALY DETECTED
                </h2>
                <p className="font-mono text-xs text-slate-400 mt-0.5">UNAUTHORIZED TYPING PATTERN</p>
              </div>
            </div>
            
            <div className="space-y-4 text-slate-300 font-mono text-xs">
              <p className="leading-relaxed bg-slate-950 p-4 rounded-xl border border-white/5">
                Keystroke flight latency and dwell timing deviated significantly from your registered baseline profile. Access attempt terminated.
              </p>
              
              <div className="bg-slate-950 border border-rose-500/20 rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">SIMILARITY MATCH SCORE:</span>
                  <span className="text-rose-400 font-bold font-mono">{(anomaly?.score * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-rose-500" style={{ width: `${anomaly?.score * 100}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>REQUIRED THRESHOLD:</span>
                  <span className="text-emerald-400 font-semibold">{(anomaly?.threshold * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button 
                onClick={() => setStatus('idle')} 
                className="cyber-button w-full py-3 rounded-xl text-xs font-bold"
              >
                RETRY AUTHENTICATION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto glass-panel rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden my-8">
        
        {/* Banner highlighting account creation necessity */}
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3.5 mb-6 text-xs text-slate-300 font-mono flex items-start gap-2.5">
          <UserPlus className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-cyan-400 font-bold block mb-0.5">NEED AN ACCOUNT FIRST?</span>
            To use Portal Login, you must first <Link to="/register" className="text-emerald-400 underline hover:text-emerald-300 font-semibold">Create an Account</Link> to synthesize your 5-sample keystroke baseline.
          </div>
        </div>

        <div className="text-center space-y-3 mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Lock className="w-7 h-7 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
            Portal Login
          </h2>
          <p className="text-slate-400 font-mono text-xs">BEHAVIORAL BIOMETRIC AUTHENTICATION</p>
        </div>

        {error && (
          <div className="p-3.5 mb-6 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl font-mono text-xs text-center space-y-1">
            <div className="font-bold">LOGIN ERROR</div>
            <div>{error}</div>
            <Link to="/register" className="inline-block mt-1 text-emerald-400 underline font-semibold hover:text-emerald-300">
              Create an Account First &rarr;
            </Link>
          </div>
        )}

        {status === 'success' ? (
          <div className="text-center space-y-4 py-8 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-emerald-400">IDENTITY VERIFIED</h3>
            <p className="text-slate-400 font-mono text-xs animate-pulse">ESTABLISHING SECURE SESSION...</p>
          </div>
        ) : status === 'analyzing' ? (
          <div className="space-y-6 py-6 animate-fade-in">
            <div className="flex flex-col items-center justify-center space-y-3 text-cyan-400">
              <Loader className="w-8 h-8 animate-spin" />
              <span className="font-mono text-xs font-bold tracking-wider animate-pulse">ANALYZING KEYSTROKE LATENCY</span>
            </div>
            <TypingVisualizer metrics={metrics} isComplete={false} />
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-cyan-400 w-full animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
            </div>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-300">USERNAME / IDENTIFIER</label>
              <input 
                type="text" 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
                className="cyber-input w-full rounded-xl px-4 py-3 text-sm"
                placeholder="Enter username"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-300">PASSWORD (TYPING SPEED & LATENCY CAPTURED)</label>
              <KeystrokeInput 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                onTypingComplete={handleLogin}
                onRealtimeUpdate={setMetrics}
                placeholder="••••••••"
                className="py-3.5 text-center text-lg rounded-xl"
              />
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-2">
                <span>AUTO-VERIFY ON IDLE</span>
                <span>AES-256 BIOMETRIC GUARD</span>
              </div>
            </div>
          </form>
        )}

        {/* Bottom CTA to Create Account */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs font-mono text-slate-400">
            Don't have an enrolled profile yet?{' '}
            <Link to="/register" className="text-emerald-400 font-bold hover:underline">
              Create Account First &rarr;
            </Link>
          </p>
        </div>

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

export default Login;
