import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Demo from './pages/Demo.jsx';
import PageWrapper from './components/layout/PageWrapper.jsx';
import { useAuth } from './context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-accent-green font-mono">INITIALIZING...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen relative overflow-hidden">
        <Routes>
          <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/demo" element={<PageWrapper><Demo /></PageWrapper>} />
          <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
