'use client';
import { useState, useEffect } from 'react';
import { supabase, BACKEND_URL } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ICON_MAP: Record<string, string> = { sparkles: '✨', wind: '❄️', droplets: '🚿', zap: '⚡', shield: '🛡️', paintbrush: '🎨', hammer: '🔨', wrench: '🔧' };

type Service = { id: string; name: string; category: string; description: string; price: number; icon: string };
type CartItem = Service;

export default function UserDashboard() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data: userData } = await supabase.from('users').select('id, name').eq('id', session.user.id).single();
      setUser(userData);
      const res = await fetch(`${BACKEND_URL}/api/services`);
      const data = await res.json();
      setServices(data || []);
      setLoading(false);
    })();
  }, [router]);

  const categories = ['All', ...Array.from(new Set(services.map(s => s.category)))];
  const filtered = services.filter(s => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleCart = (service: Service) => {
    setCart(prev => prev.find(c => c.id === service.id) ? prev.filter(c => c.id !== service.id) : [...prev, service]);
  };

  const totalPrice = cart.reduce((sum, c) => sum + c.price, 0);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚙️</div>
        <p>Loading services...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 0% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)' }}>
      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🔧</span>
          <span style={{ fontWeight: 800, fontSize: 18, background: 'linear-gradient(135deg, #818cf8, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ServicePro</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#94a3b8', fontSize: 14 }}>Hi, {user?.name || 'User'} 👋</span>
          <Link href="/bookings"><button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>📋 My Bookings</button></Link>
          <button className="btn-secondary" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: 13 }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
            Book <span style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Home Services</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 16 }}>Expert professionals at your doorstep. Select services below.</p>
        </div>

        {/* Search */}
        <div style={{ maxWidth: 500, margin: '0 auto 32px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
          <input className="input-field" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services..." style={{ paddingLeft: 48 }} />
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32, justifyContent: 'center' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '8px 20px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.2s', background: activeCategory === cat ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255,255,255,0.06)', color: activeCategory === cat ? 'white' : '#94a3b8' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 48 }}>
          {filtered.map(service => {
            const inCart = cart.find(c => c.id === service.id);
            return (
              <div key={service.id} className="card" style={{ position: 'relative', cursor: 'pointer', border: inCart ? '1px solid rgba(99,102,241,0.5)' : undefined }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(79,70,229,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    {ICON_MAP[service.icon] || '🔧'}
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: 999 }}>{service.category}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{service.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>{service.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 18, color: '#818cf8' }}>₹{service.price.toLocaleString()}</span>
                  <button onClick={() => toggleCart(service)} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', background: inCart ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)', color: inCart ? '#ef4444' : '#818cf8' }}>
                    {inCart ? '✕ Remove' : '+ Add'}
                  </button>
                </div>
                {inCart && <div style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontSize: 18 }}>No services found</p>
          </div>
        )}
      </div>

      {/* Cart floating bar */}
      {cart.length > 0 && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'rgba(15,15,26,0.95)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 16, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 24, backdropFilter: 'blur(20px)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)', zIndex: 100, minWidth: 400 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{cart.length} service{cart.length > 1 ? 's' : ''} selected</div>
            <div style={{ color: '#94a3b8', fontSize: 13 }}>Total: ₹{totalPrice.toLocaleString()}</div>
          </div>
          <button className="btn-primary" onClick={() => router.push(`/book?ids=${cart.map(c => c.id).join(',')}`)} style={{ padding: '12px 28px', fontSize: 15, whiteSpace: 'nowrap' }}>
            Book Now →
          </button>
        </div>
      )}
    </div>
  );
}
