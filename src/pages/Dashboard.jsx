import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Activity, Shield, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, threatsRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getThreatMap()
        ]);
        setStats(statsRes.data);
        setThreats(threatsRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#00ff88] font-mono">LOADING SECURE DATA...</div>;

  return (
    <div className="min-h-screen bg-[#030712] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-[#f0f4ff]">SECURITY OPERATIONS CENTER</h1>
            <p className="text-[#8892b0] font-mono text-sm">Welcome back, {user?.username} | Status: <span className="text-[#00ff88]">PROTECTED</span></p>
          </div>
          <button onClick={logout} className="px-4 py-2 border border-[#ff2d55]/50 text-[#ff2d55] rounded-lg hover:bg-[#ff2d55]/10 transition-colors font-mono text-xs">
            TERMINATE SESSION
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-xl border border-[#1a2035]">
            <div className="flex items-center space-x-3 text-[#00ff88] mb-4">
              <Shield className="w-5 h-5" />
              <span className="text-xs font-mono">TOTAL LOGINS</span>
            </div>
            <div className="text-4xl font-display font-bold">{stats?.total_logins || 0}</div>
          </div>
          <div className="glass-panel p-6 rounded-xl border border-[#1a2035]">
            <div className="flex items-center space-x-3 text-[#ff2d55] mb-4">
              <AlertCircle className="w-5 h-5" />
              <span className="text-xs font-mono">BLOCKED ATTEMPTS</span>
            </div>
            <div className="text-4xl font-display font-bold">{stats?.blocked_attempts || 0}</div>
          </div>
          <div className="glass-panel p-6 rounded-xl border border-[#1a2035]">
            <div className="flex items-center space-x-3 text-[#00d4ff] mb-4">
              <Activity className="w-5 h-5" />
              <span className="text-xs font-mono">AVG CONFIDENCE</span>
            </div>
            <div className="text-4xl font-display font-bold">{(stats?.avg_confidence * 100 || 0).toFixed(1)}%</div>
          </div>
          <div className="glass-panel p-6 rounded-xl border border-[#1a2035]">
            <div className="flex items-center space-x-3 text-[#ffb800] mb-4">
              <Clock className="w-5 h-5" />
              <span className="text-xs font-mono">LAST ACTIVITY</span>
            </div>
            <div className="text-sm font-mono">{stats?.last_login ? new Date(stats.last_login).toLocaleTimeString() : 'N/A'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-[#1a2035]">
            <h3 className="text-xl font-display font-bold mb-6">BIOMETRIC CONFIDENCE TREND</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={threats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2035" />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis stroke="#8892b0" domain={[0, 1]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0f1e', border: '1px solid #1a2035' }}
                    itemStyle={{ color: '#00ff88' }}
                  />
                  <Line type="monotone" dataKey="biometric_score" stroke="#00ff88" strokeWidth={3} dot={{ fill: '#00ff88' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-[#1a2035]">
            <h3 className="text-xl font-display font-bold mb-6">RECENT EVENTS</h3>
            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
              {threats.length === 0 ? (
                <p className="text-[#8892b0] text-center py-8 font-mono text-sm italic">No recent events recorded.</p>
              ) : (
                threats.map((threat) => (
                  <div key={threat.id} className={`p-4 rounded-lg border ${threat.event_type === 'BLOCKED' ? 'border-[#ff2d55]/30 bg-[#ff2d55]/5' : 'border-[#00ff88]/30 bg-[#00ff88]/5'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold font-mono ${threat.event_type === 'BLOCKED' ? 'text-[#ff2d55]' : 'text-[#00ff88]'}`}>
                        {threat.event_type}
                      </span>
                      <span className="text-[10px] text-[#8892b0] font-mono">
                        {new Date(threat.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-[#f0f4ff] font-mono mb-1">Score: {(threat.biometric_score * 100).toFixed(1)}%</div>
                    <div className="text-[10px] text-[#8892b0]">{JSON.parse(threat.details).reason}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
