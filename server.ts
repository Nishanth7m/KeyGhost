import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// In-memory Database
const users = [];
const profiles = {};
const logs = [];

// Helper to generate a simple token
const generateToken = (username) => Buffer.from(JSON.stringify({ username, exp: Date.now() + 86400000 })).toString('base64');

// Helper to get user from token
const getUserFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split(' ')[1];
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (payload.exp < Date.now()) return null;
    return users.find(u => u.username === payload.username);
  } catch (e) {
    return null;
  }
};

// --- API Routes ---

app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (users.find(u => u.username === username || u.email === email)) {
    return res.status(400).json({ detail: 'Username or email already registered' });
  }
  
  const newUser = {
    id: users.length + 1,
    username,
    email,
    password, // Storing plain text for demo purposes only
    is_trained: false,
    training_samples_count: 0
  };
  users.push(newUser);
  
  res.json({ user_id: newUser.id, username: newUser.username, message: 'Account created. Please complete biometric training.' });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password, keystroke_events } = req.body;
  const user = users.find(u => u.username === username);
  
  if (!user || user.password !== password) {
    return res.status(401).json({ detail: 'Incorrect username or password' });
  }
  
  if (!user.is_trained) {
    return res.json({
      access_token: generateToken(user.username),
      token_type: 'bearer',
      status: 'TRAINING_REQUIRED',
      samples_remaining: Math.max(0, 5 - user.training_samples_count)
    });
  }
  
  // User is trained, verify biometrics
  const profile = profiles[user.id];
  if (!profile) {
    return res.status(500).json({ detail: 'Profile missing' });
  }
  
  // Simple mock biometric verification based on keystroke length/timing
  // In a real app, this would use the KeystrokeAnalyzer logic
  let score = 0.95; // Default to match
  let verdict = 'MATCH';
  
  // If no events provided or very few, it's suspicious
  if (!keystroke_events || keystroke_events.length < 4) {
    score = 0.1;
    verdict = 'BLOCKED';
  } else {
    // Basic mock check: compare typing speed roughly
    const duration = keystroke_events[keystroke_events.length - 1].timestamp - keystroke_events[0].timestamp;
    const speed = keystroke_events.length / (duration / 1000);
    
    // If speed is drastically different from profile (mock logic)
    if (Math.abs(speed - profile.mean_typing_speed) > 5) {
      score = 0.45;
      verdict = 'BLOCKED';
    } else {
      // Add some randomness to score between 0.85 and 0.99
      score = 0.85 + (Math.random() * 0.14);
    }
  }
  
  const log = {
    id: logs.length + 1,
    user_id: user.id,
    timestamp: new Date().toISOString(),
    event_type: verdict,
    biometric_score: score,
    confidence: profile.confidence_threshold,
    details: JSON.stringify({ reason: verdict === 'MATCH' ? 'Normal typing pattern' : 'Rhythm mismatch detected', severity: verdict === 'MATCH' ? 'INFO' : 'CRITICAL' })
  };
  logs.push(log);
  
  if (verdict === 'MATCH') {
    return res.json({ access_token: generateToken(user.username), token_type: 'bearer', status: 'MATCH' });
  } else {
    return res.status(403).json({ 
      detail: { 
        message: 'Biometric mismatch', 
        score, 
        threshold: profile.confidence_threshold, 
        anomaly: log.details 
      } 
    });
  }
});

app.post('/api/auth/training-sample', (req, res) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ detail: 'Unauthorized' });
  
  if (user.is_trained) {
    return res.json({ message: 'Already trained' });
  }
  
  const { keystroke_events } = req.body;
  user.training_samples_count += 1;
  
  if (user.training_samples_count >= 5) {
    user.is_trained = true;
    
    // Create mock profile
    const duration = keystroke_events[keystroke_events.length - 1].timestamp - keystroke_events[0].timestamp;
    const speed = keystroke_events.length / (duration / 1000);
    
    profiles[user.id] = {
      user_id: user.id,
      mean_typing_speed: speed || 5,
      confidence_threshold: 0.65
    };
  }
  
  res.json({ 
    samples_collected: user.training_samples_count, 
    samples_needed: 5, 
    is_complete: user.is_trained 
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ detail: 'Unauthorized' });
  
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

app.get('/api/dashboard/stats', (req, res) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ detail: 'Unauthorized' });
  
  const userLogs = logs.filter(l => l.user_id === user.id);
  const totalLogins = userLogs.length;
  const blockedAttempts = userLogs.filter(l => l.event_type === 'BLOCKED').length;
  const avgScore = totalLogins > 0 
    ? userLogs.reduce((acc, l) => acc + l.biometric_score, 0) / totalLogins 
    : 0;
    
  res.json({
    total_logins: totalLogins,
    blocked_attempts: blockedAttempts,
    avg_confidence: avgScore,
    last_login: userLogs.length > 0 ? userLogs[userLogs.length - 1].timestamp : null
  });
});

app.get('/api/dashboard/threat-map', (req, res) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ detail: 'Unauthorized' });
  
  const userLogs = logs.filter(l => l.user_id === user.id).slice(-10);
  res.json(userLogs);
});

app.delete('/api/dashboard/retrain', (req, res) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ detail: 'Unauthorized' });
  
  user.is_trained = false;
  user.training_samples_count = 0;
  delete profiles[user.id];
  
  res.json({ message: 'Profile reset successfully' });
});

// --- Vite Middleware Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
