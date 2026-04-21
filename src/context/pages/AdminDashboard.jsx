import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSupport from './AdminSupport';

const API = 'http://localhost:5000/api';
const STATUS_COLORS = { Processing:'#fdd34d', Confirmed:'#60a5fa', Shipped:'#a78bfa', 'Out for Delivery':'#fb923c', Delivered:'#84fab0', Cancelled:'#f5576c' };
const BLANK = { name:'', description:'', price:'', originalPrice:'', discount:'', category:'Electronics', brand:'', stock:'', images:'' };

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token    = localStorage.getItem('token');

  const [tab,      setTab]      = useState('orders'); // orders | products | support
  const [orders,   setOrders]   = useState([]);
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState(BLANK);
  const [editId,   setEditId]   = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast,    setToast]    = useState('');

  useEffect(() => { if (tab !== 'support') fetchData(); }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'orders') {
        const d = await (await fetch(`${API}/orders/all`, { headers:{'x-auth-token':token} })).json();
        setOrders(Array.isArray(d) ? d : []);
      } else if (tab === 'products') {
        const d = await (await fetch(`${API}/products`)).json();
        setProducts(Array.isArray(d) ? d : []);
      }
    } catch {}
    setLoading(false);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const updateStatus = async (id, status) => {
    await fetch(`${API}/orders/${id}/status`, { method:'PUT', headers:{'Content-Type':'application/json','x-auth-token':token}, body:JSON.stringify({ orderStatus:status }) });
    showToast(`✅ Marked as ${status}`); fetchData();
  };

  const saveProduct = async () => {
    const body   = { ...form, price:Number(form.price), originalPrice:Number(form.originalPrice)||0, discount:Number(form.discount)||0, stock:Number(form.stock)||0, images:form.images?[form.images]:[] };
    const url    = editId ? `${API}/products/${editId}` : `${API}/products`;
    const method = editId ? 'PUT' : 'POST';
    const res    = await fetch(url, { method, headers:{'Content-Type':'application/json','x-auth-token':token}, body:JSON.stringify(body) });
    if (res.ok) { showToast(editId?'✅ Updated!':'✅ Added!'); setShowForm(false); setForm(BLANK); setEditId(null); fetchData(); }
    else { const d = await res.json(); showToast('❌ '+d.msg); }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`${API}/products/${id}`, { method:'DELETE', headers:{'x-auth-token':token} });
    showToast('🗑️ Deleted'); fetchData();
  };

  const startEdit = (p) => {
    setForm({ name:p.name, description:p.description||'', price:p.price, originalPrice:p.originalPrice||'', discount:p.discount||0, category:p.category, brand:p.brand||'', stock:p.stock, images:p.images?.[0]||'' });
    setEditId(p._id); setShowForm(true);
  };

  const STATUSES = ['Processing','Confirmed','Shipped','Out for Delivery','Delivered','Cancelled'];
  const inp      = { width:'100%', padding:'9px 12px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, color:'#fff', fontFamily:'Poppins,sans-serif', fontSize:13, outline:'none', boxSizing:'border-box', marginBottom:10 };

  const totalRevenue = orders.filter(o => o.isPaid).reduce((t,o) => t+(o.totalPrice||0), 0);

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a2e,#1a0a3e,#0d1b4b)', fontFamily:'Poppins,sans-serif', color:'#fff' }}>

      {/* NAV */}
      <div style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.1)', padding:'13px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100, flexWrap:'wrap', gap:10 }}>
        <div style={{ fontSize:20, fontWeight:700, background:'linear-gradient(135deg,#fff,#f5576c)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>🔐 ShopZone Admin</div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <span style={{ color:'rgba(255,255,255,0.55)', fontSize:13 }}>👤 {user?.name}</span>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ background:'rgba(245,87,108,0.15)', border:'1px solid rgba(245,87,108,0.35)', borderRadius:8, padding:'7px 14px', color:'#f5576c', cursor:'pointer', fontSize:13, fontFamily:'Poppins,sans-serif' }}>Logout</button>
        </div>
      </div>

      {toast && <div style={{ position:'fixed', top:70, right:20, background:'rgba(132,250,176,0.15)', border:'1px solid #84fab0', borderRadius:10, padding:'11px 18px', color:'#84fab0', fontWeight:600, zIndex:999 }}>{toast}</div>}

      <div style={{ padding:'24px 20px', maxWidth:1200, margin:'0 auto' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:22 }}>
          {[['💰 Revenue', `₹${totalRevenue.toLocaleString('en-IN')}`, '#a8e6cf'], ['📦 Orders', orders.length, '#60a5fa'], ['🛍️ Products', products.length||'—', '#a78bfa'], ['✅ Delivered', orders.filter(o=>o.orderStatus==='Delivered').length, '#84fab0']].map(([l,v,c]) => (
            <div key={l} style={{ background:'rgba(255,255,255,0.07)', borderRadius:14, padding:'16px 18px', border:'1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ margin:'0 0 5px', color:'rgba(255,255,255,0.5)', fontSize:13 }}>{l}</p>
              <p style={{ margin:0, fontSize:24, fontWeight:700, color:c }}>{v}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:10, marginBottom:22, flexWrap:'wrap' }}>
          {[['orders','📦 Orders'],['products','🛍️ Products'],['support','🎧 Support']].map(([t,l]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding:'9px 22px', border:'none', borderRadius:20, cursor:'pointer', fontFamily:'Poppins,sans-serif', fontWeight:600, fontSize:14, background:tab===t?'linear-gradient(135deg,#a8e6cf,#d4a5a5)':'rgba(255,255,255,0.08)', color:tab===t?'#1a1a2e':'#fff' }}>
              {l}
            </button>
          ))}
          {tab === 'products' && (
            <button onClick={() => { setShowForm(true); setForm(BLANK); setEditId(null); }}
              style={{ marginLeft:'auto', padding:'9px 22px', background:'linear-gradient(135deg,#84fab0,#a8e6cf)', border:'none', borderRadius:20, cursor:'pointer', fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:14, color:'#1a1a2e' }}>
              + Add Product
            </button>
          )}
        </div>

        {/* Support tab — embed component */}
        {tab === 'support' && <AdminSupport />}

        {/* Orders tab */}
        {tab === 'orders' && (loading ? <div style={{ textAlign:'center', padding:80, color:'rgba(255,255,255,0.5)' }}>⏳ Loading...</div> : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {orders.length === 0 ? <p style={{ color:'rgba(255,255,255,0.5)', textAlign:'center', padding:50 }}>No orders yet.</p>
            : orders.map(o => (
              <div key={o._id} style={{ background:'rgba(255,255,255,0.07)', borderRadius:14, padding:18, border:'1px solid rgba(255,255,255,0.09)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:12 }}>
                  <div>
                    <p style={{ margin:0, fontWeight:700, fontSize:14 }}>#{o._id.slice(-8).toUpperCase()}</p>
                    <p style={{ margin:'3px 0 0', fontSize:11, color:'rgba(255,255,255,0.45)' }}>
                      {o.user?.name} · {o.user?.email} · {new Date(o.createdAt).toLocaleDateString('en-IN')} · 🔖 {o.trackingNumber}
                    </p>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <span style={{ color:'#a8e6cf', fontWeight:700 }}>₹{o.totalPrice?.toLocaleString('en-IN')}</span>
                    <span style={{ background:`${STATUS_COLORS[o.orderStatus]}18`, border:`1px solid ${STATUS_COLORS[o.orderStatus]}`, color:STATUS_COLORS[o.orderStatus], borderRadius:20, padding:'3px 12px', fontSize:11, fontWeight:700 }}>{o.orderStatus}</span>
                    <span style={{ fontSize:11, color:o.isPaid?'#84fab0':'#fdd34d' }}>{o.isPaid?'✅ Paid':'⏳ COD'}</span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
                  {o.items?.map((item,i) => (
                    <div key={i} style={{ display:'flex', gap:7, alignItems:'center', background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'6px 10px' }}>
                      <img src={item.image||'https://via.placeholder.com/36'} alt="" style={{ width:36,height:36,borderRadius:6,objectFit:'cover' }} onError={e=>e.target.src='https://via.placeholder.com/36'} />
                      <span style={{ fontSize:12 }}>{item.name} ×{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.45)' }}>📍 {o.shippingAddress?.city}, {o.shippingAddress?.state} · 💳 {o.paymentMethod}</span>
                  <span style={{ marginLeft:'auto', fontSize:12, color:'rgba(255,255,255,0.4)' }}>Update:</span>
                  <select value={o.orderStatus} onChange={e => updateStatus(o._id, e.target.value)}
                    style={{ padding:'5px 10px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:7, color:'#fff', fontFamily:'Poppins,sans-serif', fontSize:12, cursor:'pointer', outline:'none' }}>
                    {STATUSES.map(s => <option key={s} value={s} style={{ background:'#1a1a2e' }}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Products tab */}
        {tab === 'products' && (loading ? <div style={{ textAlign:'center', padding:80, color:'rgba(255,255,255,0.5)' }}>⏳ Loading...</div> : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:16 }}>
            {products.length === 0 ? <p style={{ color:'rgba(255,255,255,0.5)', gridColumn:'1/-1', textAlign:'center', padding:50 }}>No products.</p>
            : products.map(p => (
              <div key={p._id} style={{ background:'rgba(255,255,255,0.07)', borderRadius:14, border:'1px solid rgba(255,255,255,0.09)', overflow:'hidden' }}>
                <img src={p.images?.[0]||'https://via.placeholder.com/210x140'} alt={p.name} style={{ width:'100%', height:140, objectFit:'cover' }} onError={e=>e.target.src='https://via.placeholder.com/210x140'} />
                <div style={{ padding:12 }}>
                  <p style={{ margin:'0 0 2px', fontWeight:600, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</p>
                  <p style={{ margin:'0 0 6px', fontSize:11, color:'rgba(255,255,255,0.4)' }}>{p.brand} · {p.category}</p>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ color:'#a8e6cf', fontWeight:700 }}>₹{p.price?.toLocaleString('en-IN')}</span>
                    <span style={{ fontSize:11, color:p.stock>0?'#84fab0':'#f5576c' }}>Stock: {p.stock}</span>
                  </div>
                  <div style={{ display:'flex', gap:7 }}>
                    <button onClick={() => startEdit(p)} style={{ flex:1, padding:'7px', background:'rgba(168,230,207,0.12)', border:'1px solid rgba(168,230,207,0.25)', borderRadius:7, color:'#a8e6cf', cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:600 }}>✏️ Edit</button>
                    <button onClick={() => deleteProduct(p._id)} style={{ flex:1, padding:'7px', background:'rgba(245,87,108,0.12)', border:'1px solid rgba(245,87,108,0.25)', borderRadius:7, color:'#f5576c', cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:600 }}>🗑️ Del</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Product form modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:20 }}>
          <div style={{ background:'linear-gradient(135deg,#1a0a3e,#0d1b4b)', borderRadius:20, padding:28, width:'100%', maxWidth:500, border:'1px solid rgba(255,255,255,0.15)', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ margin:0, fontSize:19 }}>{editId ? '✏️ Edit Product' : '➕ Add Product'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', color:'#fff', fontSize:22, cursor:'pointer' }}>✕</button>
            </div>
            {[['name','Product Name'],['brand','Brand'],['description','Description'],['images','Image URL']].map(([f,l]) => (
              <div key={f}><label style={{ fontSize:12, color:'rgba(255,255,255,0.6)', display:'block', marginBottom:4 }}>{l}</label>
              <input value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} style={inp} /></div>
            ))}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[['price','Price (₹)'],['originalPrice','Original Price'],['discount','Discount %'],['stock','Stock Qty']].map(([f,l]) => (
                <div key={f}><label style={{ fontSize:12, color:'rgba(255,255,255,0.6)', display:'block', marginBottom:4 }}>{l}</label>
                <input type="number" value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} style={inp} /></div>
              ))}
            </div>
            <label style={{ fontSize:12, color:'rgba(255,255,255,0.6)', display:'block', marginBottom:4 }}>Category</label>
            <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={{ ...inp, marginBottom:16 }}>
              {['Electronics','Fashion','Sports','Home','Books','Toys','Accessories'].map(c=><option key={c} value={c} style={{ background:'#1a1a2e' }}>{c}</option>)}
            </select>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setShowForm(false)} style={{ flex:1, padding:12, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, color:'#fff', cursor:'pointer', fontFamily:'Poppins,sans-serif', fontWeight:600 }}>Cancel</button>
              <button onClick={saveProduct} style={{ flex:2, padding:12, background:'linear-gradient(135deg,#a8e6cf,#d4a5a5)', border:'none', borderRadius:10, color:'#1a1a2e', fontWeight:700, cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:15 }}>{editId?'✅ Save Changes':'➕ Add Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}