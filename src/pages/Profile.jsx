import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../lib/api';
import { User, Mail, Shield, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';

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
    <div className="min-h-screen bg-[#030712] p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl glass-panel rounded-2xl p-8 border border-[#1a2035]">
        <div className="flex items-center space-x-6 mb-12">
          <div className="w-24 h-24 bg-[#0a0f1e] border-2 border-[#00d4ff] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.3)]">
            <User className="w-12 h-12 text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-[#f0f4ff] uppercase tracking-wider">{user?.username}</h1>
            <p className="text-[#8892b0] font-mono text-sm flex items-center space-x-2">
              <Mail className="w-3 h-3" />
              <span>{user?.email}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-sm font-mono text-[#8892b0] border-b border-[#1a2035] pb-2">SECURITY STATUS</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-[#030712] p-4 rounded-lg border border-[#1a2035]">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-[#00ff88]" />
                  <span className="text-sm font-mono">Biometric Protection</span>
                </div>
                <span className="text-xs font-bold text-[#00ff88] bg-[#00ff88]/10 px-2 py-1 rounded">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center bg-[#030712] p-4 rounded-lg border border-[#1a2035]">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="w-5 h-5 text-[#00d4ff]" />
                  <span className="text-sm font-mono">Training Status</span>
                </div>
                <span className="text-xs font-bold text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-1 rounded">COMPLETE</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-mono text-[#8892b0] border-b border-[#1a2035] pb-2">DANGER ZONE</h3>
            <div className="p-6 bg-[#ff2d55]/5 border border-[#ff2d55]/20 rounded-xl space-y-4">
              <div className="flex items-start space-x-3 text-[#ff2d55]">
                <AlertTriangle className="w-5 h-5 mt-0.5" />
                <p className="text-xs leading-relaxed">Resetting your biometric profile will temporarily disable invisible authentication until you complete a new training session.</p>
              </div>
              <button 
                onClick={handleRetrain}
                disabled={isResetting}
                className="w-full py-3 bg-[#ff2d55]/10 border border-[#ff2d55]/50 text-[#ff2d55] rounded-lg hover:bg-[#ff2d55]/20 transition-all font-bold text-xs flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isResetting ? 'RESETTING...' : 'RESET BIOMETRIC PROFILE'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#1a2035] flex justify-between">
          <button onClick={() => navigate('/dashboard')} className="text-[#8892b0] hover:text-[#f0f4ff] transition-colors font-mono text-xs">
            &larr; BACK TO SOC
          </button>
          <button onClick={logout} className="text-[#ff2d55] hover:underline font-mono text-xs">
            LOGOUT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
