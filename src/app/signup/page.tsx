'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, phone, role: 'user' })
    });

    const data = await res.json();
    
    if (!res.ok) { 
      setError(data.error || 'Failed to create account'); 
      setLoading(false); 
      return; 
    }

    // Since the API created the user, now we just log them in to establish the session
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)' }}>
      <div className="glass" style={{ width: '100%', maxWidth: 420, padding: '48px', margin: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>✨</div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Create Account</h1>
          <p style={{ color: '#94a3b8', marginTop: 8, fontSize: 14 }}>Start booking home services today</p>
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[['Full Name', 'text', name, setName, 'John Doe'], ['Email', 'email', email, setEmail, 'you@example.com'], ['Phone', 'tel', phone, setPhone, '+91 98765 43210'], ['Password', 'password', password, setPassword, '••••••••']].map(([label, type, value, setter, placeholder]) => (
            <div key={label as string}>
              <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>{label as string}</label>
              <input className="input-field" type={type as string} value={value as string} onChange={e => (setter as (v: string) => void)(e.target.value)} placeholder={placeholder as string} required />
            </div>
          ))}

          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: '#ef4444', fontSize: 14 }}>{error}</div>}

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 8, padding: '14px', fontSize: 15 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#94a3b8' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
