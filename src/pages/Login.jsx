import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import KeystrokeInput from '../components/biometric/KeystrokeInput';
import TypingVisualizer from '../components/biometric/TypingVisualizer';
import { Lock, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import HackerText from '../components/effects/HackerText';

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
        setError(err.response?.data?.detail || 'Login failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {status === 'blocked' && (
        <div className="fixed inset-0 bg-[#ff2d55]/20 backdrop-blur-md z-[1000] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0a0f1e] border-2 border-[#ff2d55] rounded-2xl p-10 max-w-xl w-full shadow-[0_0_100px_rgba(255,45,85,0.5)] space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#ff2d55] animate-pulse"></div>
            <div className="flex items-center space-x-6 text-[#ff2d55]">
              <AlertTriangle className="w-16 h-16 animate-bounce" />
              <div>
                <h2 className="text-4xl font-display font-black tracking-tighter glitch" data-text="THREAT DETECTED">
                  <HackerText text="THREAT DETECTED" speed={50} />
                </h2>
                <p className="font-mono text-xs tracking-[0.3em] opacity-70">BIOMETRIC_SIGNATURE_MISMATCH</p>
              </div>
            </div>
            
            <div className="space-y-6 text-[#8892b0] font-mono text-sm">
              <p className="leading-relaxed border-l-2 border-[#ff2d55] pl-4">Input pattern variance exceeds acceptable security threshold. Access attempt has been terminated and origin logged.</p>
              
              <div className="bg-[#030712] border border-[#ff2d55]/30 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="tracking-widest">MATCH_CONFIDENCE:</span>
                  <span className="text-[#ff2d55] font-bold">{(anomaly?.score * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-1 bg-[#1a2035] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff2d55]" style={{ width: `${anomaly?.score * 100}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="tracking-widest">MIN_THRESHOLD:</span>
                  <span className="text-[#00ff88]">{(anomaly?.threshold * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-[#1a2035] text-xs">
                  <span className="tracking-widest">ANOMALY_TYPE:</span>
                  <span className="text-[#ff2d55] font-bold uppercase">{JSON.parse(anomaly?.anomaly || '{}').severity || 'CRITICAL'}</span>
                </div>
                <div className="text-[10px] text-[#8892b0] leading-tight opacity-60">
                  {JSON.parse(anomaly?.anomaly || '{}').reason}
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button onClick={() => setStatus('idle')} className="flex-1 py-4 bg-transparent border border-[#1a2035] text-[#f0f4ff] font-mono text-xs tracking-widest rounded hover:border-[#ff2d55] transition-colors">
                RETRY_CHALLENGE
              </button>
              <button className="flex-1 py-4 bg-[#ff2d55]/10 border border-[#ff2d55]/50 text-[#ff2d55] font-mono text-xs tracking-widest rounded hover:bg-[#ff2d55]/20 transition-colors">
                REPORT_FALSE_POSITIVE
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md glass-panel rounded-2xl p-10 relative overflow-hidden z-10">
        <div className="text-center space-y-4 mb-10">
          <div className="relative inline-block">
            <Lock className="w-16 h-16 text-[#00d4ff] mx-auto mb-2 drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-[#00d4ff]"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-[#00d4ff]"></div>
          </div>
          <h2 className="text-3xl font-display font-bold tracking-widest text-[#f0f4ff]">
            <HackerText text="SECURE_ACCESS" speed={100} />
          </h2>
          <p className="text-[#8892b0] font-mono text-[10px] tracking-[0.2em]">BEHAVIORAL_VERIFICATION_ACTIVE</p>
        </div>

        {error && <div className="p-4 mb-6 bg-[#ff2d55]/10 border border-[#ff2d55]/30 text-[#ff2d55] rounded font-mono text-xs text-center animate-pulse">ERROR: {error}</div>}

        {status === 'success' ? (
          <div className="text-center space-y-6 py-10 animate-fade-in">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-[#00ff88]/20 rounded-full animate-ping"></div>
              <CheckCircle className="relative z-10 w-full h-full text-[#00ff88] drop-shadow-[0_0_20px_rgba(0,255,136,0.5)]" />
            </div>
            <h3 className="text-2xl font-display font-black tracking-widest text-[#00ff88]">IDENTITY_VERIFIED</h3>
            <p className="text-[#8892b0] font-mono text-xs tracking-[0.2em] animate-pulse">ESTABLISHING_SESSION...</p>
          </div>
        ) : status === 'analyzing' ? (
          <div className="space-y-8 py-6 animate-fade-in">
            <div className="flex flex-col items-center justify-center space-y-4 text-[#00d4ff]">
              <Loader className="w-10 h-10 animate-spin" />
              <span className="font-mono text-xs font-bold tracking-[0.4em] animate-pulse">ANALYZING_BIOMETRICS</span>
            </div>
            <TypingVisualizer metrics={metrics} isComplete={false} />
            <div className="h-1 w-full bg-[#030712] rounded-full overflow-hidden border border-[#1a2035]">
              <div className="h-full bg-[#00d4ff] w-full animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(0,212,255,0.5)]"></div>
            </div>
          </div>
        ) : (
          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-[#00d4ff] tracking-widest">IDENTIFIER</label>
              <input 
                type="text" 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
                className="cyber-input w-full rounded px-4 py-3 text-sm"
                placeholder="root"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-mono text-[#00d4ff] tracking-widest">ACCESS_KEY</label>
              <KeystrokeInput 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                onTypingComplete={handleLogin}
                onRealtimeUpdate={setMetrics}
                placeholder="••••••••"
                className="py-4 tracking-[0.3em]"
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-[9px] font-mono text-[#8892b0] tracking-widest">AUTO_SUBMIT: ON_IDLE</span>
                <span className="text-[9px] font-mono text-[#8892b0] tracking-widest">ENCRYPTION: AES-256</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
