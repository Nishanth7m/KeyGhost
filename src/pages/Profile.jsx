import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../lib/api';
import { User, Mail, Shield, RefreshCw, Trash2, AlertTriangle, ArrowLeft, LogOut, CheckCircle2 } from 'lucide-react';
import MatrixLogo from '../components/effects/MatrixLogo';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isResetting, setIsResetting] = useState(false);

  const handleRetrain = async () => {
    if (!window.confirm('This will delete your current typing fingerprint. You will need to complete the 5-step training again. Continue?')) return;
    
    setIsResetting(true);
    try {
      await dashboardAPI.retrain();
      navigate('/register');
    } catch (err) {
      alert('Failed to reset profile');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans p-6 md:p-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl glass-panel rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center gap-2">
              <MatrixLogo text="KEYGHOST" fontSize={20} />
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-mono text-slate-400">USER PROFILE</span>
          </div>

          <Link to="/dashboard" className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> BACK TO DASHBOARD
          </Link>
        </div>

        {/* User Card */}
        <div className="flex items-center space-x-5 bg-slate-950/60 p-6 rounded-2xl border border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-display font-bold text-xl shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">{user?.username || 'Security User'}</h1>
            <p className="text-slate-400 font-mono text-xs flex items-center space-x-2 mt-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{user?.email || 'user@keyghost.io'}</span>
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xs font-mono tracking-wider text-slate-400">SECURITY & PROTECTION</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-white/5">
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono text-slate-300">Biometric Guard</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </span>
              </div>

              <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-white/5">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono text-slate-300">Training Fingerprint</span>
                </div>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
                  5/5 SAMPLES
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-mono tracking-wider text-rose-400">DANGER ZONE</h3>
            <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-4">
              <div className="flex items-start space-x-3 text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed text-slate-400">Resetting deletes your keystroke baseline. You will need to re-type 5 training samples.</p>
              </div>
              <button 
                onClick={handleRetrain}
                disabled={isResetting}
                className="w-full py-2.5 bg-rose-500/10 border border-rose-500/40 text-rose-300 rounded-lg hover:bg-rose-500/20 transition-all font-mono font-semibold text-xs flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isResetting ? 'RESETTING...' : 'RESET FINGERPRINT'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-white/5 flex justify-between items-center font-mono text-xs">
          <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            ← SOC Dashboard
          </Link>
          <button onClick={logout} className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 font-semibold">
            <LogOut className="w-3.5 h-3.5" /> LOGOUT
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;
