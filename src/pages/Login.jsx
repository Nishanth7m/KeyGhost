import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import KeystrokeInput from '../components/biometric/KeystrokeInput';
import TypingVisualizer from '../components/biometric/TypingVisualizer';
import { Lock, AlertTriangle, CheckCircle, Loader } from 'lucide-react';

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
        <div className="fixed inset-0 bg-[#ff2d55]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0a0f1e] border-2 border-[#ff2d55] rounded-2xl p-8 max-w-lg w-full shadow-[0_0_50px_rgba(255,45,85,0.3)] space-y-6">
            <div className="flex items-center space-x-4 text-[#ff2d55]">
              <AlertTriangle className="w-12 h-12 animate-pulse" />
              <div>
                <h2 className="text-3xl font-display font-bold">THREAT DETECTED</h2>
                <p className="font-mono text-sm">BIOMETRIC MISMATCH</p>
              </div>
            </div>
            
            <div className="space-y-4 text-[#8892b0]">
              <p>Typing pattern does not match registered profile. This login attempt has been blocked and logged.</p>
              
              <div className="bg-[#030712] border border-[#1a2035] rounded-lg p-4 font-mono text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Match Score:</span>
                  <span className="text-[#ff2d55]">{(anomaly?.score * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Threshold:</span>
                  <span>{(anomaly?.threshold * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-[#1a2035]">
                  <span>Anomaly:</span>
                  <span className="text-[#ff2d55] font-bold">{JSON.parse(anomaly?.anomaly || '{}').severity || 'CRITICAL'}</span>
                </div>
                <div className="text-xs text-[#8892b0] mt-2">
                  {JSON.parse(anomaly?.anomaly || '{}').reason}
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button onClick={() => setStatus('idle')} className="flex-1 py-3 bg-transparent border border-[#1a2035] text-[#f0f4ff] rounded-lg hover:border-[#ff2d55] transition-colors">
                TRY AGAIN
              </button>
              <button className="flex-1 py-3 bg-[#ff2d55]/10 border border-[#ff2d55]/50 text-[#ff2d55] rounded-lg hover:bg-[#ff2d55]/20 transition-colors">
                REPORT FALSE POSITIVE
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 relative overflow-hidden z-10">
        <div className="text-center space-y-2 mb-8">
          <Lock className="w-12 h-12 text-[#00d4ff] mx-auto mb-4" />
          <h2 className="text-3xl font-display font-bold">SECURE LOGIN</h2>
          <p className="text-[#8892b0] text-sm">Invisible biometric authentication active.</p>
        </div>

        {error && <div className="p-3 mb-6 bg-[#ff2d55]/10 border border-[#ff2d55]/50 text-[#ff2d55] rounded-lg text-sm text-center">{error}</div>}

        {status === 'success' ? (
          <div className="text-center space-y-4 py-8 animate-fade-in">
            <CheckCircle className="w-20 h-20 text-[#00ff88] mx-auto shadow-[0_0_30px_rgba(0,255,136,0.5)] rounded-full" />
            <h3 className="text-2xl font-display font-bold text-[#00ff88]">IDENTITY VERIFIED ✓</h3>
            <p className="text-[#8892b0] font-mono text-sm">Redirecting to dashboard...</p>
          </div>
        ) : status === 'analyzing' ? (
          <div className="space-y-6 py-4 animate-fade-in">
            <div className="flex items-center justify-center space-x-3 text-[#00d4ff]">
              <Loader className="w-6 h-6 animate-spin" />
              <span className="font-mono font-bold tracking-widest">ANALYZING BIOMETRICS...</span>
            </div>
            <TypingVisualizer metrics={metrics} isComplete={false} />
            <div className="h-1 w-full bg-[#030712] rounded-full overflow-hidden">
              <div className="h-full bg-[#00d4ff] w-full animate-[scan_2s_ease-in-out_infinite]"></div>
            </div>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-mono text-[#8892b0] mb-1">USERNAME</label>
              <input 
                type="text" 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
                className="w-full bg-[#030712] border border-[#1a2035] rounded-lg px-4 py-3 focus:outline-none focus:border-[#00d4ff] text-[#f0f4ff]" 
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#8892b0] mb-1">PASSWORD</label>
              <KeystrokeInput 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                onTypingComplete={handleLogin}
                onRealtimeUpdate={setMetrics}
                placeholder="••••••••"
              />
              <p className="text-[10px] text-[#8892b0] font-mono mt-2 text-right">Press Enter or stop typing to submit</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
