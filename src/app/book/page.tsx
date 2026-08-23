'use client';
import { useState, useEffect, Suspense } from 'react';
import { supabase, BACKEND_URL } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

type Service = { id: string; name: string; category: string; price: number; icon: string };

function BookPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [bookingId, setBookingId] = useState('');

  const serviceIds = params.get('ids')?.split(',') || [];

  useEffect(() => {
    (async () => {
      const res = await fetch(`${BACKEND_URL}/api/services`);
      const all = await res.json();
      setServices((all || []).filter((s: Service) => serviceIds.includes(s.id)));
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPrice = services.reduce((sum, s) => sum + s.price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !date || !timeSlot) { setError('Please fill all required fields'); return; }
    setLoading(true);
    setError('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/login'); return; }

    const res = await fetch(`${BACKEND_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: session.user.id,
        address,
        date,
        time_slot: timeSlot,
        notes,
        total_price: totalPrice,
        service_ids: services.map(s => ({ id: s.id, price: s.price })),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Booking failed'); return; }
    setBookingId(data.id);
    setStep('success');
  };

  if (step === 'success') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass" style={{ padding: 48, textAlign: 'center', maxWidth: 480, margin: '20px' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Booking Confirmed!</h2>
        <p style={{ color: '#94a3b8', marginBottom: 8 }}>Your booking ID:</p>
        <code style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#818cf8', display: 'block', marginBottom: 24, wordBreak: 'break-all' }}>{bookingId}</code>
        <p style={{ color: '#94a3b8', marginBottom: 32, fontSize: 14 }}>Status: <strong style={{ color: '#f59e0b' }}>Pending</strong> — An admin will assign a provider soon.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => router.push('/bookings')}>View My Bookings</button>
          <button className="btn-secondary" onClick={() => router.push('/dashboard')}>Book More</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 70%)' }}>
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 18 }}>Confirm Booking</span>
      </nav>

      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Order Summary */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 18 }}>📋 Order Summary</h3>
          {services.map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 14 }}>{s.name}</span>
              <span style={{ color: '#818cf8', fontWeight: 600 }}>₹{s.price.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(99,102,241,0.3)' }}>
            <span style={{ fontWeight: 700, fontSize: 17 }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: 20, color: '#818cf8' }}>₹{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Booking Form */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 18 }}>📍 Booking Details</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Address *</label>
              <textarea className="input-field" rows={3} value={address} onChange={e => setAddress(e.target.value)} placeholder="Full address with pincode" required style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Date *</label>
              <input className="input-field" type="date" value={date} onChange={e => setDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Time Slot *</label>
              <select className="input-field" value={timeSlot} onChange={e => setTimeSlot(e.target.value)} required>
                <option value="">Select time</option>
                {['8:00 AM – 10:00 AM', '10:00 AM – 12:00 PM', '12:00 PM – 2:00 PM', '2:00 PM – 4:00 PM', '4:00 PM – 6:00 PM'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Notes (Optional)</label>
              <input className="input-field" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything special to mention?" />
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: 12, color: '#ef4444', fontSize: 14 }}>{error}</div>}
            <button className="btn-primary" type="submit" disabled={loading} style={{ padding: '14px', fontSize: 15, marginTop: 8 }}>
              {loading ? 'Creating Booking...' : `Confirm Booking – ₹${totalPrice.toLocaleString()}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return <Suspense><BookPageContent /></Suspense>;
}
