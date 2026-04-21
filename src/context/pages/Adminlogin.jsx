import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function AdminLogin() {
  const [form,    setForm]    = useState({ email: 'admin@shopzone.com', password: 'admin123' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const onSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const u = await login(form.email, form.password);
      if (!u.isAdmin) { setError('This account is not an admin.'); setLoading(false); return; }
      navigate('/admin');
    } catch(err) { setError(err.message); }
    setLoading(false);
  };

  const inp = { width:'100%', padding:'12px 15px', borderRadius:11, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', color:'#fff', fontFamily:'Poppins,sans-serif', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:14 };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a2e,#1a0a3e,#0d1b4b)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Poppins,sans-serif', padding:20 }}>
      <div style={{ position:'absolute', top:'15%', left:'10%', width:260, height:260, background:'#f5576c', borderRadius:'50%', filter:'blur(90px)', opacity:.12 }} />
      <div style={{ position:'absolute', bottom:'15%', right:'10%', width:240, height:240, background:'#a8e6cf', borderRadius:'50%', filter:'blur(90px)', opacity:.12 }} />

      <div style={{ background:'rgba(255,255,255,0.07)', backdropFilter:'blur(24px)', borderRadius:24, padding:'42px 38px', width:'100%', maxWidth:420, border:'1px solid rgba(255,255,255,0.15)', boxShadow:'0 25px 60px rgba(0,0,0,0.5)', position:'relative', zIndex:10 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:44, marginBottom:8 }}>🔐</div>
          <h1 style={{ fontSize:26, fontWeight:700, margin:'0 0 5px', background:'linear-gradient(135deg,#fff,#f5576c)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Admin Portal</h1>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13, margin:0 }}>ShopZone Admin Dashboard</p>
        </div>

        {error && <div style={{ background:'rgba(245,87,108,0.12)', border:'1px solid rgba(245,87,108,0.4)', borderRadius:10, padding:'11px 15px', color:'#f5576c', fontSize:13, marginBottom:16 }}>❌ {error}</div>}

        <div style={{ background:'rgba(168,230,207,0.08)', border:'1px solid rgba(168,230,207,0.2)', borderRadius:10, padding:'10px 14px', marginBottom:18, fontSize:12, color:'rgba(255,255,255,0.6)' }}>
          💡 Default: <b style={{ color:'#a8e6cf' }}>admin@shopzone.com</b> / <b style={{ color:'#a8e6cf' }}>admin123</b>
        </div>

        <form onSubmit={onSubmit}>
          <label style={{ color:'rgba(255,255,255,0.7)', fontSize:13, display:'block', marginBottom:5 }}>Admin Email</label>
          <input type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} required style={inp} />

          <label style={{ color:'rgba(255,255,255,0.7)', fontSize:13, display:'block', marginBottom:5 }}>Password</label>
          <input type="password" value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} required style={{ ...inp, marginBottom:22 }} />

          <button type="submit" disabled={loading}
            style={{ width:'100%', padding:14, background:loading?'rgba(255,255,255,0.1)':'linear-gradient(135deg,#f5576c,#c2185b)', border:'none', borderRadius:13, color:'#fff', fontSize:16, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:'Poppins,sans-serif' }}>
            {loading ? '⏳ Signing in...' : '🔐 Admin Sign In'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:16 }}>
          <a href="/login" style={{ color:'rgba(255,255,255,0.35)', fontSize:13, textDecoration:'none' }}>← Back to User Login</a>
        </p>
      </div>
    </div>
  );
}