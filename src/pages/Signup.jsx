import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Editor');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const user = await signup(name, email, password, role);
      if (user.role === 'Reviewer') {
        navigate('/reviewer/dashboard');
      } else {
        navigate('/editor/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', width: '100%',
      justifyContent: 'center', alignItems: 'center', background: 'var(--bg)',
      padding: '20px'
    }}>
      <div className="card anim-scale-in" style={{
        maxWidth: '460px', width: '100%', padding: '40px',
        boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{
            background: 'var(--primary)', color: '#fff', padding: '12px',
            borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', marginBottom: '12px'
          }}>
            <Sparkles size={24} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em' }}>Create account</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-3)', marginTop: '6px', textAlign: 'center' }}>
            Get started by creating your workspace profile
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
            <label className="form-label" style={{ fontWeight: 600 }}>Full Name</label>
            <input
              type="text"
              className="input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Workspace Role</label>
            <div className="flex gap-12" style={{ marginTop: '4px' }}>
              <label style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '12px', borderRadius: 'var(--r-md)', border: `2px solid ${role === 'Editor' ? 'var(--primary)' : 'var(--border)'}`,
                background: role === 'Editor' ? 'var(--primary-light)' : 'var(--surface)',
                cursor: 'pointer', fontWeight: 600, fontSize: '13.5px', color: role === 'Editor' ? 'var(--primary)' : 'var(--text-2)',
                transition: '.15s'
              }}>
                <input
                  type="radio"
                  name="role"
                  value="Editor"
                  checked={role === 'Editor'}
                  onChange={() => setRole('Editor')}
                  style={{ display: 'none' }}
                />
                Editor
              </label>
              <label style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '12px', borderRadius: 'var(--r-md)', border: `2px solid ${role === 'Reviewer' ? 'var(--primary)' : 'var(--border)'}`,
                background: role === 'Reviewer' ? 'var(--primary-light)' : 'var(--surface)',
                cursor: 'pointer', fontWeight: 600, fontSize: '13.5px', color: role === 'Reviewer' ? 'var(--primary)' : 'var(--text-2)',
                transition: '.15s'
              }}>
                <input
                  type="radio"
                  name="role"
                  value="Reviewer"
                  checked={role === 'Reviewer'}
                  onChange={() => setRole('Reviewer')}
                  style={{ display: 'none' }}
                />
                Reviewer
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="At least 8 characters"
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

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>Confirm Password</label>
            <input
              type="password"
              className="input"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', padding: '12px', fontWeight: 600 }}
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13.5px', color: 'var(--text-2)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
