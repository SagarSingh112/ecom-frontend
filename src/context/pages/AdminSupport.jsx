import React, { useState, useEffect, useRef } from 'react';

const API = 'https://ecom-backend-16sc.onrender.com/api';
const STATUS_COLOR = { Open:'#fdd34d', 'In Progress':'#60a5fa', Resolved:'#84fab0', Closed:'rgba(255,255,255,0.3)' };
const STATUSES     = ['Open','In Progress','Resolved','Closed'];

export default function AdminSupport() {
  const token = localStorage.getItem('token');

  const [tickets,    setTickets]    = useState([]);
  const [active,     setActive]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [replyText,  setReplyText]  = useState('');
  const [newStatus,  setNewStatus]  = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter,     setFilter]     = useState('All');
  const [search,     setSearch]     = useState('');
  const [toast,      setToast]      = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { fetchTickets(); const t = setInterval(fetchTickets, 15000); return () => clearInterval(t); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [active]);

  const fetchTickets = async () => {
    try {
      const data = await (await fetch(`${API}/support/all`, { headers:{'x-auth-token':token} })).json();
      const arr  = Array.isArray(data) ? data : [];
      setTickets(arr);
      if (active) { const r = arr.find(t => t._id === active._id); if (r) setActive(r); }
    } catch {}
    setLoading(false);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res  = await fetch(`${API}/support/${active._id}/admin-reply`, {
        method:'POST', headers:{'Content-Type':'application/json','x-auth-token':token},
        body: JSON.stringify({ message: replyText, status: newStatus || active.status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setActive(data); setReplyText('');
      showToast('✅ Reply sent!');
      fetchTickets();
    } catch(e) { showToast('❌ ' + e.message); }
    setSubmitting(false);
  };

  const changeStatus = async (id, status) => {
    try {
      const res  = await fetch(`${API}/support/${id}/status`, { method:'PUT', headers:{'Content-Type':'application/json','x-auth-token':token}, body:JSON.stringify({ status }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setActive(data); fetchTickets();
      showToast(`✅ Status → ${status}`);
    } catch(e) { showToast('❌ ' + e.message); }
  };

  const open       = tickets.filter(t => t.status === 'Open').length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  const resolved   = tickets.filter(t => t.status === 'Resolved').length;

  const filtered = tickets
    .filter(t => filter === 'All' || t.status === filter)
    .filter(t => !search || t.subject?.toLowerCase().includes(search.toLowerCase()) || t.userName?.toLowerCase().includes(search.toLowerCase()) || t.userEmail?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ fontFamily:'Poppins,sans-serif', color:'#fff' }}>

      {toast && <div style={{ position:'fixed', top:70, right:20, background:'rgba(132,250,176,0.15)', border:'1px solid #84fab0', borderRadius:10, padding:'11px 18px', color:'#84fab0', fontWeight:600, zIndex:999 }}>{toast}</div>}

      <h2 style={{ margin:'0 0 16px', fontSize:19, fontWeight:700 }}>🎧 Support Tickets</h2>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:18 }}>
        {[['📬 Open', open, '#fdd34d'],['⚙️ In Progress', inProgress, '#60a5fa'],['✅ Resolved', resolved, '#84fab0'],['📋 Total', tickets.length, '#a78bfa']].map(([l,v,c]) => (
          <div key={l} style={{ background:'rgba(255,255,255,0.06)', borderRadius:12, padding:'14px 16px', border:'1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ margin:'0 0 4px', fontSize:12, color:'rgba(255,255,255,0.5)' }}>{l}</p>
            <p style={{ margin:0, fontSize:24, fontWeight:700, color:c }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        {['All','Open','In Progress','Resolved','Closed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding:'6px 14px', border:'none', borderRadius:20, cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:600, background:filter===f?'linear-gradient(135deg,#a8e6cf,#d4a5a5)':'rgba(255,255,255,0.08)', color:filter===f?'#1a1a2e':'#fff' }}>
            {f}
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name / email / subject"
          style={{ flex:1, minWidth:180, padding:'6px 12px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:20, color:'#fff', fontFamily:'Poppins,sans-serif', fontSize:12, outline:'none' }} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns: active ? '1fr 1.5fr' : '1fr', gap:16 }}>

        {/* Ticket list */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, maxHeight:560, overflowY:'auto' }}>
          {loading ? <p style={{ color:'rgba(255,255,255,0.4)', textAlign:'center', padding:30 }}>⏳ Loading...</p>
          : filtered.length === 0 ? <p style={{ color:'rgba(255,255,255,0.4)', textAlign:'center', padding:30 }}>No tickets found.</p>
          : filtered.map(t => (
            <div key={t._id} onClick={() => { setActive(t); setReplyText(''); setNewStatus(t.status); }}
              style={{ background: active?._id===t._id ? 'rgba(168,230,207,0.08)' : 'rgba(255,255,255,0.05)', borderRadius:12, padding:'14px 16px', cursor:'pointer', border:`1px solid ${active?._id===t._id?'rgba(168,230,207,0.3)':'rgba(255,255,255,0.08)'}`, transition:'all .18s' }}>

              {/* User info row */}
              <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:8 }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#a8e6cf,#d4a5a5)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, color:'#1a1a2e', flexShrink:0 }}>
                  {t.userName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontWeight:700, fontSize:13 }}>{t.userName}</p>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    <span style={{ fontSize:11, color:'rgba(255,255,255,0.45)', display:'flex', alignItems:'center', gap:3 }}>📧 {t.userEmail}</span>
                    <span style={{ fontSize:11, color:'rgba(255,255,255,0.45)', display:'flex', alignItems:'center', gap:3 }}>📱 {t.userPhone || 'N/A'}</span>
                  </div>
                </div>
                <span style={{ background:`${STATUS_COLOR[t.status]}18`, border:`1px solid ${STATUS_COLOR[t.status]}`, color:STATUS_COLOR[t.status], borderRadius:20, padding:'2px 9px', fontSize:10, fontWeight:700, flexShrink:0 }}>{t.status}</span>
              </div>

              <p style={{ margin:'0 0 5px', fontWeight:600, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.subject}</p>

              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:10, background:'rgba(255,255,255,0.07)', borderRadius:5, padding:'2px 7px', color:'rgba(255,255,255,0.5)' }}>{t.category}</span>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>
                  {t.replies?.length} msg{t.replies?.length!==1?'s':''} · {new Date(t.updatedAt).toLocaleDateString('en-IN')}
                </span>
              </div>

              {/* Last message preview */}
              {t.replies?.length > 0 && (
                <p style={{ margin:'8px 0 0', fontSize:11, color:'rgba(255,255,255,0.35)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  💬 {t.replies[t.replies.length-1].message}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Chat panel */}
        {active && (
          <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:16, border:'1px solid rgba(255,255,255,0.1)', display:'flex', flexDirection:'column', maxHeight:560 }}>

            {/* Chat header with user details */}
            <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div>
                  <p style={{ margin:0, fontWeight:700, fontSize:14 }}>{active.subject}</p>
                  <p style={{ margin:'2px 0 0', fontSize:11, color:'rgba(255,255,255,0.4)' }}>#{active._id.slice(-6).toUpperCase()} · {active.category}</p>
                </div>
                <button onClick={() => setActive(null)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:18, padding:0 }}>✕</button>
              </div>

              {/* User contact card */}
              <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:10, padding:'10px 14px', display:'flex', gap:16, flexWrap:'wrap' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#a8e6cf,#d4a5a5)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#1a1a2e', fontSize:13, flexShrink:0 }}>
                    {active.userName?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ fontWeight:700, fontSize:13 }}>{active.userName}</span>
                </div>
                <div style={{ display:'flex', gap:14, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.6)', display:'flex', alignItems:'center', gap:5 }}>📧 <b style={{ color:'#fff' }}>{active.userEmail}</b></span>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.6)', display:'flex', alignItems:'center', gap:5 }}>📱 <b style={{ color:'#fff' }}>{active.userPhone || 'Not provided'}</b></span>
                </div>
              </div>

              {/* Status changer */}
              <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)', alignSelf:'center' }}>Status:</span>
                {STATUSES.map(s => (
                  <button key={s} onClick={() => changeStatus(active._id, s)}
                    style={{ padding:'4px 11px', border:`1px solid ${STATUS_COLOR[s]}`, borderRadius:20, background: active.status===s ? `${STATUS_COLOR[s]}22` : 'transparent', color:STATUS_COLOR[s], fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'Poppins,sans-serif', transition:'all .15s' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:10 }}>
              {active.replies?.map((r, i) => (
                <div key={i} style={{ display:'flex', justifyContent: r.sender==='admin' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth:'78%', padding:'10px 14px',
                    borderRadius: r.sender==='admin' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: r.sender==='admin' ? 'linear-gradient(135deg,rgba(168,230,207,0.15),rgba(132,250,176,0.1))' : 'rgba(96,165,250,0.1)',
                    border: `1px solid ${r.sender==='admin' ? 'rgba(168,230,207,0.25)' : 'rgba(96,165,250,0.2)'}` }}>
                    <p style={{ margin:0, fontSize:11, fontWeight:700, color: r.sender==='admin' ? '#a8e6cf' : '#60a5fa', marginBottom:4 }}>
                      {r.sender==='admin' ? '🛡️ Support Team' : `👤 ${active.userName}`}
                    </p>
                    <p style={{ margin:0, fontSize:13, lineHeight:1.55, color:'rgba(255,255,255,0.9)' }}>{r.message}</p>
                    <p style={{ margin:'5px 0 0', fontSize:10, color:'rgba(255,255,255,0.3)', textAlign:'right' }}>
                      {new Date(r.sentAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})} · {new Date(r.sentAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Reply box */}
            {active.status !== 'Closed' ? (
              <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display:'flex', gap:9, marginBottom:8 }}>
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                    placeholder="Type admin reply... (Enter to send, Shift+Enter for new line)"
                    style={{ flex:1, padding:'9px 12px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:9, color:'#fff', fontFamily:'Poppins,sans-serif', fontSize:13, outline:'none', resize:'none', height:50 }} />
                  <button onClick={sendReply} disabled={submitting || !replyText.trim()}
                    style={{ padding:'0 18px', background:'linear-gradient(135deg,#a8e6cf,#84fab0)', border:'none', borderRadius:9, color:'#1a1a2e', fontWeight:700, cursor: submitting||!replyText.trim() ? 'not-allowed' : 'pointer', opacity: submitting||!replyText.trim() ? 0.5 : 1, fontSize:18 }}>
                    ➤
                  </button>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  {['In Progress','Resolved','Closed'].map(s => (
                    <button key={s} onClick={() => { setNewStatus(s); changeStatus(active._id, s); }}
                      style={{ padding:'4px 11px', border:`1px solid ${STATUS_COLOR[s]}40`, borderRadius:6, background:'transparent', color:STATUS_COLOR[s], fontSize:11, cursor:'pointer', fontFamily:'Poppins,sans-serif' }}>
                      Mark {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding:'14px 18px', borderTop:'1px solid rgba(255,255,255,0.08)', textAlign:'center', color:'rgba(255,255,255,0.35)', fontSize:13 }}>
                🔒 Ticket closed ·&nbsp;
                <span onClick={() => changeStatus(active._id,'Open')} style={{ color:'#60a5fa', cursor:'pointer', textDecoration:'underline' }}>Reopen</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 