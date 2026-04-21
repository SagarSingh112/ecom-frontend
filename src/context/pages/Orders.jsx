import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API = 'http://https://ecom-backend-16sc.onrender.com/api';

const STATUS_COLOR = {
  Processing:       '#fdd34d',
  Confirmed:        '#60a5fa',
  Shipped:          '#a78bfa',
  'Out for Delivery':'#fb923c',
  Delivered:        '#84fab0',
  Cancelled:        '#f5576c',
};
const STEPS     = ['Processing','Confirmed','Shipped','Out for Delivery','Delivered'];
const STEP_IDX  = { Processing:0, Confirmed:1, Shipped:2, 'Out for Delivery':3, Delivered:4 };
const STEP_ICON = ['📋','✅','🚚','🛵','🎁'];
const STATUS_MSG = {
  Processing:        '⏳ We received your order and are preparing it.',
  Confirmed:         '✅ Order confirmed! It will be packed and dispatched soon.',
  Shipped:           '🚚 Your order is on the way!',
  'Out for Delivery':'🛵 Out for delivery — expect it today!',
  Delivered:         '🎉 Delivered! We hope you love your purchase.',
  Cancelled:         '❌ This order has been cancelled.',
};

export default function Orders() {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [reviewModal, setReviewModal] = useState(null); // { productId, orderStatus }
  const [review,      setReview]      = useState({ rating:5, comment:'' });
  const [toast,       setToast]       = useState('');
  const navigate  = useNavigate();
  const location  = useLocation();
  const token     = localStorage.getItem('token');
  const newId     = new URLSearchParams(location.search).get('new');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await (await fetch(`${API}/orders/myorders`, { headers:{'x-auth-token':token} })).json();
      setOrders(Array.isArray(data) ? data : []);
    } catch { setOrders([]); }
    setLoading(false);
  };

  /* ── Invoice Download ── */
  const downloadInvoice = (o) => {
    const line  = '═'.repeat(56);
    const thin  = '─'.repeat(56);
    const pad   = (s, n) => String(s).substring(0, n).padEnd(n);
    const userName = JSON.parse(localStorage.getItem('user') || '{}').name || 'Customer';

    const rows = o.items.map(i =>
      `  ${pad(i.name,30)}  ${pad(i.quantity,5)}  ${pad('₹'+i.price?.toLocaleString('en-IN'),10)}  ₹${(i.price*i.quantity)?.toLocaleString('en-IN')}`
    );

    const txt = [
      line,
      '              🛍️  SHOPZONE INVOICE              ',
      line,
      '',
      `  Invoice No   : INV-${o._id.slice(-8).toUpperCase()}`,
      `  Order Date   : ${new Date(o.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}`,
      `  Order ID     : #${o._id.slice(-8).toUpperCase()}`,
      `  Tracking No  : ${o.trackingNumber || 'N/A'}`,
      `  Order Status : ${o.orderStatus}`,
      '',
      thin,
      '  CUSTOMER DETAILS',
      thin,
      `  Name     : ${userName}`,
      `  Address  : ${o.shippingAddress?.street}`,
      `             ${o.shippingAddress?.city}, ${o.shippingAddress?.state} – ${o.shippingAddress?.pincode}`,
      '',
      thin,
      '  ITEMS',
      thin,
      `  ${'Product'.padEnd(30)}  ${'Qty'.padEnd(5)}  ${'Price'.padEnd(10)}  Total`,
      thin,
      ...rows,
      thin,
      '',
      `  Subtotal      :  ₹${o.itemsPrice?.toLocaleString('en-IN')}`,
      `  GST (18%)     :  ₹${o.taxPrice?.toLocaleString('en-IN')}`,
      `  Shipping      :  ${o.shippingPrice === 0 ? 'FREE' : '₹'+o.shippingPrice}`,
      '',
      `  GRAND TOTAL   :  ₹${o.totalPrice?.toLocaleString('en-IN')}`,
      '',
      thin,
      `  Payment Method: ${o.paymentMethod}`,
      `  Payment Status: ${o.isPaid ? '✅  PAID' : '⏳  Pay on Delivery'}`,
      o.isPaid && o.paidAt ? `  Paid On       : ${new Date(o.paidAt).toLocaleDateString('en-IN')}` : '',
      '',
      line,
      '       Thank you for shopping with ShopZone! 🙏      ',
      '          support@shopzone.com  |  www.shopzone.in   ',
      line,
    ].join('\n');

    const a  = document.createElement('a');
    a.href   = URL.createObjectURL(new Blob([txt], { type:'text/plain' }));
    a.download = `ShopZone-Invoice-${o._id.slice(-8).toUpperCase()}.txt`;
    a.click();
  };

  /* ── Submit Review ── */
  const submitReview = async () => {
    try {
      const res  = await fetch(`${API}/products/${reviewModal.productId}/review`, {
        method:  'POST',
        headers: { 'Content-Type':'application/json', 'x-auth-token': token },
        body:    JSON.stringify(review),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setToast('✅ Review submitted! Thank you.');
      setReviewModal(null);
      setTimeout(() => setToast(''), 4000);
    } catch(e) { setToast('❌ ' + e.message); }
  };

  const card = {
    background:   'rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding:      22,
    marginBottom: 16,
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a2e,#1a0a3e,#0d1b4b)', fontFamily:'Poppins,sans-serif', color:'#fff', padding:'24px 20px' }}>
      <div style={{ maxWidth:940, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:13, marginBottom:22 }}>
          <button onClick={() => navigate('/dashboard')}
            style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'7px 15px', color:'#fff', cursor:'pointer', fontFamily:'Poppins,sans-serif' }}>
            ← Dashboard
          </button>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>📦 My Orders</h1>
        </div>

        {/* New-order success banner */}
        {newId && (
          <div style={{ background:'linear-gradient(135deg,rgba(132,250,176,0.15),rgba(168,230,207,0.08))', border:'1px solid rgba(132,250,176,0.5)', borderRadius:14, padding:'18px 22px', marginBottom:20 }}>
            <p style={{ margin:0, color:'#84fab0', fontWeight:700, fontSize:16 }}>🎉 Order Placed Successfully!</p>
            <p style={{ margin:'5px 0 0', color:'rgba(255,255,255,0.6)', fontSize:13 }}>
              Order #{newId.slice(-8).toUpperCase()} is confirmed. Track it below and download your invoice anytime.
            </p>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div style={{ background:'rgba(168,230,207,0.12)', border:'1px solid #84fab0', borderRadius:10, padding:'11px 16px', marginBottom:16, color:'#84fab0', fontWeight:600 }}>
            {toast}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign:'center', padding:80, color:'rgba(255,255,255,0.5)', fontSize:16 }}>⏳ Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign:'center', padding:80 }}>
            <div style={{ fontSize:64, marginBottom:14 }}>📦</div>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:16, marginBottom:20 }}>No orders yet!</p>
            <button onClick={() => navigate('/dashboard')}
              style={{ background:'linear-gradient(135deg,#a8e6cf,#d4a5a5)', border:'none', borderRadius:12, padding:'12px 28px', color:'#1a1a2e', fontWeight:700, cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:15 }}>
              🛍️ Start Shopping
            </button>
          </div>
        ) : orders.map(order => (
          <div key={order._id}
            style={{ ...card,
              border: order._id===newId ? '1px solid rgba(132,250,176,0.45)' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: order._id===newId ? '0 0 24px rgba(132,250,176,0.08)' : 'none',
            }}>

            {/* ── Card Header ── */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10, marginBottom:14 }}>
              <div>
                <p style={{ margin:0, fontWeight:700, fontSize:15 }}>Order #{order._id.slice(-8).toUpperCase()}</p>
                <p style={{ margin:'3px 0 0', fontSize:12, color:'rgba(255,255,255,0.45)' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}
                  &nbsp;·&nbsp;{order.items.length} item(s)
                  &nbsp;·&nbsp;🔖 {order.trackingNumber}
                </p>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <span style={{
                  background: `${STATUS_COLOR[order.orderStatus]}18`,
                  border:     `1px solid ${STATUS_COLOR[order.orderStatus]}`,
                  color:       STATUS_COLOR[order.orderStatus],
                  borderRadius:20, padding:'4px 14px', fontSize:12, fontWeight:700,
                }}>
                  {order.orderStatus}
                </span>
                <span style={{ color:'#a8e6cf', fontWeight:700, fontSize:15 }}>
                  ₹{order.totalPrice?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* ── Status message ── */}
            {STATUS_MSG[order.orderStatus] && (
              <div style={{ borderLeft:`3px solid ${STATUS_COLOR[order.orderStatus]}`, background:`${STATUS_COLOR[order.orderStatus]}10`, borderRadius:'0 8px 8px 0', padding:'8px 14px', marginBottom:16, fontSize:13, color:STATUS_COLOR[order.orderStatus], fontWeight:600 }}>
                {STATUS_MSG[order.orderStatus]}
              </div>
            )}

            {/* ── Tracking Progress ── */}
            {order.orderStatus !== 'Cancelled' && (
              <div style={{ marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'flex-start' }}>
                  {STEPS.map((s, i) => {
                    const done = STEP_IDX[order.orderStatus] >= i;
                    const curr = STEP_IDX[order.orderStatus] === i;
                    return (
                      <React.Fragment key={s}>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1, minWidth:0 }}>
                          <div style={{
                            width:34, height:34, borderRadius:'50%', flexShrink:0,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize: curr ? 16 : 13,
                            background: done ? 'linear-gradient(135deg,#84fab0,#a8e6cf)' : 'rgba(255,255,255,0.08)',
                            border:     curr ? '3px solid #84fab0' : done ? 'none' : '2px solid rgba(255,255,255,0.12)',
                            color:      done ? '#1a1a2e' : 'rgba(255,255,255,0.25)',
                            boxShadow:  curr ? '0 0 18px #84fab055' : 'none',
                            transition: 'all .4s',
                          }}>
                            {done && !curr ? '✓' : STEP_ICON[i]}
                          </div>
                          <p style={{ margin:'6px 0 0', fontSize:9, textAlign:'center', wordBreak:'break-word', padding:'0 2px', lineHeight:1.3,
                            color:      done ? '#a8e6cf' : 'rgba(255,255,255,0.25)',
                            fontWeight: curr ? 700 : 400,
                          }}>{s}</p>
                        </div>
                        {i < STEPS.length-1 && (
                          <div style={{ height:3, flex:1, borderRadius:2, marginTop:16, transition:'all .5s',
                            background: STEP_IDX[order.orderStatus] > i
                              ? 'linear-gradient(90deg,#84fab0,#a8e6cf)'
                              : 'rgba(255,255,255,0.1)',
                          }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Items ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ display:'flex', gap:11, alignItems:'center', background:'rgba(255,255,255,0.04)', borderRadius:10, padding:10 }}>
                  <img src={item.image||'https://via.placeholder.com/48'} alt={item.name}
                    style={{ width:48, height:48, borderRadius:8, objectFit:'cover', flexShrink:0 }}
                    onError={e => e.target.src='https://via.placeholder.com/48'} />
                  <div style={{ flex:1 }}>
                    <p style={{ margin:0, fontWeight:600, fontSize:13 }}>{item.name}</p>
                    <p style={{ margin:'2px 0 0', fontSize:11, color:'rgba(255,255,255,0.45)' }}>
                      Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5 }}>
                    <span style={{ color:'#a8e6cf', fontWeight:700 }}>
                      ₹{(item.price*item.quantity)?.toLocaleString('en-IN')}
                    </span>
                    {order.orderStatus==='Delivered' && item.product && (
                      <button onClick={() => { setReviewModal({ productId: item.product }); setReview({ rating:5, comment:'' }); }}
                        style={{ background:'rgba(253,211,77,0.12)', border:'1px solid rgba(253,211,77,0.3)', borderRadius:6, padding:'3px 10px', color:'#fdd34d', fontSize:11, cursor:'pointer', fontFamily:'Poppins,sans-serif' }}>
                        ⭐ Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Footer ── */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:12, flexWrap:'wrap', gap:10 }}>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', display:'flex', gap:14, flexWrap:'wrap' }}>
                <span>📍 {order.shippingAddress?.city}, {order.shippingAddress?.state}</span>
                <span>💳 {order.paymentMethod} {order.isPaid ? '· ✅ Paid' : '· ⏳ Pay on delivery'}</span>
              </div>
              <button onClick={() => downloadInvoice(order)}
                style={{ background:'linear-gradient(135deg,#a8e6cf,#d4a5a5)', border:'none', borderRadius:10, padding:'9px 22px', color:'#1a1a2e', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'Poppins,sans-serif', display:'flex', alignItems:'center', gap:6 }}>
                📥 Download Invoice
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Review Modal ── */}
      {reviewModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:20 }}>
          <div style={{ background:'linear-gradient(135deg,#1a0a3e,#0d1b4b)', borderRadius:20, padding:32, width:'100%', maxWidth:430, border:'1px solid rgba(255,255,255,0.15)', boxShadow:'0 30px 80px rgba(0,0,0,0.6)' }}>
            <h2 style={{ margin:'0 0 6px', fontSize:20 }}>⭐ Write a Review</h2>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13, margin:'0 0 22px' }}>Help other shoppers with your feedback</p>

            <label style={{ fontSize:13, color:'rgba(255,255,255,0.7)', display:'block', marginBottom:10 }}>Your Rating</label>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setReview(p => ({ ...p, rating:n }))}
                  style={{ fontSize:30, background:'none', border:'none', cursor:'pointer', transition:'all .15s',
                    opacity:   review.rating >= n ? 1 : 0.2,
                    transform: review.rating >= n ? 'scale(1.15)' : 'scale(1)',
                  }}>⭐</button>
              ))}
              <span style={{ color:'rgba(255,255,255,0.5)', fontSize:13, marginLeft:4 }}>
                {['','Poor','Fair','Good','Very Good','Excellent'][review.rating]}
              </span>
            </div>

            <label style={{ fontSize:13, color:'rgba(255,255,255,0.7)', display:'block', marginBottom:8 }}>Your Comment</label>
            <textarea value={review.comment} onChange={e => setReview(p => ({ ...p, comment:e.target.value }))}
              placeholder="Share your experience — quality, packaging, delivery..."
              style={{ width:'100%', padding:12, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:10, color:'#fff', fontFamily:'Poppins,sans-serif', fontSize:13, height:100, resize:'none', boxSizing:'border-box', outline:'none', marginBottom:20 }} />

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setReviewModal(null)}
                style={{ flex:1, padding:12, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, color:'#fff', cursor:'pointer', fontFamily:'Poppins,sans-serif', fontWeight:600 }}>
                Cancel
              </button>
              <button onClick={submitReview}
                style={{ flex:2, padding:12, background:'linear-gradient(135deg,#fdd34d,#fb923c)', border:'none', borderRadius:10, color:'#1a1a2e', fontWeight:700, cursor:'pointer', fontFamily:'Poppins,sans-serif', fontSize:15 }}>
                Submit Review ⭐
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}