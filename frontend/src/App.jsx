import React, { useState, useEffect } from 'react';
import { auth } from './services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import ChatInterface from './components/ChatInterface';
import AdminDashboard from './components/AdminDashboard';
import './styles/App.css';

const DEMO_MODE = !import.meta.env.VITE_FIREBASE_API_KEY; // Enable demo if Firebase not configured

export default function App() {
  const [user, setUser] = useState(DEMO_MODE ? { email: 'demo@campus.edu', uid: 'demo-user' } : null);
  const [isAdmin, setIsAdmin] = useState(DEMO_MODE);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [userToken, setUserToken] = useState(DEMO_MODE ? 'demo-token' : null);
  const [activeTab, setActiveTab] = useState('chat');
  const [initError, setInitError] = useState('');

  useEffect(() => {
    if (DEMO_MODE) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          const token = await currentUser.getIdToken();
          setUserToken(token);
          
          const claims = (await currentUser.getIdTokenResult()).claims;
          setIsAdmin(claims.admin || false);
        } else {
          setUser(null);
          setUserToken(null);
          setIsAdmin(false);
        }
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      setInitError(error.message);
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (DEMO_MODE) {
      // Demo mode - auto login
      setUser({ email: email || 'demo@campus.edu', uid: 'demo-user' });
      setUserToken('demo-token');
      setIsAdmin(true);
      setEmail('');
      setPassword('');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (DEMO_MODE) {
      // Demo mode - auto signup
      setUser({ email: email || 'demo@campus.edu', uid: 'demo-user' });
      setUserToken('demo-token');
      setIsAdmin(true);
      setEmail('');
      setPassword('');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      if (!DEMO_MODE) {
        await signOut(auth);
      }
      setUser(null);
      setUserToken(null);
      setIsAdmin(false);
      setActiveTab('chat');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (initError) {
    return (
      <div className="auth-container">
        <div className="auth-box" style={{ textAlign: 'center', padding: '40px' }}>
          <h1>⚠️ Configuration Error</h1>
          <p style={{ color: 'red', marginTop: '20px' }}>{initError}</p>
          <p style={{ marginTop: '20px', fontSize: '14px' }}>Please ensure Firebase credentials are properly configured.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h1>🎓 Campus AI Assistant</h1>
          <p>Your 24/7 campus information hub</p>

          {DEMO_MODE && (
            <div style={{ 
              backgroundColor: '#e3f2fd', 
              padding: '12px', 
              borderRadius: '4px', 
              marginBottom: '16px',
              fontSize: '14px',
              color: '#1565c0'
            }}>
              📋 Demo Mode Enabled - Use any credentials to login
            </div>
          )}

          <div className="auth-tabs">
            <button 
              className={`tab ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button 
              className={`tab ${authMode === 'signup' ? 'active' : ''}`}
              onClick={() => setAuthMode('signup')}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={authMode === 'login' ? handleLogin : handleSignUp}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={DEMO_MODE ? "any@email.com" : "your@email.com"}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {authError && <div className="error-message">{authError}</div>}

            <button type="submit" className="btn btn-primary">
              {authMode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <p className="auth-help">
            {authMode === 'login' 
              ? "Don't have an account? Click Sign Up above"
              : "Already have an account? Click Login above"
            }
          </p>

          <div className="demo-info">
            <p>🔐 Firebase authentication required</p>
            <p>👨‍💼 Contact admin@campus.edu for admin access</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>🎓 Campus AI Assistant</h1>
        </div>
        <div className="navbar-menu">
          {isAdmin && (
            <>
              <button 
                className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                💬 Chat
              </button>
              <button 
                className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                📊 Admin
              </button>
            </>
          )}
        </div>
        <div className="navbar-user">
          <span className="user-email">{user.email}</span>
          {isAdmin && <span className="admin-badge">Admin</span>}
          <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="main-content">
        {activeTab === 'chat' ? (
          <ChatInterface userToken={userToken} />
        ) : (
          isAdmin && <AdminDashboard userToken={userToken} />
        )}
      </div>
    </div>
  );
}
