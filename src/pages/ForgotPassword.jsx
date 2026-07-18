import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
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
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.02em' }}>Reset Password</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-3)', marginTop: '6px', textAlign: 'center' }}>
            We'll send you link instructions to reset your password
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: 'var(--success-light)', color: 'var(--success)',
              padding: '16px', borderRadius: 'var(--r-md)', fontSize: '13.5px',
              marginBottom: '24px', fontWeight: 500, border: '1px solid #bbf7d0'
            }}>
              If that email exists in our system, we have sent a reset password link to <strong>{email}</strong>.
            </div>
            <Link to="/login" className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}>
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px', padding: '12px', fontWeight: 600 }}
            >
              Send Reset Link
            </button>

            <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13.5px', color: 'var(--text-2)', textDecoration: 'none', marginTop: '12px', fontWeight: 500 }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
