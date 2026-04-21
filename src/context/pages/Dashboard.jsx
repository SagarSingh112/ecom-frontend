// src/context/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';

const API = 'http://https://ecom-backend-16sc.onrender.com/api';

const CATS = [
  { id:'All',         icon:'⚡', color:'#8b5cf6', glow:'rgba(139,92,246,0.4)' },
  { id:'Electronics', icon:'💻', color:'#60a5fa', glow:'rgba(96,165,250,0.4)'  },
  { id:'Fashion',     icon:'👗', color:'#f472b6', glow:'rgba(244,114,182,0.4)' },
  { id:'Sports',      icon:'🏋️', color:'#34d399', glow:'rgba(52,211,153,0.4)'  },
  { id:'Home',        icon:'🏠', color:'#fbbf24', glow:'rgba(251,191,36,0.4)'  },
  { id:'Books',       icon:'📚', color:'#a78bfa', glow:'rgba(167,139,250,0.4)' },
  { id:'Toys',        icon:'🎮', color:'#f87171', glow:'rgba(248,113,113,0.4)' },
  { id:'Accessories', icon:'⌚', color:'#00f5a0', glow:'rgba(0,245,160,0.4)'   },
];

// ── SUPPORT CONFIG ────────────────────────────────────────────────────────────
const SUP_CARDS = [
  { id:'track',    emoji:'📦', title:'Track My Order',    desc:'Real-time order status and delivery updates.',   color:'#f59e0b' },
  { id:'returns',  emoji:'↩️', title:'Returns & Refunds', desc:'Hassle-free returns and full refund processing.', color:'#3b82f6' },
  { id:'livechat', emoji:'💬', title:'Live Chat',          desc:'Speak to an agent now. Avg. wait: 2 min.',       color:'#8b5cf6' },
  { id:'email',    emoji:'📧', title:'Email Support',      desc:'Write to us — response within 2 hours.',         color:'#10b981' },
];
const SUP_QUICK = {
  track:    ['Where is my order?', 'My order is delayed', 'Not yet delivered'],
  returns:  ['How do I return?', 'Refund not received', 'Exchange a product'],
  livechat: ['Account issue', 'Product not working', 'General complaint'],
  email:    ['Update my email', 'Password reset', 'Billing issue'],
};
function smartReply(text) {
  const t = text.toLowerCase();
  if (t.includes('hello') || t.includes('hi') || t.includes('hey'))
    return "Hello! 👋 I'm ShopZone's AI assistant. How can I help you today?";
  if (t.includes('track') || (t.includes('where') && t.includes('order')))
    return 'Please share your Order ID (e.g. #ORD-12345) and I will check the delivery status right away!';
  if (t.includes('delayed') || t.includes('late') || t.includes('not arrived'))
    return 'Sorry for the delay! 😔 Please share your Order ID and I will escalate it immediately.';
  if (t.includes('refund') && (t.includes('not') || t.includes('received') || t.includes('pending')))
    return 'Refunds take 5-7 business days after approval. Share your Order ID and I will check the status.';
  if (t.includes('return'))
    return 'Returns accepted within 7 days. Go to Orders → Select item → Click Return. Need help with a specific order?';
  if (t.includes('exchange'))
    return 'Exchanges available within 7 days! Go to Orders → Select item → Exchange. Replacement ships free!';
  if (t.includes('cancel'))
    return 'Orders can be cancelled within 1 hour of placing. After that, please initiate a return instead.';
  if (t.includes('payment') || t.includes('billing') || t.includes('charge'))
    return 'For billing issues, share your Order ID and the amount charged. I will verify and fix it right away!';
  if (t.includes('password') || t.includes('login'))
    return 'Click Forgot Password on the login page and enter your registered email. Reset link arrives in 2 minutes!';
  if (t.includes('account') || t.includes('profile'))
    return 'For account issues go to Profile → Settings. If locked out, use Forgot Password. Need more help?';
  if (t.includes('broken') || t.includes('damage') || t.includes('defect') || t.includes('not working'))
    return 'So sorry! 😟 Email photos to support@shopzone.com with your Order ID. We will send a replacement or full refund within 24 hours.';
  if (t.includes('thank'))
    return 'You are welcome! 😊 Is there anything else I can help you with?';
  return 'I understand your concern! 🤝 Could you share your Order ID or more details so I can help you better?';
}
async function getAIResponse(messages) {
  try {
    const res = await fetch('/api/support/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error('err');
    const data = await res.json();
    if (data.reply) return data.reply;
    throw new Error('no reply');
  } catch {
    const last = messages[messages.length - 1]?.content || '';
    return smartReply(last);
  }
}

// ── CHAT WINDOW COMPONENT ─────────────────────────────────────────────────────
function ChatWindow({ card, onClose }) {
  const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [messages, setMessages] = useState([{
    id: 1, role: 'assistant',
    text: `Hi! 👋 I am ShopZone's AI assistant here to help with "${card.title}". What is your concern?`,
    time: getTime(),
  }]);
  const [input, setInput]         = useState('');
  const [typing, setTyping]       = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef                 = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || typing) return;
    setInput('');
    setShowQuick(false);
    const userMsg = { id: Date.now(), role: 'user', text: msg, time: getTime() };
    setMessages(p => [...p, userMsg]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 900));
    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.text }));
    const reply   = await getAIResponse(history);
    setTyping(false);
    setMessages(p => [...p, { id: Date.now()+1, role: 'assistant', text: reply, time: getTime() }]);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(0,0,0,0.65)', backdropFilter:'blur(4px)',
        display:'flex', alignItems:'flex-end', justifyContent:'flex-end',
        padding:'24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:390, height:560, background:'#13131f',
          border:'1px solid rgba(255,255,255,0.1)', borderRadius:20,
          boxShadow:'0 32px 80px rgba(0,0,0,0.7)',
          display:'flex', flexDirection:'column', overflow:'hidden',
          animation:'chatSlide 0.3s ease',
        }}
      >
        {/* Header */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px 16px',
          background:`linear-gradient(135deg,${card.color}25,transparent)`,
          borderBottom:'1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:40, height:40, borderRadius:12, fontSize:20,
              background:`${card.color}20`, border:`1px solid ${card.color}40`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>🤖</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'#f1f5f9' }}>ShopZone AI Support</div>
              <div style={{ fontSize:11, color:'#10b981', display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', display:'inline-block' }}/>
                Online · Replies instantly
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            width:30, height:30, borderRadius:8, border:'none',
            background:'rgba(255,255,255,0.07)', color:'#94a3b8',
            cursor:'pointer', fontSize:16, fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{
          flex:1, overflowY:'auto', padding:'14px 14px 4px',
          display:'flex', flexDirection:'column', gap:10, scrollbarWidth:'none',
        }}>
          {messages.map(m => {
            const isUser = m.role === 'user';
            return (
              <div key={m.id} style={{ display:'flex', flexDirection:'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth:'82%', padding:'9px 13px',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isUser ? card.color : 'rgba(255,255,255,0.07)',
                  border: isUser ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  fontSize:13.5, lineHeight:1.55, color: isUser ? '#fff' : '#e2e8f0',
                }}>{m.text}</div>
                <div style={{ fontSize:10.5, color:'#475569', marginTop:3, display:'flex', gap:4, alignItems:'center' }}>
                  {!isUser && <span>🤖</span>}
                  <span>{m.time}</span>
                  {isUser && <span style={{ color: card.color }}>✓✓</span>}
                </div>
              </div>
            );
          })}
          {typing && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
              <div style={{
                padding:'10px 14px', borderRadius:'16px 16px 16px 4px',
                background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.08)',
                display:'flex', gap:5, alignItems:'center',
              }}>
                {[0, 0.18, 0.36].map((d, i) => (
                  <div key={i} style={{
                    width:7, height:7, borderRadius:'50%', background:'#64748b',
                    animation:`typingBounce 1.1s ${d}s infinite`,
                  }}/>
                ))}
              </div>
              <div style={{ fontSize:10.5, color:'#475569', marginTop:3 }}>🤖 typing...</div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Quick Replies */}
        {showQuick && (
          <div style={{
            padding:'8px 12px', borderTop:'1px solid rgba(255,255,255,0.05)',
            display:'flex', gap:6, flexWrap:'wrap',
          }}>
            {(SUP_QUICK[card.id] || SUP_QUICK.livechat).map(qr => (
              <button key={qr} onClick={() => send(qr)} style={{
                padding:'5px 10px', borderRadius:999, cursor:'pointer',
                background:`${card.color}15`, border:`1px solid ${card.color}40`,
                color:card.color, fontSize:11.5, fontWeight:500,
              }}>{qr}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          padding:'10px 12px', borderTop:'1px solid rgba(255,255,255,0.06)',
          display:'flex', gap:8, alignItems:'center',
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your message..."
            autoFocus
            style={{
              flex:1, padding:'9px 13px', borderRadius:10, fontSize:13.5,
              background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
              color:'#e2e8f0', outline:'none', fontFamily:'inherit',
            }}
          />
          <button onClick={() => send()} style={{
            width:40, height:40, borderRadius:10, flexShrink:0,
            background:card.color, border:'none', color:'#fff',
            fontSize:17, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>➤</button>
        </div>
      </div>

      <style>{`
        @keyframes chatSlide {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes typingBounce {
          0%,60%,100% { transform:translateY(0); }
          30%          { transform:translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&family=Syne:wght@400;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:#07071a; --bg1:#0d0d22; --bg2:#12122b; --bg3:#191932; --bg4:#1f1f3a;
  --b:rgba(255,255,255,0.07); --b2:rgba(255,255,255,0.12); --b3:rgba(255,255,255,0.18);
  --txt:#eeeeff; --muted:rgba(200,200,255,0.42); --muted2:rgba(200,200,255,0.65);
  --green:#00f5a0; --green2:#00c97a; --purple:#8b5cf6; --purple2:#6d35e8;
  --pink:#f472b6; --amber:#fbbf24; --red:#f87171; --blue:#60a5fa;
}
body{background:var(--bg);font-family:'Nunito',sans-serif;}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:var(--bg1)}
::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:99px}
.d-root{min-height:100vh;background:var(--bg);color:var(--txt);font-family:'Nunito',sans-serif;position:relative;overflow-x:hidden}
.d-root::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse 70% 55% at 10% -5%,rgba(139,92,246,0.14) 0%,transparent 60%),radial-gradient(ellipse 55% 45% at 95% 100%,rgba(0,245,160,0.1) 0%,transparent 55%);pointer-events:none;z-index:0}
.d-nav{position:sticky;top:0;z-index:500;height:62px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 28px;background:rgba(7,7,26,0.78);backdrop-filter:blur(32px) saturate(1.5);border-bottom:1px solid var(--b2);flex-wrap:nowrap}
.d-brand{font-family:'Syne',sans-serif;font-size:21px;font-weight:800;letter-spacing:-0.5px;background:linear-gradient(135deg,#fff 0%,var(--green) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;white-space:nowrap;user-select:none;flex-shrink:0}
.d-tabs{display:flex;background:var(--bg2);border:1px solid var(--b2);border-radius:12px;padding:4px;gap:3px}
.d-tab{padding:7px 20px;border:none;border-radius:9px;cursor:pointer;font-family:'Nunito',sans-serif;font-size:13.5px;font-weight:700;transition:all .22s;background:transparent;color:var(--muted2);white-space:nowrap}
.d-tab.on{background:linear-gradient(135deg,var(--purple),var(--purple2));color:#fff;box-shadow:0 4px 18px rgba(139,92,246,0.4)}
.d-nav-r{display:flex;align-items:center;gap:9px;flex-shrink:0}
.d-greet{font-size:13px;color:var(--muted2);font-weight:600;white-space:nowrap;padding-right:4px}
.d-greet em{color:var(--green);font-style:normal}
.d-nbtn{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;border:1px solid var(--b2);background:var(--bg2);color:var(--txt);font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap}
.d-nbtn:hover{border-color:var(--purple);background:rgba(139,92,246,0.1)}
.d-nbtn.cart{background:linear-gradient(135deg,var(--green),var(--green2));border-color:transparent;color:#07071a;font-weight:800}
.d-nbtn.cart:hover{transform:translateY(-1px);box-shadow:0 6px 22px rgba(0,245,160,0.3)}
.d-nbtn.wish{border-color:rgba(244,114,182,0.35);color:var(--pink);background:rgba(244,114,182,0.07)}
.d-nbtn.wish:hover{background:rgba(244,114,182,0.15);border-color:var(--pink)}
.d-nbtn.out{border-color:rgba(248,113,113,0.3);color:var(--red);background:rgba(248,113,113,0.07)}
.d-nbtn.out:hover{background:rgba(248,113,113,0.15);border-color:var(--red)}
.d-badge{background:#ef4444;color:#fff;border-radius:99px;padding:1px 7px;font-size:11px;font-weight:800;min-width:20px;text-align:center;animation:popIn .3s cubic-bezier(.34,1.56,.64,1)}
.d-badge.pink{background:var(--pink)}
@keyframes popIn{from{transform:scale(0)}to{transform:scale(1)}}
.d-toast{position:fixed;top:76px;right:22px;z-index:1100;display:flex;align-items:center;gap:10px;border-radius:13px;padding:13px 20px;font-weight:700;font-size:14px;backdrop-filter:blur(24px);animation:slideR .3s cubic-bezier(.34,1.56,.64,1);max-width:320px}
.d-toast.green{background:rgba(0,245,160,0.1);border:1px solid rgba(0,245,160,0.32);color:var(--green);box-shadow:0 8px 32px rgba(0,245,160,0.15)}
.d-toast.pink{background:rgba(244,114,182,0.1);border:1px solid rgba(244,114,182,0.32);color:var(--pink);box-shadow:0 8px 32px rgba(244,114,182,0.15)}
@keyframes slideR{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
.d-main{position:relative;z-index:1;max-width:1400px;margin:0 auto;padding:28px 24px 70px}
.d-hero{position:relative;overflow:hidden;border-radius:22px;border:1px solid rgba(139,92,246,0.25);background:linear-gradient(135deg,rgba(139,92,246,0.15) 0%,rgba(109,53,232,0.08) 40%,rgba(0,245,160,0.07) 100%);padding:32px 36px;margin-bottom:28px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
.d-hero::before{content:'';position:absolute;top:-80px;right:-80px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(139,92,246,0.22),transparent 70%);pointer-events:none}
.d-hero::after{content:'';position:absolute;bottom:-60px;right:160px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(0,245,160,0.15),transparent 70%);pointer-events:none}
.d-hero-pill{display:inline-flex;align-items:center;gap:7px;background:rgba(0,245,160,0.1);border:1px solid rgba(0,245,160,0.28);border-radius:99px;padding:5px 14px;font-size:12px;font-weight:800;color:var(--green);margin-bottom:13px;letter-spacing:.4px;text-transform:uppercase}
.d-pill-dot{width:7px;height:7px;border-radius:50%;background:var(--green);animation:blink 1.6s ease infinite}
@keyframes blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.4)}}
.d-hero-h{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;line-height:1.2;letter-spacing:-0.5px;margin-bottom:8px}
.d-hero-h span{color:var(--green)}
.d-hero-sub{color:var(--muted2);font-size:14px;font-weight:500;line-height:1.6}
.d-hero-stats{display:flex;gap:12px;flex-wrap:wrap;position:relative;z-index:1}
.d-stat{background:rgba(255,255,255,0.04);border:1px solid var(--b2);border-radius:16px;padding:18px 24px;text-align:center;min-width:90px;transition:all .2s;cursor:default}
.d-stat:hover{border-color:rgba(139,92,246,0.4);transform:translateY(-2px)}
.d-stat-v{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:var(--green);line-height:1}
.d-stat-l{font-size:11px;color:var(--muted);margin-top:5px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.d-srch-wrap{position:relative;margin-bottom:28px}
.d-srch-ic{position:absolute;left:17px;top:50%;transform:translateY(-50%);font-size:16px;pointer-events:none}
.d-srch{width:100%;padding:14px 18px 14px 50px;background:var(--bg2);border:1.5px solid var(--b2);border-radius:14px;color:var(--txt);font-family:'Nunito',sans-serif;font-size:15px;font-weight:500;outline:none;transition:border-color .2s,box-shadow .2s}
.d-srch:focus{border-color:var(--purple);box-shadow:0 0 0 3px rgba(139,92,246,0.14)}
.d-srch::placeholder{color:var(--muted)}
.cg-section{margin-bottom:30px}
.cg-label{font-size:11px;text-transform:uppercase;letter-spacing:1.8px;color:rgba(200,200,255,0.32);font-weight:700;margin-bottom:14px}
.cg-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:10px}
@media(max-width:1100px){.cg-grid{grid-template-columns:repeat(4,1fr);gap:10px}}
@media(max-width:600px){.cg-grid{grid-template-columns:repeat(4,1fr);gap:8px}}
@media(max-width:380px){.cg-grid{grid-template-columns:repeat(2,1fr)}}
.cg-card{display:flex;flex-direction:column;align-items:center;gap:10px;padding:16px 8px 15px;border-radius:18px;border:1.5px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);cursor:pointer;position:relative;overflow:hidden;transition:transform .26s cubic-bezier(.34,1.3,.64,1),border-color .26s,box-shadow .26s,background .26s;user-select:none}
.cg-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cc,#8b5cf6),transparent);opacity:0;transition:opacity .26s}
.cg-card:hover::before,.cg-card.on::before{opacity:1}
.cg-card:hover{transform:translateY(-6px) scale(1.03);border-color:color-mix(in srgb,var(--cc,#8b5cf6) 50%,transparent);background:color-mix(in srgb,var(--cc,#8b5cf6) 9%,transparent);box-shadow:0 14px 36px var(--cg,rgba(139,92,246,0.35))}
.cg-card.on{transform:translateY(-6px) scale(1.04);border-color:color-mix(in srgb,var(--cc,#8b5cf6) 65%,transparent);background:color-mix(in srgb,var(--cc,#8b5cf6) 14%,transparent);box-shadow:0 16px 40px var(--cg,rgba(139,92,246,0.4))}
.cg-ring{width:50px;height:50px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);transition:all .26s}
.cg-card:hover .cg-ring,.cg-card.on .cg-ring{background:color-mix(in srgb,var(--cc,#8b5cf6) 22%,transparent);border-color:color-mix(in srgb,var(--cc,#8b5cf6) 55%,transparent);box-shadow:0 0 22px var(--cg,rgba(139,92,246,0.35)),inset 0 0 14px color-mix(in srgb,var(--cc,#8b5cf6) 15%,transparent);transform:scale(1.1)}
.cg-ico{font-size:24px;line-height:1}
.cg-name{font-size:11.5px;font-weight:700;color:rgba(200,200,255,0.5);text-align:center;transition:color .22s;white-space:nowrap}
.cg-card:hover .cg-name{color:rgba(255,255,255,0.85)}
.cg-card.on .cg-name{color:var(--cc,#8b5cf6);font-weight:800}
.cg-dot{position:absolute;bottom:7px;width:5px;height:5px;border-radius:50%;background:var(--cc,#8b5cf6);box-shadow:0 0 8px var(--cc,#8b5cf6);animation:dotPop .3s cubic-bezier(.34,1.56,.64,1)}
@keyframes dotPop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
.d-sec-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.d-sec-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;letter-spacing:-0.3px}
.d-sec-cnt{font-size:13px;color:var(--muted);font-weight:600}
.d-skel-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:18px}
.d-skel-card{background:var(--bg2);border:1.5px solid var(--b);border-radius:18px;overflow:hidden}
.d-skel-img{height:180px;background:var(--bg3)}
.d-skel-body{padding:14px}
.d-skel-line{height:12px;border-radius:6px;background:linear-gradient(90deg,var(--bg3) 25%,rgba(255,255,255,0.03) 50%,var(--bg3) 75%);background-size:200% 100%;animation:shim 1.5s infinite;margin-bottom:10px}
.d-skel-line.s60{width:60%}.d-skel-line.s45{width:45%}.d-skel-line.s80{width:80%}
@keyframes shim{0%{background-position:200% 0}100%{background-position:-200% 0}}
.d-empty{text-align:center;padding:90px 20px}
.d-empty-icon{font-size:64px;margin-bottom:18px;opacity:.5}
.d-empty h3{font-size:20px;font-weight:800;color:var(--muted2);margin-bottom:8px}
.d-empty p{color:var(--muted);font-size:14px}
.d-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(212px,1fr));gap:18px}
.d-card{background:var(--bg2);border:1.5px solid var(--b);border-radius:18px;overflow:hidden;display:flex;flex-direction:column;transition:transform .22s ease,box-shadow .22s ease,border-color .22s;position:relative}
.d-card:hover{transform:translateY(-7px);box-shadow:0 24px 52px rgba(0,0,0,0.48);border-color:rgba(139,92,246,0.38)}
.d-card-iw{position:relative;overflow:hidden;height:180px;background:var(--bg3);flex-shrink:0;cursor:pointer}
.d-card-iw img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease;display:block}
.d-card:hover .d-card-iw img{transform:scale(1.08)}
.d-card-iw::after{content:'';position:absolute;bottom:0;left:0;right:0;height:55px;background:linear-gradient(to top,rgba(18,18,43,0.7),transparent);pointer-events:none}
.d-off{position:absolute;top:10px;left:10px;background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;border-radius:8px;padding:4px 9px;font-size:11px;font-weight:800;z-index:1}
.d-stk{position:absolute;top:10px;right:10px;border-radius:8px;padding:4px 9px;font-size:10px;font-weight:800;letter-spacing:.3px;z-index:1}
.d-stk.in{background:rgba(0,245,160,0.12);color:var(--green);border:1px solid rgba(0,245,160,0.28)}
.d-stk.out{background:rgba(248,113,113,0.12);color:var(--red);border:1px solid rgba(248,113,113,0.28)}
.d-wish-btn{position:absolute;bottom:10px;right:10px;z-index:2;width:30px;height:30px;border-radius:50%;border:none;background:rgba(7,7,26,0.75);backdrop-filter:blur(8px);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;transition:all .2s;opacity:0}
.d-card:hover .d-wish-btn{opacity:1}
.d-wish-btn:hover{transform:scale(1.2)}
.d-wish-btn.wishlisted{opacity:1;background:rgba(244,114,182,0.2);border:1px solid rgba(244,114,182,0.4)}
.d-view-hint{position:absolute;inset:0;background:rgba(7,7,26,0.55);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .22s;z-index:1;cursor:pointer}
.d-card-iw:hover .d-view-hint{opacity:1}
.d-view-hint span{background:rgba(255,255,255,0.12);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);color:#fff;border-radius:99px;padding:8px 18px;font-size:12.5px;font-weight:700;pointer-events:none}
.d-card-body{padding:14px 14px 15px;flex:1;display:flex;flex-direction:column}
.d-pname{font-size:14px;font-weight:700;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--txt);cursor:pointer}
.d-pname:hover{color:var(--purple)}
.d-pbrand{font-size:11.5px;color:var(--muted);margin-bottom:6px;font-weight:500}
.d-pstars{font-size:11px;color:#fbbf24;margin-bottom:8px}
.d-pstars span{color:var(--muted);font-size:10px;margin-left:3px}
.d-prow{display:flex;align-items:baseline;gap:7px;margin-bottom:11px;flex-wrap:wrap;margin-top:auto}
.d-pprice{font-size:18px;font-weight:800;color:var(--green)}
.d-porig{font-size:12px;color:var(--muted);text-decoration:line-through}
.d-psave{font-size:11px;color:var(--amber);font-weight:700;background:rgba(251,191,36,0.1);border-radius:6px;padding:2px 7px}
.d-addbtn{width:100%;padding:11px;border:none;border-radius:11px;font-family:'Nunito',sans-serif;font-size:13.5px;font-weight:800;cursor:pointer;transition:all .2s}
.d-addbtn.avail{background:linear-gradient(135deg,var(--purple),var(--purple2));color:#fff}
.d-addbtn.avail:hover{transform:translateY(-1px);box-shadow:0 6px 22px rgba(139,92,246,0.4)}
.d-addbtn.incart{background:rgba(0,245,160,0.12);border:1.5px solid rgba(0,245,160,0.3);color:var(--green)}
.d-addbtn.gone{background:var(--bg3);color:var(--muted);cursor:not-allowed}
.pm-backdrop{position:fixed;inset:0;z-index:800;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.pm-box{background:var(--bg1);border:1px solid var(--b2);border-radius:24px;max-width:860px;width:100%;max-height:90vh;overflow-y:auto;animation:popUp .3s cubic-bezier(.34,1.2,.64,1);position:relative}
@keyframes popUp{from{transform:scale(.88) translateY(30px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
.pm-close{position:absolute;top:16px;right:16px;z-index:2;width:36px;height:36px;border-radius:10px;border:1px solid var(--b2);background:var(--bg2);color:var(--txt);cursor:pointer;font-size:17px;display:grid;place-items:center;transition:all .18s}
.pm-close:hover{border-color:var(--red);color:var(--red)}
.pm-inner{display:grid;grid-template-columns:1fr 1fr;min-height:400px}
@media(max-width:660px){.pm-inner{grid-template-columns:1fr}}
.pm-img-col{position:relative;background:var(--bg3);border-radius:24px 0 0 24px;overflow:hidden;min-height:340px}
@media(max-width:660px){.pm-img-col{border-radius:24px 24px 0 0;min-height:220px}}
.pm-img-col img{width:100%;height:100%;object-fit:cover}
.pm-img-badges{position:absolute;top:14px;left:14px;display:flex;flex-direction:column;gap:6px}
.pm-info-col{padding:28px 28px 24px;display:flex;flex-direction:column;gap:14px;overflow-y:auto}
.pm-cat-chip{display:inline-flex;align-items:center;gap:5px;background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.25);border-radius:99px;padding:4px 12px;font-size:11px;font-weight:700;color:var(--purple);width:fit-content;text-transform:uppercase;letter-spacing:.5px}
.pm-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;line-height:1.25;color:var(--txt)}
.pm-brand-row{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--muted2);font-weight:600}
.pm-stars-row{display:flex;align-items:center;gap:8px}
.pm-stars{font-size:16px;color:#fbbf24;letter-spacing:1px}
.pm-rating-val{font-size:13px;color:var(--muted2);font-weight:600}
.pm-price-row{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.pm-price{font-family:'Syne',sans-serif;font-size:30px;font-weight:800;color:var(--green)}
.pm-orig{font-size:16px;color:var(--muted);text-decoration:line-through}
.pm-save{background:linear-gradient(135deg,rgba(251,191,36,0.15),rgba(251,191,36,0.08));border:1px solid rgba(251,191,36,0.25);color:var(--amber);border-radius:8px;padding:4px 10px;font-size:12px;font-weight:800}
.pm-desc-label{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);font-weight:700;margin-bottom:4px}
.pm-desc{font-size:13.5px;color:var(--muted2);line-height:1.75;font-weight:400}
.pm-meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pm-meta-card{background:var(--bg2);border:1px solid var(--b);border-radius:11px;padding:11px 13px}
.pm-meta-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);font-weight:700;margin-bottom:3px}
.pm-meta-val{font-size:13px;font-weight:700;color:var(--txt)}
.pm-meta-val.green{color:var(--green)}
.pm-meta-val.red{color:var(--red)}
.pm-actions{display:flex;flex-direction:column;gap:8px;margin-top:auto}
.pm-add-btn{width:100%;padding:14px;border:none;border-radius:13px;font-family:'Nunito',sans-serif;font-size:15px;font-weight:900;cursor:pointer;transition:all .22s;display:flex;align-items:center;justify-content:center;gap:8px}
.pm-add-btn.avail{background:linear-gradient(135deg,var(--purple),var(--purple2));color:#fff}
.pm-add-btn.avail:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(139,92,246,0.4)}
.pm-add-btn.incart{background:rgba(0,245,160,0.12);border:1.5px solid rgba(0,245,160,0.3);color:var(--green)}
.pm-add-btn.gone{background:var(--bg3);color:var(--muted);cursor:not-allowed}
.pm-wish-btn{width:100%;padding:12px;border-radius:13px;font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;cursor:pointer;transition:all .22s;display:flex;align-items:center;justify-content:center;gap:8px;background:transparent;border:1.5px solid rgba(244,114,182,0.3);color:var(--pink)}
.pm-wish-btn:hover{background:rgba(244,114,182,0.1);border-color:var(--pink)}
.pm-wish-btn.wishlisted{background:rgba(244,114,182,0.12);border-color:var(--pink)}
.wl-drawer{position:fixed;top:0;right:0;bottom:0;width:400px;max-width:95vw;background:var(--bg1);border-left:1px solid var(--b2);display:flex;flex-direction:column;z-index:700;animation:slideIn .3s cubic-bezier(.34,1.1,.64,1)}
@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
.wl-head{padding:20px 20px 16px;border-bottom:1px solid var(--b);display:flex;align-items:center;justify-content:space-between}
.wl-head h2{font-family:'Syne',sans-serif;font-size:19px;font-weight:800;display:flex;align-items:center;gap:8px}
.wl-close{width:34px;height:34px;border-radius:10px;border:1px solid var(--b2);background:var(--bg2);color:var(--txt);cursor:pointer;font-size:16px;display:grid;place-items:center;transition:all .18s}
.wl-close:hover{border-color:var(--red);color:var(--red)}
.wl-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:0}
.wl-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:var(--muted);text-align:center}
.wl-item{display:flex;gap:12px;padding:13px 0;border-bottom:1px solid var(--b);animation:fadeIn .2s ease}
.wl-item:last-child{border-bottom:none}
.wl-img{width:64px;height:64px;border-radius:11px;object-fit:cover;flex-shrink:0;background:var(--bg3);cursor:pointer}
.wl-info{flex:1;min-width:0}
.wl-name{font-size:13.5px;font-weight:700;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;color:var(--txt)}
.wl-name:hover{color:var(--purple)}
.wl-price{font-size:14px;font-weight:800;color:var(--green);margin-bottom:8px}
.wl-item-actions{display:flex;gap:7px}
.wl-add{flex:1;padding:7px 10px;border:none;border-radius:8px;font-family:'Nunito',sans-serif;font-size:12px;font-weight:800;cursor:pointer;background:linear-gradient(135deg,var(--purple),var(--purple2));color:#fff;transition:all .2s}
.wl-add:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(139,92,246,0.4)}
.wl-rm{padding:7px 10px;border:1px solid rgba(248,113,113,0.3);border-radius:8px;font-size:12px;font-weight:700;background:transparent;color:var(--red);cursor:pointer;transition:all .2s;font-family:'Nunito',sans-serif}
.wl-rm:hover{background:rgba(248,113,113,0.1);border-color:var(--red)}
.d-cart-back{position:fixed;inset:0;z-index:600;background:rgba(0,0,0,0.72);backdrop-filter:blur(5px);animation:fadeIn .2s ease}
.d-drawer{position:fixed;top:0;right:0;bottom:0;width:400px;max-width:95vw;background:var(--bg1);border-left:1px solid var(--b2);display:flex;flex-direction:column;z-index:601;animation:slideIn .3s cubic-bezier(.34,1.1,.64,1)}
.d-draw-hd{padding:20px 20px 16px;border-bottom:1px solid var(--b);display:flex;align-items:center;justify-content:space-between}
.d-draw-hd h2{font-family:'Syne',sans-serif;font-size:19px;font-weight:800;display:flex;align-items:center;gap:8px}
.d-draw-cls{width:34px;height:34px;border-radius:10px;border:1px solid var(--b2);background:var(--bg2);color:var(--txt);cursor:pointer;font-size:16px;display:grid;place-items:center;transition:all .18s}
.d-draw-cls:hover{border-color:var(--red);color:var(--red)}
.d-draw-body{flex:1;overflow-y:auto;padding:16px}
.d-cart-empty{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:var(--muted)}
.d-citem{display:flex;gap:12px;padding:13px 0;border-bottom:1px solid var(--b);animation:fadeIn .2s ease}
.d-citem:last-child{border-bottom:none}
.d-cimg{width:62px;height:62px;border-radius:11px;object-fit:cover;flex-shrink:0;background:var(--bg3)}
.d-cinfo{flex:1;min-width:0}
.d-cname{font-size:13.5px;font-weight:700;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.d-cprice{font-size:15px;font-weight:800;color:var(--green);margin-bottom:9px}
.d-crow{display:flex;align-items:center;gap:8px}
.d-qbtn{width:28px;height:28px;border-radius:7px;border:1px solid var(--b2);background:var(--bg2);color:var(--txt);cursor:pointer;font-size:16px;font-weight:700;display:grid;place-items:center;transition:all .15s}
.d-qbtn:hover{border-color:var(--purple);background:rgba(139,92,246,0.14)}
.d-qval{font-size:14px;font-weight:800;min-width:24px;text-align:center}
.d-rmbtn{margin-left:auto;background:none;border:none;color:rgba(248,113,113,0.5);cursor:pointer;padding:4px 6px;border-radius:7px;font-size:16px;transition:all .15s;display:grid;place-items:center}
.d-rmbtn:hover{color:var(--red);background:rgba(248,113,113,0.1)}
.d-draw-ft{padding:18px 20px;border-top:1px solid var(--b2);background:var(--bg2)}
.d-trow{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
.d-tlbl{font-size:13px;color:var(--muted2);font-weight:600}
.d-tsub{font-size:11.5px;color:var(--muted);margin-top:3px}
.d-tval{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:var(--green)}
.d-chkbtn{width:100%;padding:15px;background:linear-gradient(135deg,var(--green),var(--green2));border:none;border-radius:13px;color:#07071a;font-family:'Nunito',sans-serif;font-size:15px;font-weight:900;cursor:pointer;transition:all .22s;display:flex;align-items:center;justify-content:center;gap:8px}
.d-chkbtn:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,245,160,0.32)}
.d-cnote{font-size:11.5px;color:var(--muted);text-align:center;margin-top:10px}
@media(max-width:860px){.d-nav{padding:10px 16px;height:auto;flex-wrap:wrap}.d-hero{flex-direction:column;padding:22px 20px}.d-hero-stats{justify-content:flex-start}.d-main{padding:16px 14px 50px}.d-brand{font-size:18px}.d-hero-h{font-size:22px}}
@media(max-width:520px){.d-tabs,.d-nav-r{gap:6px}.d-tab{padding:6px 12px;font-size:12px}.d-nbtn{padding:7px 12px;font-size:12px}}
`;

/* ─── Product Detail Modal ─── */
function ProductModal({ p, onClose, onAddCart, onWishlist, isWishlisted, inCart }) {
  const saved   = p.originalPrice && p.originalPrice > p.price ? Math.round(p.originalPrice - p.price) : 0;
  const stars   = '★'.repeat(Math.min(5, Math.round(p.rating || 0))) + '☆'.repeat(5 - Math.min(5, Math.round(p.rating || 0)));
  const catInfo = CATS.find(c => c.id === p.category) || CATS[0];
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);
  return (
    <div className="pm-backdrop" onClick={handleBackdrop}>
      <div className="pm-box">
        <button className="pm-close" onClick={onClose}>✕</button>
        <div className="pm-inner">
          <div className="pm-img-col">
            <img src={p.images?.[0] || `https://placehold.co/500x500/191932/555?text=${encodeURIComponent(p.name?.slice(0,10)||'Product')}`} alt={p.name} onError={e=>{e.target.src='https://placehold.co/500x500/191932/555?text=Product';}}/>
            <div className="pm-img-badges">
              {p.discount > 0 && <span style={{background:'linear-gradient(135deg,#ef4444,#b91c1c)',color:'#fff',borderRadius:8,padding:'5px 10px',fontSize:12,fontWeight:800}}>{p.discount}% OFF</span>}
              <span style={{background:p.stock>0?'rgba(0,245,160,0.15)':'rgba(248,113,113,0.15)',color:p.stock>0?'var(--green)':'var(--red)',border:`1px solid ${p.stock>0?'rgba(0,245,160,0.3)':'rgba(248,113,113,0.3)'}`,borderRadius:8,padding:'5px 10px',fontSize:11,fontWeight:800}}>
                {p.stock > 0 ? `● In Stock (${p.stock})` : '✕ Sold Out'}
              </span>
            </div>
          </div>
          <div className="pm-info-col">
            <div className="pm-cat-chip"><span>{catInfo.icon}</span>{p.category||'General'}</div>
            <div className="pm-title">{p.name}</div>
            {p.brand && <div className="pm-brand-row">By <strong style={{color:'var(--txt)'}}>{p.brand}</strong></div>}
            {p.numReviews>0 && <div className="pm-stars-row"><span className="pm-stars">{stars}</span><span className="pm-rating-val">{(p.rating||0).toFixed(1)} · {p.numReviews} review{p.numReviews!==1?'s':''}</span></div>}
            <div className="pm-price-row">
              <span className="pm-price">₹{p.price?.toLocaleString('en-IN')}</span>
              {p.originalPrice&&p.originalPrice>p.price&&<span className="pm-orig">₹{p.originalPrice?.toLocaleString('en-IN')}</span>}
              {saved>0&&<span className="pm-save">You save ₹{saved.toLocaleString('en-IN')}</span>}
            </div>
            <div><div className="pm-desc-label">Description</div><div className="pm-desc">{p.description||`${p.name} by ${p.brand||'the brand'} is a premium quality product in the ${p.category||'General'} category.`}</div></div>
            <div className="pm-meta-grid">
              <div className="pm-meta-card"><div className="pm-meta-lbl">Category</div><div className="pm-meta-val">{p.category||'—'}</div></div>
              <div className="pm-meta-card"><div className="pm-meta-lbl">Brand</div><div className="pm-meta-val">{p.brand||'—'}</div></div>
              <div className="pm-meta-card"><div className="pm-meta-lbl">Stock</div><div className={`pm-meta-val ${p.stock>0?'green':'red'}`}>{p.stock>0?`${p.stock} units`:'Out of Stock'}</div></div>
              <div className="pm-meta-card"><div className="pm-meta-lbl">Rating</div><div className="pm-meta-val">⭐ {(p.rating||0).toFixed(1)} / 5</div></div>
            </div>
            <div className="pm-actions">
              <button className={`pm-add-btn ${p.stock===0?'gone':inCart?'incart':'avail'}`} onClick={()=>{if(p.stock>0)onAddCart(p);}} disabled={p.stock===0}>
                {p.stock===0?'✕ Out of Stock':inCart?`✓ In Cart (${inCart.quantity}) — Add More`:'🛒 Add to Cart'}
              </button>
              <button className={`pm-wish-btn ${isWishlisted?'wishlisted':''}`} onClick={()=>onWishlist(p)}>
                {isWishlisted?'💖 Remove from Wishlist':'🤍 Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Wishlist Drawer ─── */
function WishlistDrawer({ items, onClose, onRemove, onAddCart, onViewProduct }) {
  return (
    <>
      <div style={{position:'fixed',inset:0,zIndex:699,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(4px)'}} onClick={onClose}/>
      <div className="wl-drawer">
        <div className="wl-head">
          <h2>💖 Wishlist <span style={{fontSize:14,fontWeight:500,color:'var(--muted)',marginLeft:4}}>({items.length})</span></h2>
          <button className="wl-close" onClick={onClose}>✕</button>
        </div>
        <div className="wl-body">
          {items.length===0?(
            <div className="wl-empty">
              <div style={{fontSize:52,opacity:.4}}>🤍</div>
              <p style={{fontWeight:700,color:'var(--muted2)',fontSize:15}}>Your wishlist is empty</p>
              <p style={{fontSize:13,color:'var(--muted)'}}>Click ♡ on any product to save it</p>
            </div>
          ):items.map(item=>(
            <div className="wl-item" key={item._id}>
              <img className="wl-img" src={item.images?.[0]||'https://placehold.co/64x64/191932/555?text=P'} alt={item.name} onClick={()=>{onClose();onViewProduct(item);}} onError={e=>{e.target.src='https://placehold.co/64x64/191932/555?text=P';}}/>
              <div className="wl-info">
                <div className="wl-name" onClick={()=>{onClose();onViewProduct(item);}}>{item.name}</div>
                <div className="wl-price">₹{item.price?.toLocaleString('en-IN')}</div>
                <div className="wl-item-actions">
                  <button className="wl-add" onClick={()=>onAddCart(item)}>＋ Add to Cart</button>
                  <button className="wl-rm" onClick={()=>onRemove(item._id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Main Dashboard ─── */
export default function Dashboard() {
  const { user, logout }    = useAuth();
  const { cartItems, addToCart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
  const navigate             = useNavigate();

  const [tab,        setTab]       = useState('shop');
  const [products,   setProducts]  = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [cat,        setCat]       = useState('All');
  const [search,     setSearch]    = useState('');
  const [showCart,   setShowCart]  = useState(false);
  const [toast,      setToast]     = useState({ msg:'', type:'green' });
  const [wishlist,   setWishlist]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('sz_wishlist') || '[]'); } catch { return []; }
  });
  const [showWish,   setShowWish]  = useState(false);
  const [detailProd, setDetailProd]= useState(null);

  // ── SUPPORT CHAT STATE ─────────────────────────────────────────────────────
  const [activeChat, setActiveChat] = useState(null); // which card is open
  const activeChatCard = SUP_CARDS.find(c => c.id === activeChat);

  const toastTimer  = useRef(null);
  const searchTimer = useRef(null);

  useEffect(() => {
    const el = document.createElement('style');
    el.setAttribute('data-dash','1');
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.head.querySelector('[data-dash]')?.remove();
  }, []);

  useEffect(() => {
    if (tab !== 'shop') return;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(fetchProducts, 300);
    return () => clearTimeout(searchTimer.current);
  }, [cat, search, tab]);

  useEffect(() => {
    localStorage.setItem('sz_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `${API}/products?`;
      if (cat !== 'All') url += `category=${encodeURIComponent(cat)}&`;
      if (search)        url += `search=${encodeURIComponent(search)}`;
      const res  = await fetch(url);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch { setProducts([]); }
    setLoading(false);
  };

  const showToast = (msg, type='green') => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ msg:'', type:'green' }), 2500);
  };

  const addCart = (p) => {
    addToCart(p);
    showToast(`${p.name.length>24?p.name.slice(0,24)+'…':p.name} added to cart!`, 'green');
  };

  const toggleWishlist = (p) => {
    const exists = wishlist.find(w => w._id === p._id);
    if (exists) { setWishlist(prev=>prev.filter(w=>w._id!==p._id)); showToast('Removed from wishlist','pink'); }
    else { setWishlist(prev=>[...prev,p]); showToast(`${p.name.length>24?p.name.slice(0,24)+'…':p.name} added to wishlist!`,'pink'); }
  };

  const count     = getCartCount();
  const subTotal  = getCartTotal();
  const gst       = Math.round(subTotal * 0.18 * 100) / 100;
  const grand     = subTotal + gst;
  const firstName = user?.name?.split(' ')[0] || 'there';
  const wishCount = wishlist.length;
  const catLabel  = () => { const c=CATS.find(x=>x.id===cat); return cat==='All'?'🔥 All Products':`${c?.icon} ${cat}`; };
  const starStr   = (r) => '★'.repeat(Math.min(5,Math.round(r||0)))+'☆'.repeat(5-Math.min(5,Math.round(r||0)));

  return (
    <div className="d-root">
      {/* NAV */}
      <nav className="d-nav">
        <div className="d-brand">✦ ShopZone</div>
        <div className="d-tabs">
          {[['shop','🛍️ Shop'],['support','🎧 Support']].map(([t,l])=>(
            <button key={t} className={`d-tab${tab===t?' on':''}`} onClick={()=>setTab(t)}>{l}</button>
          ))}
        </div>
        <div className="d-nav-r">
          <span className="d-greet">Hey, <em>{firstName}</em> 👋</span>
          <button className="d-nbtn" onClick={()=>navigate('/orders')}>📦 Orders</button>
          <button className="d-nbtn wish" onClick={()=>setShowWish(true)}>
            💖 Wishlist {wishCount>0&&<span className="d-badge pink">{wishCount}</span>}
          </button>
          <button className="d-nbtn cart" onClick={()=>setShowCart(true)}>
            🛒 Cart {count>0&&<span className="d-badge">{count}</span>}
          </button>
          <button className="d-nbtn out" onClick={()=>{logout();navigate('/login');}}>Logout</button>
        </div>
      </nav>

      {toast.msg && (
        <div className={`d-toast ${toast.type}`}>
          <span>{toast.type==='pink'?'💖':'✅'}</span>
          <span><strong>{toast.msg}</strong></span>
        </div>
      )}

      {detailProd && (
        <ProductModal p={detailProd} onClose={()=>setDetailProd(null)} onAddCart={addCart} onWishlist={toggleWishlist}
          isWishlisted={!!wishlist.find(w=>w._id===detailProd._id)} inCart={cartItems.find(c=>c._id===detailProd._id)}/>
      )}

      {showWish && (
        <WishlistDrawer items={wishlist} onClose={()=>setShowWish(false)}
          onRemove={(id)=>{setWishlist(prev=>prev.filter(w=>w._id!==id));showToast('Removed from wishlist','pink');}}
          onAddCart={(p)=>addCart(p)} onViewProduct={(p)=>setDetailProd(p)}/>
      )}

      {/* ── SUPPORT TAB ─────────────────────────────────────────────────────── */}
      {tab === 'support' && (
        <div className="d-main">
          <div style={{
            background:'var(--bg2)', border:'1px solid var(--b2)', borderRadius:22,
            padding:'50px 36px', textAlign:'center',
          }}>
            <div style={{ fontSize:52, marginBottom:16 }}>🎧</div>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:800, marginBottom:10, color:'var(--txt)' }}>
              How can we help you?
            </h2>
            <p style={{ color:'var(--muted2)', fontSize:14, marginBottom:12 }}>
              Our team is available 24×7. Choose the fastest way to reach us.
            </p>
            {/* Status badge */}
            <div style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'7px 18px', borderRadius:999, marginBottom:32,
              background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)',
              fontSize:13, fontWeight:600, color:'#10b981',
            }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', display:'inline-block', animation:'blink 1.6s ease infinite' }}/>
              AI Assistant Online · Responds Instantly
            </div>

            {/* Support Cards — CLICKABLE */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, textAlign:'left' }}>
              {SUP_CARDS.map(card => (
                <div
                  key={card.id}
                  onClick={() => setActiveChat(card.id)}
                  style={{
                    background:'var(--bg3)', border:`1px solid ${card.color}30`,
                    borderRadius:16, padding:22, cursor:'pointer',
                    transition:'all .22s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = card.color + '80';
                    e.currentTarget.style.transform   = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow   = `0 12px 32px ${card.color}20`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = card.color + '30';
                    e.currentTarget.style.transform   = 'none';
                    e.currentTarget.style.boxShadow   = 'none';
                  }}
                >
                  <div style={{ fontSize:30, marginBottom:12 }}>{card.emoji}</div>
                  <div style={{ fontSize:14.5, fontWeight:800, marginBottom:6, color:'var(--txt)' }}>{card.title}</div>
                  <div style={{ fontSize:12.5, color:'var(--muted)', lineHeight:1.65, marginBottom:12 }}>{card.desc}</div>
                  <div style={{ fontSize:12, color:card.color, fontWeight:700 }}>Click to chat →</div>
                </div>
              ))}
            </div>
          </div>

          {/* CHAT WINDOW — opens when card clicked */}
          {activeChat && activeChatCard && (
            <ChatWindow card={activeChatCard} onClose={() => setActiveChat(null)} />
          )}
        </div>
      )}

      {/* SHOP TAB */}
      {tab === 'shop' && (
        <div className="d-main">
          <div className="d-hero">
            <div>
              <div className="d-hero-pill"><div className="d-pill-dot"/> Live Deals</div>
              <h1 className="d-hero-h">Discover <span>Amazing</span><br/>Products Today</h1>
              <p className="d-hero-sub">Free shipping above ₹499 · Easy returns · 100% genuine</p>
            </div>
            <div className="d-hero-stats">
              <div className="d-stat"><div className="d-stat-v">{loading?'—':products.length}</div><div className="d-stat-l">Products</div></div>
              <div className="d-stat"><div className="d-stat-v">{CATS.length-1}</div><div className="d-stat-l">Categories</div></div>
              <div className="d-stat" style={{cursor:'pointer'}} onClick={()=>setShowWish(true)}><div className="d-stat-v" style={{color:'var(--pink)'}}>{wishCount}</div><div className="d-stat-l">Wishlist</div></div>
              <div className="d-stat" style={{cursor:'pointer'}} onClick={()=>setShowCart(true)}><div className="d-stat-v">{count}</div><div className="d-stat-l">In Cart</div></div>
            </div>
          </div>
          <div className="d-srch-wrap">
            <span className="d-srch-ic">🔍</span>
            <input className="d-srch" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products, brands, categories…"/>
          </div>
          <div className="cg-section">
            <div className="cg-label">Browse by Category</div>
            <div className="cg-grid">
              {CATS.map(c=>(
                <div key={c.id} className={`cg-card${cat===c.id?' on':''}`} style={{'--cc':c.color,'--cg':c.glow}} onClick={()=>setCat(c.id)}>
                  <div className="cg-ring"><span className="cg-ico">{c.icon}</span></div>
                  <span className="cg-name">{c.id}</span>
                  {cat===c.id&&<div className="cg-dot"/>}
                </div>
              ))}
            </div>
          </div>
          <div className="d-sec-hd">
            <div className="d-sec-title">{catLabel()}</div>
            {!loading&&<div className="d-sec-cnt">{products.length} item{products.length!==1?'s':''}</div>}
          </div>
          {loading&&(
            <div className="d-skel-grid">
              {Array(10).fill(0).map((_,i)=>(
                <div className="d-skel-card" key={i}><div className="d-skel-img"/><div className="d-skel-body"><div className="d-skel-line s80"/><div className="d-skel-line s60"/><div className="d-skel-line s45"/><div className="d-skel-line"/></div></div>
              ))}
            </div>
          )}
          {!loading&&products.length===0&&(
            <div className="d-empty"><div className="d-empty-icon">🛍️</div><h3>No products found</h3><p>Try a different search term or category</p></div>
          )}
          {!loading&&products.length>0&&(
            <div className="d-grid">
              {products.map(p=>{
                const inCart=cartItems.find(c=>c._id===p._id);
                const hasDisc=p.originalPrice&&p.originalPrice>p.price;
                const saved=hasDisc?Math.round(p.originalPrice-p.price):0;
                const isWishlisted=!!wishlist.find(w=>w._id===p._id);
                return(
                  <div className="d-card" key={p._id}>
                    <div className="d-card-iw" onClick={()=>setDetailProd(p)}>
                      <img src={p.images?.[0]||`https://placehold.co/300x200/191932/555?text=${encodeURIComponent(p.name?.slice(0,12)||'Product')}`} alt={p.name} onError={e=>{e.target.src='https://placehold.co/300x200/191932/555?text=Product';}}/>
                      {p.discount>0&&<span className="d-off">{p.discount}% OFF</span>}
                      <span className={`d-stk ${p.stock>0?'in':'out'}`}>{p.stock>0?'● IN STOCK':'✕ SOLD OUT'}</span>
                      <div className="d-view-hint"><span>👁 View Details</span></div>
                      <button className={`d-wish-btn${isWishlisted?' wishlisted':''}`} onClick={e=>{e.stopPropagation();toggleWishlist(p);}} title={isWishlisted?'Remove from wishlist':'Add to wishlist'}>
                        {isWishlisted?'💖':'🤍'}
                      </button>
                    </div>
                    <div className="d-card-body">
                      <div className="d-pname" title={p.name} onClick={()=>setDetailProd(p)}>{p.name}</div>
                      <div className="d-pbrand">{p.brand}{p.brand&&p.category?' · ':''}{p.category}</div>
                      {p.numReviews>0&&<div className="d-pstars">{starStr(p.rating)}<span>({p.numReviews})</span></div>}
                      <div className="d-prow">
                        <span className="d-pprice">₹{p.price?.toLocaleString('en-IN')}</span>
                        {hasDisc&&<span className="d-porig">₹{p.originalPrice?.toLocaleString('en-IN')}</span>}
                        {saved>0&&<span className="d-psave">−₹{saved.toLocaleString('en-IN')}</span>}
                      </div>
                      <button className={`d-addbtn ${p.stock===0?'gone':inCart?'incart':'avail'}`} onClick={()=>p.stock>0&&addCart(p)} disabled={p.stock===0}>
                        {p.stock===0?'Out of Stock':inCart?`✓ In Cart (${inCart.quantity})`:'＋ Add to Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CART DRAWER */}
      {showCart&&(
        <>
          <div className="d-cart-back" onClick={()=>setShowCart(false)}/>
          <div className="d-drawer">
            <div className="d-draw-hd">
              <h2>🛒 Cart <span style={{fontSize:14,fontWeight:500,color:'var(--muted)',marginLeft:4}}>({count} items)</span></h2>
              <button className="d-draw-cls" onClick={()=>setShowCart(false)}>✕</button>
            </div>
            <div className="d-draw-body">
              {cartItems.length===0?(
                <div className="d-cart-empty"><div style={{fontSize:52,opacity:.45}}>🛒</div><p style={{fontWeight:700,color:'var(--muted2)',fontSize:15}}>Your cart is empty</p><p style={{fontSize:13,color:'var(--muted)'}}>Add products to get started</p></div>
              ):cartItems.map(item=>(
                <div className="d-citem" key={item._id}>
                  <img className="d-cimg" src={item.images?.[0]||'https://placehold.co/62x62/191932/555?text=P'} alt={item.name} onError={e=>{e.target.src='https://placehold.co/62x62/191932/555?text=P'}}/>
                  <div className="d-cinfo">
                    <div className="d-cname">{item.name}</div>
                    <div className="d-cprice">₹{(item.price*item.quantity).toLocaleString('en-IN')}</div>
                    <div className="d-crow">
                      <button className="d-qbtn" onClick={()=>updateQuantity(item._id,item.quantity-1)}>−</button>
                      <span className="d-qval">{item.quantity}</span>
                      <button className="d-qbtn" onClick={()=>updateQuantity(item._id,item.quantity+1)}>+</button>
                      <button className="d-rmbtn" onClick={()=>removeFromCart(item._id)}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {cartItems.length>0&&(
              <div className="d-draw-ft">
                <div className="d-trow">
                  <div><div className="d-tlbl">Total (incl. 18% GST)</div><div className="d-tsub">₹{subTotal.toLocaleString('en-IN')} + ₹{gst.toFixed(0)} GST</div></div>
                  <div className="d-tval">₹{grand.toLocaleString('en-IN')}</div>
                </div>
                <button className="d-chkbtn" onClick={()=>{setShowCart(false);navigate('/checkout');}}>Proceed to Checkout →</button>
                <div className="d-cnote">🔒 Secure checkout · Free delivery above ₹499</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}