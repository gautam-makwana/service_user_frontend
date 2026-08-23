'use client';
import { useState, useEffect } from 'react';
import { supabase, BACKEND_URL } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type Booking = {
  id: string; address: string; date: string; time_slot: string; status: string; total_price: number; notes: string; created_at: string;
  booking_services: { service_id: string; services: { name: string; price: number } }[];
  assignments: { status: string; providers: { name: string; phone: string } }[];
};

const STATUS_LABEL: Record<string, string> = { pending: '⏳ Pending', assigned: '👷 Assigned', in_progress: '🔧 In Progress', completed: '✅ Completed', cancelled: '❌ Cancelled' };

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const res = await fetch(`${BACKEND_URL}/api/bookings?user_id=${session.user.id}`);
      const data = await res.json();
      setBookings(data || []);
      setLoading(false);
    })();
  }, [router]);

  const handleCancel = async (id: string) => {
    await fetch(`${BACKEND_URL}/api/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }) });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    setCancelId(null);
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 100% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)' }}>
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}>←</button>
          <span style={{ fontWeight: 700, fontSize: 18 }}>📋 My Bookings</span>
        </div>
        <button className="btn-primary" onClick={() => router.push('/dashboard')} style={{ padding: '8px 16px', fontSize: 13 }}>+ New Booking</button>
      </nav>

      <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 24px' }}>
        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>📋</div>
            <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No bookings yet</p>
            <button className="btn-primary" onClick={() => router.push('/dashboard')} style={{ marginTop: 16 }}>Browse Services</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {bookings.map(booking => {
              const provider = booking.assignments?.[0]?.providers;
              return (
                <div key={booking.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                        {booking.booking_services?.map(bs => bs.services?.name).join(', ')}
                      </p>
                      <p style={{ color: '#94a3b8', fontSize: 13 }}>
                        📅 {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} &nbsp;·&nbsp; 🕐 {booking.time_slot}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className={`badge status-${booking.status}`}>{STATUS_LABEL[booking.status] || booking.status}</span>
                      <span style={{ fontWeight: 700, color: '#818cf8', fontSize: 16 }}>₹{booking.total_price?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                    <p style={{ fontSize: 13, color: '#94a3b8' }}>📍 {booking.address}</p>
                    {booking.notes && <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>📝 {booking.notes}</p>}
                  </div>

                  {/* Provider info */}
                  {provider && (
                    <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', marginBottom: 4 }}>👷 Assigned Provider</p>
                      <p style={{ fontSize: 14 }}>{provider.name} &nbsp;·&nbsp; <span style={{ color: '#94a3b8' }}>{provider.phone}</span></p>
                    </div>
                  )}

                  {/* Status timeline */}
                  <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
                    {['pending', 'assigned', 'in_progress', 'completed'].map((s, i, arr) => {
                      const statuses = ['pending', 'assigned', 'in_progress', 'completed'];
                      const currentIdx = statuses.indexOf(booking.status);
                      const stepIdx = statuses.indexOf(s);
                      const done = stepIdx <= currentIdx;
                      return (
                        <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: done ? '#6366f1' : 'rgba(255,255,255,0.1)', border: done ? '2px solid #6366f1' : '2px solid rgba(255,255,255,0.15)', flexShrink: 0 }} />
                          {i < arr.length - 1 && <div style={{ flex: 1, height: 2, background: done && stepIdx < currentIdx ? '#6366f1' : 'rgba(255,255,255,0.08)' }} />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  {booking.status === 'pending' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {cancelId === booking.id ? (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 13, color: '#94a3b8' }}>Confirm cancel?</span>
                          <button className="btn-danger" onClick={() => handleCancel(booking.id)}>Yes, Cancel</button>
                          <button className="btn-secondary" onClick={() => setCancelId(null)} style={{ padding: '8px 16px', fontSize: 13 }}>No</button>
                        </div>
                      ) : (
                        <button className="btn-danger" onClick={() => setCancelId(booking.id)}>Cancel Booking</button>
                      )}
                    </div>
                  )}

                  <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', marginTop: 12 }}>
                    ID: {booking.id} · Booked on {new Date(booking.created_at).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
