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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex justify-between items-center border-b border-[#00ff88]/20 pb-8">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-[#00ff88] rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,1)]"></div>
              <h1 className="text-4xl font-display font-black tracking-[0.2em] text-[#f0f4ff]">SECURITY_OPERATIONS_CENTER</h1>
            </div>
            <p className="text-[#8892b0] font-mono text-xs tracking-widest">
              OPERATOR: <span className="text-[#00ff88]">{user?.username}</span> | 
              ENCRYPTION: <span className="text-[#00d4ff]">RSA_4096</span> | 
              STATUS: <span className="text-[#00ff88] animate-pulse">PROTECTED</span>
            </p>
          </div>
          <button onClick={logout} className="cyber-button px-6 py-2 rounded text-xs border-[#ff2d55]/30 text-[#ff2d55] hover:bg-[#ff2d55]/10 hover:shadow-[0_0_15px_rgba(255,45,85,0.3)]">
            TERMINATE_SESSION
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="glass-panel p-8 rounded-xl border border-[#1a2035] group hover:border-[#00ff88]/30 transition-all">
            <div className="flex items-center justify-between mb-6">
              <Shield className="w-6 h-6 text-[#00ff88]" />
              <span className="text-[10px] font-mono text-[#8892b0] tracking-widest">TOTAL_LOGINS</span>
            </div>
            <div className="text-5xl font-display font-black text-[#f0f4ff]">{stats?.total_logins || 0}</div>
            <div className="mt-4 h-1 w-full bg-[#030712] rounded-full overflow-hidden">
              <div className="h-full bg-[#00ff88] w-3/4"></div>
            </div>
          </div>
          <div className="glass-panel p-8 rounded-xl border border-[#1a2035] group hover:border-[#ff2d55]/30 transition-all">
            <div className="flex items-center justify-between mb-6">
              <AlertCircle className="w-6 h-6 text-[#ff2d55]" />
              <span className="text-[10px] font-mono text-[#8892b0] tracking-widest">BLOCKED_ATTEMPTS</span>
            </div>
            <div className="text-5xl font-display font-black text-[#ff2d55]">{stats?.blocked_attempts || 0}</div>
            <div className="mt-4 h-1 w-full bg-[#030712] rounded-full overflow-hidden">
              <div className="h-full bg-[#ff2d55] w-1/4"></div>
            </div>
          </div>
          <div className="glass-panel p-8 rounded-xl border border-[#1a2035] group hover:border-[#00d4ff]/30 transition-all">
            <div className="flex items-center justify-between mb-6">
              <Activity className="w-6 h-6 text-[#00d4ff]" />
              <span className="text-[10px] font-mono text-[#8892b0] tracking-widest">AVG_CONFIDENCE</span>
            </div>
            <div className="text-5xl font-display font-black text-[#00d4ff]">{(stats?.avg_confidence * 100 || 0).toFixed(1)}%</div>
            <div className="mt-4 h-1 w-full bg-[#030712] rounded-full overflow-hidden">
              <div className="h-full bg-[#00d4ff]" style={{ width: `${stats?.avg_confidence * 100}%` }}></div>
            </div>
          </div>
          <div className="glass-panel p-8 rounded-xl border border-[#1a2035] group hover:border-[#ffb800]/30 transition-all">
            <div className="flex items-center justify-between mb-6">
              <Clock className="w-6 h-6 text-[#ffb800]" />
              <span className="text-[10px] font-mono text-[#8892b0] tracking-widest">LAST_ACTIVITY</span>
            </div>
            <div className="text-2xl font-display font-black text-[#ffb800] mt-4 uppercase tracking-tighter">
              {stats?.last_login ? new Date(stats.last_login).toLocaleTimeString() : 'N/A'}
            </div>
            <div className="mt-6 text-[10px] font-mono text-[#8892b0]">TIMESTAMP_UTC: {new Date().toISOString().split('T')[0]}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 glass-panel p-10 rounded-2xl border border-[#1a2035]">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-display font-bold tracking-[0.2em] text-[#00ff88]">BIOMETRIC_CONFIDENCE_TREND</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  <span className="text-[10px] font-mono text-[#8892b0]">LIVE_SCORE</span>
                </div>
              </div>
            </div>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={threats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2035" vertical={false} />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis stroke="#4a5568" domain={[0, 1]} tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0f1e', border: '1px solid #00ff88', borderRadius: '8px', fontFamily: 'JetBrains Mono' }}
                    itemStyle={{ color: '#00ff88', fontSize: '12px' }}
                    cursor={{ stroke: '#00ff88', strokeWidth: 1 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="biometric_score" 
                    stroke="#00ff88" 
                    strokeWidth={4} 
                    dot={{ fill: '#00ff88', r: 4, strokeWidth: 2, stroke: '#030712' }}
                    activeDot={{ r: 8, fill: '#00ff88', stroke: '#fff', strokeWidth: 2 }}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-10 rounded-2xl border border-[#1a2035] flex flex-col">
            <h3 className="text-xl font-display font-bold tracking-[0.2em] text-[#ff2d55] mb-8">THREAT_LOGS</h3>
            <div className="flex-1 space-y-6 overflow-y-auto max-h-[450px] pr-4 custom-scrollbar">
              {threats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-30">
                  <Shield className="w-12 h-12" />
                  <p className="font-mono text-xs tracking-widest italic">NO_THREATS_DETECTED</p>
                </div>
              ) : (
                threats.map((threat) => (
                  <div key={threat.id} className={`p-5 rounded border-l-4 ${threat.event_type === 'BLOCKED' ? 'border-[#ff2d55] bg-[#ff2d55]/5' : 'border-[#00ff88] bg-[#00ff88]/5'} transition-all hover:translate-x-1`}>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] font-black font-mono tracking-widest ${threat.event_type === 'BLOCKED' ? 'text-[#ff2d55]' : 'text-[#00ff88]'}`}>
                        [{threat.event_type}]
                      </span>
                      <span className="text-[9px] text-[#8892b0] font-mono">
                        {new Date(threat.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-[#f0f4ff] font-mono mb-2">SCORE: <span className={threat.biometric_score < 0.65 ? 'text-[#ff2d55]' : 'text-[#00ff88]'}>{(threat.biometric_score * 100).toFixed(1)}%</span></div>
                    <div className="text-[10px] text-[#8892b0] font-mono leading-relaxed opacity-80">
                      {JSON.parse(threat.details).reason}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-8 pt-6 border-t border-[#1a2035]">
              <button className="w-full py-3 bg-[#1a2035] text-[#8892b0] font-mono text-[10px] tracking-widest rounded hover:bg-[#00d4ff]/10 hover:text-[#00d4ff] transition-all">
                EXPORT_SECURITY_REPORT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
