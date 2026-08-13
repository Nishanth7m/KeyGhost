import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000,
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('keyghost_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('keyghost_token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/' && window.location.pathname !== '/demo') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// --- OFFLINE EMULATION MODE (No Backend / Closed Billing Fallback) ---
const initLocalDB = () => {
  if (!localStorage.getItem('kg_db_users')) localStorage.setItem('kg_db_users', JSON.stringify([]));
  if (!localStorage.getItem('kg_db_profiles')) localStorage.setItem('kg_db_profiles', JSON.stringify({}));
  if (!localStorage.getItem('kg_db_logs')) localStorage.setItem('kg_db_logs', JSON.stringify([]));
};

const getLocalDB = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocalDB = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const getLocalUserFromToken = () => {
  const token = localStorage.getItem('keyghost_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) return null;
    const users = getLocalDB('kg_db_users');
    return users.find(u => u.username === payload.username) || null;
  } catch (e) {
    return null;
  }
};

const getSpeed = (events) => {
  if (!events || events.length < 4) return 5;
  const duration = events[events.length - 1].timestamp - events[0].timestamp;
  return events.length / (duration / 1000) || 5;
};

// Simulated mock calls
const mockAuth = {
  register: async (data) => {
    initLocalDB();
    const { username, email, password } = data;
    const users = getLocalDB('kg_db_users');
    
    if (users.find(u => u.username === username || u.email === email)) {
      throw { response: { status: 400, data: { detail: 'Username or email already registered' } } };
    }

    const newUser = {
      id: users.length + 1,
      username,
      email,
      password,
      is_trained: false,
      training_samples_count: 0
    };
    users.push(newUser);
    setLocalDB('kg_db_users', users);

    return {
      data: {
        user_id: newUser.id,
        username: newUser.username,
        message: 'Account created. Please complete biometric training.'
      }
    };
  },

  login: async (data) => {
    initLocalDB();
    const { username, password, keystroke_events } = data;
    const users = getLocalDB('kg_db_users');
    const user = users.find(u => u.username === username);

    if (!user || user.password !== password) {
      throw { response: { status: 401, data: { detail: 'Incorrect username or password' } } };
    }

    const token = btoa(JSON.stringify({ username: user.username, exp: Date.now() + 86400000 }));

    if (!user.is_trained) {
      return {
        data: {
          access_token: token,
          token_type: 'bearer',
          status: 'TRAINING_REQUIRED',
          samples_remaining: Math.max(0, 5 - user.training_samples_count)
        }
      };
    }

    // Trained verification
    const profiles = getLocalDB('kg_db_profiles');
    const profile = profiles[user.id];
    let score = 0.95;
    let verdict = 'MATCH';

    if (!keystroke_events || keystroke_events.length < 4) {
      score = 0.1;
      verdict = 'BLOCKED';
    } else {
      const speed = getSpeed(keystroke_events);
      if (profile && Math.abs(speed - profile.mean_typing_speed) > 5) {
        score = 0.45;
        verdict = 'BLOCKED';
      } else {
        score = 0.85 + (Math.random() * 0.14);
      }
    }

    const logs = getLocalDB('kg_db_logs');
    const newLog = {
      id: logs.length + 1,
      user_id: user.id,
      timestamp: new Date().toISOString(),
      event_type: verdict,
      biometric_score: score,
      confidence: profile ? profile.confidence_threshold : 0.65,
      details: JSON.stringify({ 
        reason: verdict === 'MATCH' ? 'Normal typing pattern' : 'Rhythm mismatch detected', 
        severity: verdict === 'MATCH' ? 'INFO' : 'CRITICAL' 
      })
    };
    logs.push(newLog);
    setLocalDB('kg_db_logs', logs);

    if (verdict === 'MATCH') {
      return {
        data: {
          access_token: token,
          token_type: 'bearer',
          status: 'MATCH'
        }
      };
    } else {
      throw {
        response: {
          status: 403,
          data: {
            detail: {
              message: 'Biometric mismatch',
              score,
              threshold: profile ? profile.confidence_threshold : 0.65,
              anomaly: newLog.details
            }
          }
        }
      };
    }
  },

  submitTrainingSample: async (events) => {
    initLocalDB();
    const user = getLocalUserFromToken();
    if (!user) throw { response: { status: 401, data: { detail: 'Unauthorized' } } };

    if (user.is_trained) {
      return { data: { message: 'Already trained' } };
    }

    const users = getLocalDB('kg_db_users');
    const dbUser = users.find(u => u.id === user.id);
    dbUser.training_samples_count += 1;

    if (dbUser.training_samples_count >= 5) {
      dbUser.is_trained = true;
      const speed = getSpeed(events);
      const profiles = getLocalDB('kg_db_profiles');
      profiles[dbUser.id] = {
        user_id: dbUser.id,
        mean_typing_speed: speed || 5,
        confidence_threshold: 0.65
      };
      setLocalDB('kg_db_profiles', profiles);
    }
    setLocalDB('kg_db_users', users);

    return {
      data: {
        samples_collected: dbUser.training_samples_count,
        samples_needed: 5,
        is_complete: dbUser.is_trained
      }
    };
  },

  getMe: async () => {
    initLocalDB();
    const user = getLocalUserFromToken();
    if (!user) throw { response: { status: 401, data: { detail: 'Unauthorized' } } };
    const { password, ...safeUser } = user;
    return { data: safeUser };
  }
};

const mockDashboard = {
  getStats: async () => {
    initLocalDB();
    const user = getLocalUserFromToken();
    if (!user) throw { response: { status: 401, data: { detail: 'Unauthorized' } } };

    const logs = getLocalDB('kg_db_logs').filter(l => l.user_id === user.id);
    const totalLogins = logs.length;
    const blockedAttempts = logs.filter(l => l.event_type === 'BLOCKED').length;
    const avgScore = totalLogins > 0 
      ? logs.reduce((acc, l) => acc + l.biometric_score, 0) / totalLogins 
      : 0;

    return {
      data: {
        total_logins: totalLogins,
        blocked_attempts: blockedAttempts,
        avg_confidence: avgScore,
        last_login: logs.length > 0 ? logs[logs.length - 1].timestamp : null
      }
    };
  },

  getThreatMap: async () => {
    initLocalDB();
    const user = getLocalUserFromToken();
    if (!user) throw { response: { status: 401, data: { detail: 'Unauthorized' } } };

    const logs = getLocalDB('kg_db_logs')
      .filter(l => l.user_id === user.id)
      .slice(-10);

    return { data: logs };
  },

  retrain: async () => {
    initLocalDB();
    const user = getLocalUserFromToken();
    if (!user) throw { response: { status: 401, data: { detail: 'Unauthorized' } } };

    const users = getLocalDB('kg_db_users');
    const dbUser = users.find(u => u.id === user.id);
    if (dbUser) {
      dbUser.is_trained = false;
      dbUser.training_samples_count = 0;
      setLocalDB('kg_db_users', users);
    }

    const profiles = getLocalDB('kg_db_profiles');
    delete profiles[user.id];
    setLocalDB('kg_db_profiles', profiles);

    return { data: { message: 'Profile reset successfully' } };
  }
};

// Wrapper supporting direct fallback on server offline or specific flag
const withFallback = async (apiCall, mockCall) => {
  const isForceMock = localStorage.getItem('keyghost_use_mock') === 'true';
  if (isForceMock) {
    return mockCall();
  }

  try {
    return await apiCall();
  } catch (err) {
    // Detect network / server down errors (no response, timeout, or bad gateway)
    if (!err.response || err.response.status >= 502 || err.code === 'ERR_NETWORK') {
      console.warn("Real API server is offline/unreachable. Enabling OFFLINE_SECURITY_MODE.");
      localStorage.setItem('keyghost_use_mock', 'true');
      window.dispatchEvent(new Event('keyghost_mode_changed'));
      return mockCall();
    }
    throw err;
  }
};

export const authAPI = {
  register: (data) => withFallback(() => API.post('/api/auth/register', data), () => mockAuth.register(data)),
  login: (data) => withFallback(() => API.post('/api/auth/login', data), () => mockAuth.login(data)),
  submitTrainingSample: (events) => withFallback(() => API.post('/api/auth/training-sample', { keystroke_events: events }), () => mockAuth.submitTrainingSample(events)),
  getMe: () => withFallback(() => API.get('/api/auth/me'), () => mockAuth.getMe()),
};

export const dashboardAPI = {
  getStats: () => withFallback(() => API.get('/api/dashboard/stats'), () => mockDashboard.getStats()),
  getThreatMap: () => withFallback(() => API.get('/api/dashboard/threat-map'), () => mockDashboard.getThreatMap()),
  retrain: () => withFallback(() => API.delete('/api/dashboard/retrain'), () => mockDashboard.retrain()),
};

export default API;
