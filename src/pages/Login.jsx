import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const user = await login(email, password);
      if (user.role === 'Reviewer') {
        navigate('/reviewer/dashboard');
      } else {
        navigate('/editor/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', width: '100%',
      justifyContent: 'center', alignItems: 'center', background: 'var(--bg)',
      padding: '20px'
    }}>
      <div className="card anim-scale-in" style={{
        maxWidth: '420px', width: '100%', padding: '40px',
        boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{
            background: 'var(--primary)', color: '#fff', padding: '12px',
            borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', marginBottom: '12px'
          }}>
            <Sparkles size={24} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em' }}>Welcome back</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-3)', marginTop: '6px', textAlign: 'center' }}>
            Enter your credentials to access your Brand Studio
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-light)', color: 'var(--danger)',
            padding: '12px 16px', borderRadius: 'var(--r-md)', fontSize: '13px',
            marginBottom: '20px', fontWeight: 500, border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col gap-16">
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                Forgot?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', padding: '12px', fontWeight: 600 }}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-2)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
