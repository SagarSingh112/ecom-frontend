import React, { useState } from 'react';
import { useCart } from '../CartContext';
import { useNavigate } from 'react-router-dom';

const API = 'https://ecom-backend-16sc.onrender.com/api';

export default function Checkout() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');

  const [step,    setStep]    = useState(1);
  const [addr,    setAddr]    = useState({ street:'', city:'', state:'', pincode:'' });
  const [method,  setMethod]  = useState('COD');
  const [upiId,   setUpiId]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const sub   = parseFloat(getCartTotal().toFixed(2));
  const tax   = parseFloat((sub * 0.18).toFixed(2));
  const ship  = sub > 500 ? 0 : 49;
  const total = parseFloat((sub + tax + ship).toFixed(2));

  // Save order to DB
  const saveOrder = async (paymentResult = null, isPaid = false) => {
    const res = await fetch(`${API}/orders`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      body: JSON.stringify({
        items: cartItems.map(i => ({
          product:  i._id,
          name:     i.name,
          price:    i.price,
          quantity: i.quantity,
          image:    i.images?.[0] || '',
        })),
        shippingAddress: addr,
        paymentMethod:   method,
        itemsPrice:      sub,
        taxPrice:        tax,
        shippingPrice:   ship,
        totalPrice:      total,
        isPaid,
        paymentResult,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Order failed');
    return data;
  };

  // Open real Razorpay popup
  const openRazorpay = async () => {
    setLoading(true); setError('');
    try {
      // 1. Create order on backend
      const rpRes = await fetch(`${API}/payment/create-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body:    JSON.stringify({ amount: total }),
      });
      const rpOrder = await rpRes.json();

      // 2. Demo mode — no real keys, just simulate success
      if (rpOrder.demo || !window.Razorpay) {
        await new Promise(r => setTimeout(r, 1200)); // small delay feels real
        const order = await saveOrder({ id: 'demo_' + Date.now(), mode: 'demo', status: 'success' }, true);
        clearCart();
        navigate('/orders?new=' + order._id);
        setLoading(false);
        return;
      }

      // 3. Real Razorpay popup
      const rzp = new window.Razorpay({
        key:         import.meta.env.VITE_RAZORPAY_KEY_ID || '',
        amount:      rpOrder.amount,
        currency:    'INR',
        name:        'ShopZone',
        description: 'Secure Payment',
        order_id:    rpOrder.id,
        prefill:     { name: user.name || '', email: user.email || '' },
        theme:       { color: '#a8e6cf' },
        handler: async (response) => {
          try {
            await fetch(`${API}/payment/verify`, {
              method:  'POST',
              headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
              body:    JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            });
            const order = await saveOrder({
              id:     response.razorpay_payment_id,
              status: 'COMPLETED',
              time:   new Date().toISOString(),
            }, true);
            clearCart();
            navigate('/orders?new=' + order._id);
          } catch(err) { setError('Payment done but order failed: ' + err.message); }
          setLoading(false);
        },
        modal: {
          ondismiss: () => { setError('Payment cancelled. Please try again.'); setLoading(false); },
        },
      });
      rzp.on('payment.failed', (resp) => {
        setError('Payment failed: ' + (resp.error?.description || 'Unknown error'));
        setLoading(false);
      });
      rzp.open();
    } catch(err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    if (method === 'UPI' && (!upiId || !upiId.includes('@'))) {
      setError('Please enter a valid UPI ID e.g. name@paytm'); return;
    }
    if (method === 'Razorpay') { openRazorpay(); return; }

    // COD / UPI / Card / Netbanking — all handled gracefully
    setLoading(true); setError('');
    try {
      const isPaid = method !== 'COD';
      const payResult = isPaid ? { id: method + '_' + Date.now(), status: 'completed', method } : null;
      const order = await saveOrder(payResult, isPaid);
      clearCart();
      navigate('/orders?new=' + order._id);
    } catch(err) { setError(err.message); }
    setLoading(false);
  };

  const inp = {
    width:'100%', padding:'11px 14px',
    background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)',
    borderRadius:10, color:'#fff', fontFamily:'Poppins,sans-serif',
    fontSize:14, boxSizing:'border-box', outline:'none',
  };

  const METHODS = [
    { id:'COD',        icon:'💵', label:'Cash on Delivery',   desc:'Pay when your order arrives at the door' },
    { id:'UPI',        icon:'📱', label:'UPI',                desc:'GPay · PhonePe · Paytm · BHIM' },
    { id:'Netbanking', icon:'🏦', label:'Net Banking',        desc:'SBI · HDFC · ICICI · Axis · Kotak' },
    { id:'Card',       icon:'💳', label:'Credit / Debit Card',desc:'Visa · Mastercard · RuPay · Amex' },
    { id:'Razorpay',   icon:'⚡', label:'Razorpay Gateway',   desc:'All-in-one: UPI, cards, wallets, netbanking' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a2e,#1a0a3e,#0d1b4b)', fontFamily:'Poppins,sans-serif', color:'#fff', padding:'24px 20px' }}>
      <div style={{ maxWidth:960, margin:'0 auto' }}>

        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:22 }}>
          <button onClick={() => step===2 ? setStep(1) : navigate('/dashboard')}
            style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'7px 15px', color:'#fff', cursor:'pointer', fontFamily:'Poppins,sans-serif' }}>
            ← {step===2 ? 'Back' : 'Dashboard'}
          </button>
          <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Checkout 🛒</h1>
        </div>

        {/* Step indicators */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:22 }}>
          {['📍 Delivery Address','💳 Payment'].map((s,i) => (
            <React.Fragment key={i}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700,
                  background: step>i ? 'linear-gradient(135deg,#84fab0,#a8e6cf)' : step===i+1 ? 'linear-gradient(135deg,#a8e6cf,#d4a5a5)' : 'rgba(255,255,255,0.1)',
                  color: step>=i+1 ? '#1a1a2e' : 'rgba(255,255,255,0.3)' }}>
                  {step>i+1 ? '✓' : i+1}
                </div>
                <span style={{ fontSize:13, fontWeight:step===i+1?700:400, color:step===i+1?'#fff':'rgba(255,255,255,0.4)' }}>{s}</span>
              </div>
              {i<1 && <div style={{ width:50, height:2, borderRadius:2, background:step>1?'#a8e6cf':'rgba(255,255,255,0.15)' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ background:'rgba(245,87,108,0.15)', border:'1px solid #f5576c', borderRadius:10, padding:'12px 16px', marginBottom:16, color:'#f5576c', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span>❌ {error}</span>
            <button onClick={() => setError('')} style={{ background:'none', border:'none', color:'#f5576c', cursor:'pointer', fontSize:18 }}>✕</button>
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:20 }}>

            <div>
              {/* STEP 1 */}
              {step===1 && (
                <div style={{ background:'rgba(255,255,255,0.07)', borderRadius:16, padding:24, border:'1px solid rgba(255,255,255,0.1)' }}>
                  <h2 style={{ margin:'0 0 18px', fontSize:17 }}>📍 Delivery Address</h2>
                  {[
                    ['street','Street / House No. / Area','#109, MG Road, Apt 4B'],
                    ['city','City','Bengaluru'],
                    ['state','State','Karnataka'],
                    ['pincode','PIN Code','560001'],
                  ].map(([f,l,ph]) => (
                    <div key={f} style={{ marginBottom:13 }}>
                      <label style={{ display:'block', fontSize:12, color:'rgba(255,255,255,0.6)', marginBottom:5 }}>{l} *</label>
                      <input value={addr[f]} onChange={e => setAddr(p=>({...p,[f]:e.target.value}))}
                        placeholder={ph} required maxLength={f==='pincode'?6:150} style={inp}
                        onFocus={e  => e.target.style.borderColor='#a8e6cf'}
                        onBlur={e   => e.target.style.borderColor='rgba(255,255,255,0.2)'} />
                    </div>
                  ))}
                  <button type="submit"
                    style={{ width:'100%', marginTop:8, padding:14, background:'linear-gradient(135deg,#a8e6cf,#d4a5a5)', border:'none', borderRadius:13, color:'#1a1a2e', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'Poppins,sans-serif' }}>
                    Continue to Payment →
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {step===2 && (
                <div style={{ background:'rgba(255,255,255,0.07)', borderRadius:16, padding:24, border:'1px solid rgba(255,255,255,0.1)' }}>
                  <h2 style={{ margin:'0 0 16px', fontSize:17 }}>💳 Choose Payment</h2>

                  {METHODS.map(opt => (
                    <label key={opt.id} onClick={() => { setMethod(opt.id); setError(''); }}
                      style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:10, marginBottom:8, cursor:'pointer', transition:'all .2s',
                        border:`2px solid ${method===opt.id ? '#a8e6cf' : 'rgba(255,255,255,0.1)'}`,
                        background: method===opt.id ? 'rgba(168,230,207,0.08)' : 'transparent' }}>
                      <span style={{ fontSize:22 }}>{opt.icon}</span>
                      <div style={{ flex:1 }}>
                        <p style={{ margin:0, fontWeight:600, fontSize:14, color:'#fff' }}>{opt.label}</p>
                        <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.45)' }}>{opt.desc}</p>
                      </div>
                      <div style={{ width:18, height:18, borderRadius:'50%', flexShrink:0, border:`2px solid ${method===opt.id ? '#a8e6cf' : 'rgba(255,255,255,0.3)'}`, background:method===opt.id?'#a8e6cf':'transparent' }} />
                    </label>
                  ))}

                  {/* UPI ID input */}
                  {method==='UPI' && (
                    <div style={{ padding:13, background:'rgba(168,230,207,0.05)', borderRadius:10, border:'1px solid rgba(168,230,207,0.2)', marginTop:4, marginBottom:4 }}>
                      <label style={{ fontSize:12, color:'rgba(255,255,255,0.6)', display:'block', marginBottom:5 }}>Your UPI ID *</label>
                      <input value={upiId} onChange={e=>setUpiId(e.target.value)} placeholder="name@paytm" style={inp} />
                      <div style={{ display:'flex', gap:6, marginTop:7, flexWrap:'wrap' }}>
                        {['@paytm','@ybl','@oksbi','@okaxis','@ibl'].map(s => (
                          <button key={s} type="button" onClick={() => setUpiId(upiId.split('@')[0]+s)}
                            style={{ background:'rgba(168,230,207,0.1)', border:'1px solid rgba(168,230,207,0.25)', borderRadius:5, padding:'3px 9px', color:'#a8e6cf', fontSize:11, cursor:'pointer', fontFamily:'Poppins,sans-serif' }}>{s}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Razorpay info */}
                  {method==='Razorpay' && (
                    <div style={{ padding:12, background:'rgba(96,165,250,0.06)', borderRadius:10, border:'1px solid rgba(96,165,250,0.2)', marginTop:4, marginBottom:4, fontSize:12, color:'rgba(255,255,255,0.55)', lineHeight:1.6 }}>
                      ⚡ Opens a secure Razorpay popup — supports all UPI, cards, netbanking & wallets.
                      {!window.Razorpay && <span style={{ color:'#fdd34d', display:'block', marginTop:4 }}>⚠️ Running in demo mode (no Razorpay keys configured)</span>}
                    </div>
                  )}

                  {/* Demo mode notice for all non-COD */}
                  {method !== 'COD' && (
                    <div style={{ padding:'9px 13px', background:'rgba(253,211,77,0.06)', border:'1px solid rgba(253,211,77,0.2)', borderRadius:8, marginTop:8, fontSize:11, color:'rgba(253,211,77,0.8)' }}>
                      💡 <b>Demo mode:</b> No real payment is charged. Order will be placed as paid instantly.
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    style={{ width:'100%', marginTop:16, padding:15, border:'none', borderRadius:13, fontSize:15, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:'Poppins,sans-serif', color:'#1a1a2e',
                      background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#84fab0,#8fd3f4)',
                      opacity: loading ? 0.7 : 1 }}>
                    {loading ? '⏳ Processing your order...'
                      : method==='COD'      ? `📦 Place Order — Pay on Delivery · ₹${total}`
                      : method==='Razorpay' ? `⚡ Pay ₹${total} via Razorpay`
                      :                       `✅ Confirm & Place Order · ₹${total}`}
                  </button>

                  <div style={{ display:'flex', justifyContent:'center', gap:16, marginTop:10 }}>
                    {['🔒 SSL Encrypted','✅ Secure','🛡️ Protected'].map(t=>(
                      <span key={t} style={{ color:'rgba(255,255,255,0.3)', fontSize:11 }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div style={{ background:'rgba(255,255,255,0.07)', borderRadius:16, padding:22, border:'1px solid rgba(255,255,255,0.1)', height:'fit-content', position:'sticky', top:20 }}>
              <h2 style={{ margin:'0 0 15px', fontSize:17 }}>🧾 Order Summary</h2>
              <div style={{ maxHeight:260, overflowY:'auto', display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
                {cartItems.map(item => (
                  <div key={item._id} style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <img src={item.images?.[0]||'https://via.placeholder.com/44'} alt={item.name}
                      style={{ width:44, height:44, borderRadius:8, objectFit:'cover', flexShrink:0 }}
                      onError={e=>e.target.src='https://via.placeholder.com/44'} />
                    <div style={{ flex:1 }}>
                      <p style={{ margin:0, fontSize:12, fontWeight:600 }}>{item.name}</p>
                      <p style={{ margin:0, fontSize:11, color:'rgba(255,255,255,0.5)' }}>Qty: {item.quantity}</p>
                    </div>
                    <span style={{ color:'#a8e6cf', fontWeight:700, fontSize:13 }}>₹{(item.price*item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:13, display:'flex', flexDirection:'column', gap:8 }}>
                {[['Subtotal',`₹${sub}`],['GST (18%)',`₹${tax}`],['Shipping',ship===0?'FREE 🎉':'₹'+ship]].map(([l,v])=>(
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                    <span style={{ color:'rgba(255,255,255,0.6)' }}>{l}</span>
                    <span style={{ color:l==='Shipping'&&ship===0?'#84fab0':'#fff', fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:10, fontWeight:700, fontSize:18 }}>
                  <span>Total</span><span style={{ color:'#a8e6cf' }}>₹{total}</span>
                </div>
              </div>
              {step===2 && addr.city && (
                <div style={{ marginTop:13, padding:12, background:'rgba(168,230,207,0.06)', borderRadius:10, border:'1px solid rgba(168,230,207,0.15)' }}>
                  <p style={{ color:'#a8e6cf', fontSize:12, fontWeight:600, margin:'0 0 3px' }}>📍 Delivering to:</p>
                  <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, margin:0, lineHeight:1.6 }}>
                    {addr.street}<br/>{addr.city}, {addr.state} – {addr.pincode}
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}