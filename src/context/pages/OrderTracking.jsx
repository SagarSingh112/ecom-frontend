import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext.jsx';

/* ─── Styles ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:#060918}

@keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
@keyframes spin    { to{transform:rotate(360deg)} }
@keyframes pop     { from{transform:scale(.88);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes shake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
@keyframes dot-pulse {
  0%,100% { box-shadow:0 0 0 0 rgba(108,99,255,.55) }
  50%     { box-shadow:0 0 0 7px rgba(108,99,255,0) }
}

.page { min-height:100vh; background:linear-gradient(135deg,#060918 0%,#0e0725 35%,#081230 100%); padding:20px }
.wrap { max-width:800px; margin:0 auto }

.order-card {
  background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.09);
  border-radius:18px; padding:20px; margin-bottom:16px;
  animation:fadeUp .4s ease both; transition:border-color .25s, box-shadow .25s;
}
.order-card:hover { border-color:rgba(0,229,160,.22); box-shadow:0 8px 32px rgba(0,0,0,.35) }
.order-card.cancelled { border-color:rgba(245,87,108,.2); background:rgba(245,87,108,.03) }

/* Status badges */
.badge { padding:4px 11px; border-radius:20px; font-size:11px; font-weight:700; white-space:nowrap }

/* Tracking timeline */
.track-wrap { position:relative; padding-left:28px; margin-top:16px }
.track-wrap::before {
  content:''; position:absolute; left:9px; top:9px; bottom:9px;
  width:2px; background:rgba(255,255,255,.08);
}
.t-step { position:relative; margin-bottom:22px; padding-left:12px }
.t-step:last-child { margin-bottom:0 }
.t-dot {
  width:20px; height:20px; border-radius:50%;
  border:2px solid rgba(255,255,255,.14); background:#0f1520;
  display:grid; place-items:center;
  position:absolute; left:-28px; top:1px; z-index:1;
}
.t-dot.done   { background:#00e5a0; border-color:#00e5a0 }
.t-dot.active { background:#6c63ff; border-color:#6c63ff; animation:dot-pulse 1.6s ease infinite }
.t-dot.cancel { background:rgba(245,87,108,.2); border-color:#f5576c }
.t-label { font-weight:600; font-size:.88rem }
.t-sub   { font-size:.72rem; color:rgba(255,255,255,.38); margin-top:2px }

/* Cancel modal overlay */
.modal-bg {
  position:fixed; inset:0; background:rgba(0,0,0,.75);
  backdrop-filter:blur(8px); z-index:900;
  display:grid; place-items:center; padding:20px;
}
.modal {
  background:rgba(8,10,24,.98); border:1px solid rgba(255,255,255,.12);
  border-radius:20px; padding:28px; width:100%; max-width:420px;
  animation:pop .28s cubic-bezier(.34,1.56,.64,1);
}
.modal-title { font-family:'Syne',sans-serif; font-weight:800; font-size:1.15rem; color:#fff; margin-bottom:6px }
.modal-sub   { color:rgba(255,255,255,.45); font-size:.85rem; margin-bottom:18px; line-height:1.5 }

/* Reason buttons */
.reason-btn {
  width:100%; padding:11px 14px; background:rgba(255,255,255,.05);
  border:1.5px solid rgba(255,255,255,.1); border-radius:11px;
  color:rgba(255,255,255,.7); font-family:'DM Sans',sans-serif;
  font-size:.85rem; font-weight:500; cursor:pointer;
  text-align:left; transition:all .18s; margin-bottom:8px;
  display:flex; align-items:center; gap:10px;
}
.reason-btn:hover  { border-color:rgba(245,87,108,.45); color:#fff; background:rgba(245,87,108,.07) }
.reason-btn.active { border-color:#f5576c; background:rgba(245,87,108,.12); color:#fff }

.btn-cancel-confirm {
  width:100%; padding:13px; border:none; border-radius:11px; cursor:pointer;
  background:linear-gradient(135deg,#f5576c,#c0392b);
  color:#fff; font-family:'Syne',sans-serif; font-weight:700;
  font-size:.96rem; transition:transform .15s, box-shadow .2s; margin-top:6px;
  display:flex; align-items:center; justify-content:center; gap:8px;
}
.btn-cancel-confirm:hover   { transform:translateY(-2px); box-shadow:0 8px 22px rgba(245,87,108,.35) }
.btn-cancel-confirm:disabled{ opacity:.6; cursor:not-allowed; transform:none }

.btn-keep {
  width:100%; padding:11px; border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.06); border-radius:11px; cursor:pointer;
  color:rgba(255,255,255,.65); font-family:'DM Sans',sans-serif;
  font-weight:600; font-size:.88rem; transition:all .18s; margin-top:8px;
}
.btn-keep:hover { background:rgba(255,255,255,.1); color:#fff }

/* Cancelled banner inside card */
.cancel-banner {
  background:rgba(245,87,108,.07); border:1px solid rgba(245,87,108,.22);
  border-radius:10px; padding:11px 14px; margin-top:13px;
  display:flex; align-items:flex-start; gap:10px;
}

/* Success toast */
.toast {
  position:fixed; bottom:26px; left:50%; transform:translateX(-50%);
  background:rgba(245,87,108,.15); border:1px solid rgba(245,87,108,.45);
  border-radius:40px; padding:11px 22px; color:#f5576c;
  font-weight:700; font-size:.88rem; z-index:999;
  animation:fadeUp .3s ease; white-space:nowrap;
  display:flex; align-items:center; gap:8px;
}
`;

/* ─── Constants ─── */
const STATUS_COLOR = {
  Processing: '#fdd34d',
  Shipped:    '#60a5fa',
  Delivered:  '#84fab0',
  Cancelled:  '#f5576c',
};
const STATUS_BG = {
  Processing: 'rgba(253,211,77,.14)',
  Shipped:    'rgba(96,165,250,.14)',
  Delivered:  'rgba(132,250,176,.14)',
  Cancelled:  'rgba(245,87,108,.14)',
};
const STATUS_STEPS = ['Processing', 'Shipped', 'Delivered'];

const CANCEL_REASONS = [
  { icon: '🔄', text: 'I want to change / update my order' },
  { icon: '💸', text: 'Found a better price elsewhere' },
  { icon: '⏰', text: 'Delivery time is too long' },
  { icon: '❌', text: 'I ordered by mistake' },
  { icon: '💳', text: 'Payment / billing issue' },
  { icon: '📦', text: 'Other reason' },
];

/* ─── Tracking timeline ─── */
function TrackBar({ order }) {
  const { orderStatus, cancelReason, cancelledAt } = order;

  if (orderStatus === 'Cancelled') {
    return (
      <div className="cancel-banner">
        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>❌</span>
        <div>
          <p style={{ color: '#f5576c', fontWeight: 700, fontSize: '.88rem', marginBottom: 3 }}>
            Order Cancelled
          </p>
          {cancelReason && (
            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.78rem', marginBottom: 2 }}>
              Reason: {cancelReason}
            </p>
          )}
          {cancelledAt && (
            <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '.73rem' }}>
              {new Date(cancelledAt).toLocaleString('en-IN')}
            </p>
          )}
        </div>
      </div>
    );
  }

  const idx = STATUS_STEPS.indexOf(orderStatus);
  const events = [
    { label: 'Order Placed',      sub: 'Confirmed & preparing',  done: true,      active: false },
    { label: 'Picked Up',         sub: 'Handed to courier',       done: idx >= 1,  active: idx === 0 },
    { label: 'In Transit',        sub: 'On the way to you',       done: idx >= 2,  active: idx === 1 },
    { label: 'Out for Delivery',  sub: 'Arriving today',          done: idx >= 2 && orderStatus === 'Delivered', active: idx === 2 && orderStatus !== 'Delivered' },
    { label: 'Delivered',         sub: 'Package received ✓',      done: orderStatus === 'Delivered', active: false },
  ];

  return (
    <div className="track-wrap">
      {events.map((ev, i) => (
        <div className="t-step" key={i}>
          <div className={`t-dot${ev.done ? ' done' : ev.active ? ' active' : ''}`}>
            {ev.done && (
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none"
                stroke="#080c14" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="7.5 2 3.5 7 1 4.5" />
              </svg>
            )}
            {ev.active && (
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />
            )}
          </div>
          <div className="t-label"
            style={{ color: ev.active ? '#a8a0ff' : ev.done ? '#fff' : 'rgba(255,255,255,.3)' }}>
            {ev.label}
          </div>
          <div className="t-sub">{ev.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Cancel Modal ─── */
function CancelModal({ order, onClose, onConfirm, busy }) {
  const [selected, setSelected] = useState('');
  const [custom,   setCustom]   = useState('');

  const finalReason = selected === 'Other reason' && custom.trim()
    ? custom.trim()
    : selected;

  return (
    <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>😔</div>
            <h2 className="modal-title">Cancel this order?</h2>
            <p className="modal-sub">
              Order <span style={{ color: '#00e5a0', fontFamily: 'monospace', fontWeight: 700 }}>
                #{order._id?.slice(-8).toUpperCase()}
              </span>
              <br />
              <span style={{ color: '#f5576c' }}>This action cannot be undone.</span> You can only cancel
              orders that haven't shipped yet.
            </p>
          </div>
          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)',
              borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: 'rgba(255,255,255,.6)',
              fontSize: '1rem', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            ✕
          </button>
        </div>

        {/* Reason picker */}
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.76rem', textTransform: 'uppercase',
          letterSpacing: '.5px', fontWeight: 600, marginBottom: 10 }}>
          Select a reason (optional)
        </p>
        {CANCEL_REASONS.map(r => (
          <button key={r.text} className={`reason-btn${selected === r.text ? ' active' : ''}`}
            onClick={() => setSelected(selected === r.text ? '' : r.text)}>
            <span style={{ fontSize: '1.1rem' }}>{r.icon}</span>
            {r.text}
            {selected === r.text && (
              <span style={{ marginLeft: 'auto', color: '#f5576c', fontSize: '1rem' }}>✓</span>
            )}
          </button>
        ))}

        {/* Custom reason text box */}
        {selected === 'Other reason' && (
          <textarea
            placeholder="Tell us more (optional)…"
            value={custom}
            onChange={e => setCustom(e.target.value)}
            rows={2}
            style={{ width: '100%', marginTop: 8, padding: '10px 13px',
              background: 'rgba(255,255,255,.07)', border: '1.5px solid rgba(245,87,108,.35)',
              borderRadius: 10, color: '#fff', fontFamily: "'DM Sans',sans-serif",
              fontSize: '.87rem', outline: 'none', resize: 'none' }}
          />
        )}

        {/* Order total reminder */}
        <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 10, padding: '10px 13px', margin: '16px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,.5)', fontSize: '.83rem' }}>Order Total</span>
          <span style={{ color: '#fff', fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>
            ₹{Number(order.totalPrice).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Refund note */}
        {order.isPaid && (
          <div style={{ background: 'rgba(0,229,160,.06)', border: '1px solid rgba(0,229,160,.2)',
            borderRadius: 10, padding: '9px 13px', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 8,
            color: '#00e5a0', fontSize: '.8rem', fontWeight: 500 }}>
            💚 Refund of ₹{Number(order.totalPrice).toLocaleString('en-IN')} will be
            initiated to your original payment method within 5–7 business days.
          </div>
        )}

        <button className="btn-cancel-confirm" disabled={busy}
          onClick={() => onConfirm(finalReason || 'Cancelled by customer')}>
          {busy
            ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)',
                borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
              Cancelling…</>
            : '❌ Yes, Cancel My Order'}
        </button>

        <button className="btn-keep" onClick={onClose}>
          No, Keep My Order
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function OrdersPage() {
  const { authHeaders }   = useAuth();
  const navigate          = useNavigate();

  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState(null);
  const [cancelFor, setCancelFor] = useState(null);   // order being cancelled
  const [cancelling,setCancelling]= useState(false);
  const [toast,     setToast]     = useState('');

  /* fetch orders */
  const loadOrders = async () => {
    try {
      const res  = await fetch(`${API}/orders/my`, { headers: authHeaders() });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, []);

  /* show a toast for 3 s */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  /* cancel API call */
  const handleCancel = async (reason) => {
    if (!cancelFor) return;
    setCancelling(true);
    try {
      const res  = await fetch(`${API}/orders/${cancelFor._id}/cancel`, {
        method:  'PUT',
        headers: authHeaders(),
        body:    JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.ok) {
        // optimistically update local state
        setOrders(prev => prev.map(o =>
          o._id === cancelFor._id
            ? { ...o, orderStatus: 'Cancelled', cancelReason: reason, cancelledAt: new Date().toISOString() }
            : o
        ));
        setCancelFor(null);
        showToast('✅ Order cancelled successfully');
      } else {
        showToast('⚠ ' + (data.msg || 'Cancellation failed'));
        setCancelFor(null);
      }
    } catch {
      showToast('⚠ Network error. Please try again.');
      setCancelFor(null);
    }
    setCancelling(false);
  };

  /* helpers */
  const canCancel = (order) => order.orderStatus === 'Processing';

  const stats = {
    total:     orders.length,
    active:    orders.filter(o => o.orderStatus === 'Processing' || o.orderStatus === 'Shipped').length,
    delivered: orders.filter(o => o.orderStatus === 'Delivered').length,
    cancelled: orders.filter(o => o.orderStatus === 'Cancelled').length,
  };

  /* ─── Render ─── */
  return (
    <>
      <style>{CSS}</style>

      <div className="page">
        <div className="wrap">

          {/* ── Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '1.5rem',
                color: '#fff', marginBottom: 4 }}>
                📦 My Orders
              </h1>
              <p style={{ color: 'rgba(255,255,255,.38)', fontSize: '.82rem' }}>
                {stats.total} order{stats.total !== 1 ? 's' : ''} placed
              </p>
            </div>
            <button onClick={() => navigate('/dashboard')}
              style={{ background: 'rgba(0,229,160,.08)', border: '1px solid rgba(0,229,160,.2)',
                borderRadius: 10, padding: '9px 18px', color: '#00e5a0', cursor: 'pointer',
                fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: '.85rem' }}>
              ← Back to Shop
            </button>
          </div>

          {/* ── Summary pills ── */}
          {!loading && orders.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Total',     val: stats.total,     color: '#6c63ff', bg: 'rgba(108,99,255,.1)' },
                { label: 'Active',    val: stats.active,    color: '#60a5fa', bg: 'rgba(96,165,250,.1)' },
                { label: 'Delivered', val: stats.delivered, color: '#84fab0', bg: 'rgba(132,250,176,.1)' },
                { label: 'Cancelled', val: stats.cancelled, color: '#f5576c', bg: 'rgba(245,87,108,.1)' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}33`,
                  borderRadius: 12, padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ color: s.color, fontWeight: 800, fontSize: '1.1rem',
                    fontFamily: "'Syne',sans-serif" }}>{s.val}</span>
                  <span style={{ color: 'rgba(255,255,255,.5)', fontSize: '.78rem', fontWeight: 500 }}>{s.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Loading ── */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,.3)' }}>
              <div style={{ width: 38, height: 38, border: '3px solid rgba(0,229,160,.18)',
                borderTopColor: '#00e5a0', borderRadius: '50%',
                animation: 'spin .85s linear infinite', margin: '0 auto 13px' }} />
              Loading your orders…
            </div>
          )}

          {/* ── Empty ── */}
          {!loading && orders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '70px 20px', color: 'rgba(255,255,255,.3)' }}>
              <div style={{ fontSize: 50, marginBottom: 14 }}>📭</div>
              <p style={{ fontSize: 16, marginBottom: 14 }}>No orders yet</p>
              <button onClick={() => navigate('/dashboard')}
                style={{ padding: '12px 26px', background: 'linear-gradient(135deg,#00e5a0,#00b87a)',
                  border: 'none', borderRadius: 11, color: '#080c14', fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}>
                Start Shopping
              </button>
            </div>
          )}

          {/* ── Order cards ── */}
          {!loading && orders.map((order, idx) => {
            const isOpen    = expanded === order._id;
            const isCancelled = order.orderStatus === 'Cancelled';

            return (
              <div key={order._id}
                className={`order-card${isCancelled ? ' cancelled' : ''}`}
                style={{ animationDelay: `${idx * 55}ms` }}>

                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>

                  {/* Left: info */}
                  <div>
                    <p style={{ color: '#00e5a0', fontWeight: 700, fontSize: '.95rem',
                      marginBottom: 3, fontFamily: 'monospace', letterSpacing: '.5px' }}>
                      #{order._id?.slice(-8)?.toUpperCase()}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,.42)', fontSize: '.79rem', marginBottom: 3 }}>
                      📅 {new Date(order.createdAt).toLocaleDateString('en-IN',
                        { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.82rem' }}>
                      {order.items?.length} item(s) ·{' '}
                      <strong style={{ color: '#fff', fontFamily: "'Syne',sans-serif" }}>
                        ₹{Number(order.totalPrice).toLocaleString('en-IN')}
                      </strong>{' '}
                      · {order.paymentMethod}
                    </p>
                  </div>

                  {/* Right: badge + buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                    <span className="badge"
                      style={{ background: STATUS_BG[order.orderStatus],
                        color: STATUS_COLOR[order.orderStatus] }}>
                      {order.orderStatus === 'Processing' && '⏳ '}
                      {order.orderStatus === 'Shipped'    && '🚚 '}
                      {order.orderStatus === 'Delivered'  && '✅ '}
                      {order.orderStatus === 'Cancelled'  && '❌ '}
                      {order.orderStatus}
                    </span>

                    {/* Track toggle */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : order._id)}
                      style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)',
                        borderRadius: 8, padding: '6px 12px', color: 'rgba(255,255,255,.7)',
                        cursor: 'pointer', fontSize: '.77rem',
                        fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>
                      {isOpen ? 'Hide ▲' : 'Track ▼'}
                    </button>

                    {/* ── CANCEL BUTTON — only shown for Processing orders ── */}
                    {canCancel(order) && (
                      <button
                        onClick={() => setCancelFor(order)}
                        style={{ background: 'rgba(245,87,108,.08)',
                          border: '1.5px solid rgba(245,87,108,.35)',
                          borderRadius: 8, padding: '6px 14px',
                          color: '#f5576c', cursor: 'pointer',
                          fontSize: '.77rem', fontFamily: "'DM Sans',sans-serif",
                          fontWeight: 700, display: 'flex', alignItems: 'center',
                          gap: 5, transition: 'all .18s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(245,87,108,.15)';
                          e.currentTarget.style.borderColor = '#f5576c';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(245,87,108,.08)';
                          e.currentTarget.style.borderColor = 'rgba(245,87,108,.35)';
                        }}>
                        ✕ Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Item tags */}
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 11 }}>
                  {order.items?.map((item, i) => (
                    <span key={i} style={{ background: 'rgba(255,255,255,.06)',
                      borderRadius: 7, padding: '3px 9px',
                      fontSize: '.76rem', color: 'rgba(255,255,255,.58)' }}>
                      {item.name} ×{item.quantity}
                    </span>
                  ))}
                </div>

                {/* Cancellable hint */}
                {canCancel(order) && (
                  <p style={{ color: 'rgba(253,211,77,.55)', fontSize: '.73rem',
                    marginTop: 9, display: 'flex', alignItems: 'center', gap: 5 }}>
                    ⚠ You can cancel this order as it hasn't shipped yet.
                  </p>
                )}

                {/* Cannot cancel hint for shipped */}
                {order.orderStatus === 'Shipped' && (
                  <p style={{ color: 'rgba(96,165,250,.5)', fontSize: '.73rem',
                    marginTop: 9, display: 'flex', alignItems: 'center', gap: 5 }}>
                    🚚 Order already shipped — cancellation not available.
                  </p>
                )}

                {/* Tracking timeline */}
                {isOpen && <TrackBar order={order} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Cancel Modal ── */}
      {cancelFor && (
        <CancelModal
          order={cancelFor}
          busy={cancelling}
          onClose={() => !cancelling && setCancelFor(null)}
          onConfirm={handleCancel}
        />
      )}

      {/* ── Toast notification ── */}
      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </>
  );
}