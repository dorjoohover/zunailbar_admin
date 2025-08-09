'use client';

export default function Page() {
  const connect = () => (window.location.href = '/api/google/auth');

  const create = async () => {
    const now = new Date();
    // Монголын цаг: +08:00
    const startISO = new Date(now.getTime() + 60*60*1000).toISOString().replace('Z', '+08:00');
    const endISO   = new Date(now.getTime() + 2*60*60*1000).toISOString().replace('Z', '+08:00');

    const res = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: 'Test booking – Salon',
        description: 'Demo from Next.js',
        startISO, endISO,
        colorId: '7', // Google-ийн өнгө ID
        meta: { source: 'next-demo', appointmentId: 'demo123' }
      }),
    });
    alert(res.ok ? 'Event created!' : await res.text());
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Google Calendar – Demo</h1>
      <p>1) Connect → 2) Create Event</p>
      <div style={{ display:'flex', gap:12 }}>
        <button onClick={connect}>Connect Google Calendar</button>
        <button onClick={create}>Create Test Event</button>
      </div>
    </div>
  );
}