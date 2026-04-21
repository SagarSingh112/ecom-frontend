// src/context/pages/SupportPage.jsx
import { useState, useRef, useEffect } from "react";

const CARDS = [
  { id: "track",    emoji: "📦", title: "Track My Order",    desc: "Real-time order status and delivery updates.",   color: "#f59e0b" },
  { id: "returns",  emoji: "↩️", title: "Returns & Refunds", desc: "Hassle-free returns and full refund processing.", color: "#3b82f6" },
  { id: "livechat", emoji: "💬", title: "Live Chat",          desc: "Speak to an agent now. Avg. wait: 2 min.",       color: "#8b5cf6" },
  { id: "email",    emoji: "📧", title: "Email Support",      desc: "Write to us — response within 2 hours.",         color: "#10b981" },
];

const QUICK_REPLIES = {
  track:    ["Where is my order?", "My order is delayed", "Not yet delivered"],
  returns:  ["How do I return?", "Refund not received", "Exchange a product"],
  livechat: ["Account issue", "Product not working", "General complaint"],
  email:    ["Update my email", "Password reset", "Billing issue"],
};

function smartReply(text) {
  const t = text.toLowerCase();
  if (t.includes("hello") || t.includes("hi") || t.includes("hey"))
    return "Hello! 👋 I'm ShopZone's AI assistant. How can I help you today?";
  if (t.includes("track") || (t.includes("where") && t.includes("order")))
    return "Please share your Order ID (e.g. #ORD-12345) and I'll check the delivery status for you right away!";
  if (t.includes("delayed") || t.includes("late") || t.includes("not arrived"))
    return "Sorry for the delay! 😔 Please share your Order ID and I'll escalate it immediately.";
  if (t.includes("refund") && (t.includes("not") || t.includes("received") || t.includes("pending")))
    return "Refunds typically take 5-7 business days after approval. Share your Order ID and I'll check the status.";
  if (t.includes("return"))
    return "Returns are accepted within 7 days of delivery. Go to Orders → Select item → Click Return. Need help?";
  if (t.includes("exchange"))
    return "Exchanges are available within 7 days! Go to Orders → Select item → Exchange. We ship the replacement free!";
  if (t.includes("cancel"))
    return "Orders can be cancelled within 1 hour of placing. After that, please initiate a return instead.";
  if (t.includes("payment") || t.includes("billing") || t.includes("charge"))
    return "For billing issues, please share your Order ID and the amount charged. I will verify and fix it right away!";
  if (t.includes("password") || t.includes("login"))
    return "Click Forgot Password on the login page and enter your registered email. A reset link will arrive in 2 minutes!";
  if (t.includes("account") || t.includes("profile"))
    return "For account issues, go to Profile → Settings. If locked out, use Forgot Password. Want help with something specific?";
  if (t.includes("broken") || t.includes("damage") || t.includes("defect") || t.includes("not working"))
    return "So sorry about that! 😟 Email photos to support@shopzone.com with your Order ID. We will send a replacement or full refund within 24 hours.";
  if (t.includes("thank"))
    return "You are welcome! 😊 Is there anything else I can help you with?";
  return "I understand your concern! 🤝 Could you please share your Order ID or more details so I can help you better?";
}

async function getResponse(messages) {
  try {
    const res = await fetch("/api/support/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error("err");
    const data = await res.json();
    if (data.reply) return data.reply;
    throw new Error("no reply");
  } catch {
    const last = messages[messages.length - 1]?.content || "";
    return smartReply(last);
  }
}

function ChatWindow({ card, onClose }) {
  const getTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const [messages, setMessages] = useState([{
    id: 1, role: "assistant",
    text: `Hi! 👋 I am ShopZone's AI assistant here to help you with "${card.title}". What is your concern?`,
    time: getTime(),
  }]);
  const [input, setInput]         = useState("");
  const [typing, setTyping]       = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef                 = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || typing) return;
    setInput("");
    setShowQuick(false);

    const userMsg = { id: Date.now(), role: "user", text: msg, time: getTime() };
    setMessages((p) => [...p, userMsg]);
    setTyping(true);

    await new Promise((r) => setTimeout(r, 900));

    const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.text }));
    const reply   = await getResponse(history);

    setTyping(false);
    setMessages((p) => [...p, { id: Date.now() + 1, role: "assistant", text: reply, time: getTime() }]);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
        padding: "24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 390, height: 560,
          background: "#13131f",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "chatSlide 0.3s ease",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px",
          background: `linear-gradient(135deg, ${card.color}25, transparent)`,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, fontSize: 20,
              background: `${card.color}20`, border: `1px solid ${card.color}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9" }}>ShopZone AI Support</div>
              <div style={{ fontSize: 11, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                Online · Replies instantly
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8, border: "none",
              background: "rgba(255,255,255,0.07)", color: "#94a3b8",
              cursor: "pointer", fontSize: 15, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >X</button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "14px 14px 4px",
          display: "flex", flexDirection: "column", gap: 10,
          scrollbarWidth: "none",
        }}>
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "82%", padding: "9px 13px",
                  borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: isUser ? card.color : "rgba(255,255,255,0.07)",
                  border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
                  fontSize: 13.5, lineHeight: 1.55, color: isUser ? "#fff" : "#e2e8f0",
                }}>{m.text}</div>
                <div style={{ fontSize: 10.5, color: "#475569", marginTop: 3, display: "flex", gap: 4, alignItems: "center" }}>
                  {!isUser && <span>🤖</span>}
                  <span>{m.time}</span>
                  {isUser && <span style={{ color: card.color }}>done</span>}
                </div>
              </div>
            );
          })}

          {typing && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{
                padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", gap: 5, alignItems: "center",
              }}>
                {[0, 0.18, 0.36].map((d, i) => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: "50%", background: "#64748b",
                    animation: `typingBounce 1.1s ${d}s infinite`,
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 10.5, color: "#475569", marginTop: 3 }}>AI typing...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick Replies */}
        {showQuick && (
          <div style={{
            padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex", gap: 6, flexWrap: "wrap",
          }}>
            {(QUICK_REPLIES[card.id] || QUICK_REPLIES.livechat).map((qr) => (
              <button
                key={qr} onClick={() => send(qr)}
                style={{
                  padding: "5px 10px", borderRadius: 999, cursor: "pointer",
                  background: `${card.color}15`, border: `1px solid ${card.color}40`,
                  color: card.color, fontSize: 11.5, fontWeight: 500,
                }}
              >{qr}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", gap: 8, alignItems: "center",
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your message..."
            autoFocus
            style={{
              flex: 1, padding: "9px 13px", borderRadius: 10, fontSize: 13.5,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#e2e8f0", outline: "none",
            }}
          />
          <button
            onClick={() => send()}
            style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: card.color, border: "none", color: "#fff",
              fontSize: 17, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >send</button>
        </div>
      </div>

      <style>{`
        @keyframes chatSlide {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%           { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

export default function SupportPage() {
  const [activeCard, setActiveCard]   = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const card = CARDS.find((c) => c.id === activeCard);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0f1a 0%, #13131f 60%, #0d0d1a 100%)",
      color: "#e2e8f0",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>

        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎧</div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: "#fff", margin: "0 0 10px" }}>
            How can we help you?
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", margin: "0 0 20px" }}>
            Our team is available 24x7. Choose the fastest way to reach us.
          </p>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "7px 18px", borderRadius: 999,
            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
            fontSize: 13, fontWeight: 600, color: "#10b981",
          }}>
            AI Assistant Online - Responds Instantly
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          {CARDS.map((c) => {
            const hov = hoveredCard === c.id;
            return (
              <div
                key={c.id}
                onClick={() => { console.log("Card clicked:", c.id); setActiveCard(c.id); }}
                onMouseEnter={() => setHoveredCard(c.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  padding: 26, borderRadius: 16, cursor: "pointer",
                  background: hov ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.025)",
                  border: `1px solid ${hov ? c.color + "55" : "rgba(255,255,255,0.08)"}`,
                  boxShadow: hov ? `0 12px 40px ${c.color}25` : "none",
                  transform: hov ? "translateY(-4px)" : "none",
                  transition: "all 0.22s ease",
                  userSelect: "none",
                }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 12, fontSize: 22,
                  background: `${c.color}20`, border: `1px solid ${c.color}35`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 14,
                }}>{c.emoji}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 7 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{c.desc}</div>
                <div style={{ marginTop: 14, fontSize: 12, color: c.color, fontWeight: 600 }}>
                  {hov ? "Click to open chat" : "Get help"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeCard && card && (
        <ChatWindow card={card} onClose={() => setActiveCard(null)} />
      )}
    </div>
  );
}