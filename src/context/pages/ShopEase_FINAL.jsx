// src/context/pages/ShopEase.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "../AuthContext.jsx";
import { useCart } from "../CartContext.jsx";

// ─────────────────────────────────────────────
// ⚠️  PASTE YOUR RAZORPAY TEST KEY BELOW
// ─────────────────────────────────────────────
const RAZORPAY_KEY = "rzp_test_XXXXXXXXXXXXXXXX"; // ← replace this

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
:root{
  --bg:#080c14;--s1:#0f1520;--s2:#161e2e;--s3:#1d2640;
  --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.12);
  --accent:#00e5a0;--accent2:#6c63ff;--danger:#ff4d6d;
  --text:#eaedf5;--muted:#7a8499;--muted2:#a0aabb;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;
  background-image:radial-gradient(ellipse 80% 50% at -10% -10%,rgba(108,99,255,.15) 0%,transparent 55%),
  radial-gradient(ellipse 60% 40% at 110% 110%,rgba(0,229,160,.1) 0%,transparent 55%)}
.app{max-width:1100px;margin:0 auto;padding:2rem 1.5rem}

/* Stepper */
.stepper{display:flex;align-items:center;justify-content:center;margin-bottom:2.5rem}
.step-dot{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;
  font-family:'Syne',sans-serif;font-weight:700;font-size:.85rem;
  border:2px solid var(--border2);background:var(--s2);color:var(--muted);transition:all .4s;z-index:1}
.step-dot.done{background:var(--accent);border-color:var(--accent);color:#080c14}
.step-dot.active{background:var(--accent2);border-color:var(--accent2);color:#fff;box-shadow:0 0 20px rgba(108,99,255,.5)}
.step-label{font-size:.72rem;color:var(--muted);text-align:center;margin-top:5px;white-space:nowrap}
.step-line{height:2px;background:var(--border2);min-width:60px;max-width:100px;transition:background .4s;margin-bottom:16px}
.step-line.done{background:var(--accent)}

/* Layout */
.card{background:var(--s1);border:1px solid var(--border);border-radius:18px;padding:1.6rem}
.card-title{font-family:'Syne',sans-serif;font-weight:800;font-size:1.15rem;
  margin-bottom:1.4rem;color:var(--text);display:flex;align-items:center;gap:10px}
.grid-2{display:grid;grid-template-columns:1fr 360px;gap:1.4rem;align-items:start}
@media(max-width:860px){.grid-2{grid-template-columns:1fr}}

/* Inputs */
.field{margin-bottom:14px}
.field label{display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.6px;
  color:var(--muted);margin-bottom:5px;font-weight:500}
.field input,.field textarea{width:100%;background:var(--s2);border:1.5px solid var(--border2);
  border-radius:9px;padding:11px 14px;color:var(--text);font-family:'DM Sans',sans-serif;
  font-size:.9rem;outline:none;transition:border-color .2s}
.field input:focus{border-color:var(--accent2);box-shadow:0 0 0 3px rgba(108,99,255,.12)}
.field input::placeholder{color:var(--muted)}
.row-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}

/* Address type tabs */
.addr-tabs{display:flex;gap:8px;margin-bottom:1rem;flex-wrap:wrap}
.addr-tab{padding:8px 18px;border-radius:8px;border:1.5px solid var(--border2);
  font-size:.82rem;cursor:pointer;transition:all .2s;color:var(--muted);background:var(--s2)}
.addr-tab.active{background:rgba(108,99,255,.12);border-color:var(--accent2);color:var(--accent2);font-weight:600}

/* Payment options */
.pay-opt{display:flex;align-items:center;justify-content:space-between;background:var(--s2);
  border:1.5px solid var(--border);border-radius:12px;padding:13px 16px;margin-bottom:9px;
  cursor:pointer;transition:all .2s}
.pay-opt:hover{border-color:rgba(108,99,255,.4)}
.pay-opt.sel{border-color:var(--accent2);background:rgba(108,99,255,.08)}
.pay-opt.rzp.sel{border-color:var(--accent);background:rgba(0,229,160,.06)}
.pay-left{display:flex;align-items:center;gap:12px}
.pay-icon{width:38px;height:38px;border-radius:9px;display:grid;place-items:center;
  font-size:1.1rem;background:rgba(255,255,255,.05)}
.pay-name{font-weight:500;font-size:.92rem;display:flex;align-items:center;gap:7px}
.pay-sub{font-size:.76rem;color:var(--muted);margin-top:1px}
.rzp-badge{background:linear-gradient(135deg,#072654,#3395ff);color:#fff;
  font-size:.58rem;font-weight:700;padding:2px 7px;border-radius:4px;letter-spacing:.5px}
.p-radio{width:18px;height:18px;border-radius:50%;border:2px solid var(--muted);
  display:grid;place-items:center;flex-shrink:0}
.pay-opt.sel .p-radio{border-color:var(--accent2)}
.pay-opt.rzp.sel .p-radio{border-color:var(--accent)}
.p-dot{width:8px;height:8px;border-radius:50%;background:var(--accent2);opacity:0;transition:opacity .2s}
.pay-opt.rzp .p-dot{background:var(--accent)}
.pay-opt.sel .p-dot{opacity:1}

/* Pay sub-forms */
.pay-form{background:var(--s2);border:1px solid var(--border2);border-radius:11px;
  padding:1.1rem;margin-bottom:9px;animation:slideDown .2s ease}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
.upi-apps{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}
.upi-app{background:var(--s1);border:1.5px solid var(--border2);border-radius:9px;
  padding:7px 13px;font-size:.78rem;cursor:pointer;transition:all .2s;
  color:var(--text);display:flex;align-items:center;gap:5px}
.upi-app:hover,.upi-app.on{border-color:var(--accent);background:rgba(0,229,160,.07);color:var(--accent)}
.bank-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:8px}
.bank-btn{background:var(--s1);border:1.5px solid var(--border2);border-radius:9px;
  padding:9px 6px;font-size:.76rem;text-align:center;cursor:pointer;transition:all .2s;color:var(--text)}
.bank-btn:hover,.bank-btn.on{border-color:var(--accent2);background:rgba(108,99,255,.09);color:var(--accent2)}

/* Razorpay info box */
.rzp-info{background:linear-gradient(135deg,rgba(51,149,255,.07),rgba(7,38,84,.1));
  border:1px solid rgba(51,149,255,.18);border-radius:11px;padding:14px 16px;
  margin-bottom:9px;font-size:.83rem;color:rgba(255,255,255,.6);line-height:1.75}
.rzp-info-title{color:#3395ff;font-weight:700;margin-bottom:5px;font-size:.9rem}

/* Buttons */
.btn-primary{width:100%;padding:15px;border-radius:11px;border:none;
  font-family:'Syne',sans-serif;font-weight:700;font-size:.98rem;cursor:pointer;
  background:linear-gradient(135deg,var(--accent),#00b87a);color:#080c14;
  transition:transform .15s,box-shadow .2s;display:flex;align-items:center;
  justify-content:center;gap:9px;margin-top:1rem}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(0,229,160,.25)}
.btn-primary:disabled{opacity:.6;cursor:not-allowed;transform:none;box-shadow:none}
.btn-secondary{width:100%;padding:13px;border-radius:11px;border:1.5px solid var(--border2);
  font-family:'Syne',sans-serif;font-weight:600;font-size:.92rem;cursor:pointer;
  background:transparent;color:var(--text);transition:all .2s;margin-top:8px}
.btn-secondary:hover{border-color:var(--accent2);background:rgba(108,99,255,.07)}

/* Spinner */
.spin{width:17px;height:17px;border:2px solid rgba(0,0,0,.3);border-top-color:#000;
  border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* Order summary */
.order-item{display:flex;align-items:center;gap:11px;margin-bottom:13px}
.item-thumb{width:52px;height:52px;border-radius:9px;background:var(--s2);
  border:1px solid var(--border);overflow:hidden;flex-shrink:0;display:grid;place-items:center;font-size:1.3rem}
.item-name{font-size:.86rem;font-weight:500;color:var(--text)}
.item-qty{font-size:.76rem;color:var(--muted);margin-top:1px}
.item-price{margin-left:auto;font-weight:600;font-size:.92rem;white-space:nowrap}
.divider{height:1px;background:var(--border);margin:1rem 0}
.sum-row{display:flex;justify-content:space-between;font-size:.86rem;color:var(--muted);margin-bottom:7px}
.sum-row.total{font-family:'Syne',sans-serif;font-weight:800;font-size:1.08rem;color:var(--text);margin-top:4px}
.free{color:var(--accent);font-weight:600}
.deliver-box{background:var(--s2);border-radius:9px;padding:11px;margin-top:.9rem;
  font-size:.8rem;color:var(--muted);border:1px solid var(--border)}
.deliver-box strong{color:var(--text);display:block;margin-bottom:3px}
.badges{display:flex;justify-content:center;gap:14px;margin-top:.9rem;font-size:.72rem;color:var(--muted)}

/* Processing overlay */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.88);backdrop-filter:blur(10px);
  display:grid;place-items:center;z-index:9999}
.overlay-box{background:var(--s1);border:1px solid var(--border2);border-radius:20px;
  padding:2.5rem;max-width:320px;width:90%;text-align:center}
.big-spin{width:64px;height:64px;border:4px solid rgba(0,229,160,.15);border-top-color:var(--accent);
  border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 1.4rem}
.overlay-box h3{font-family:'Syne',sans-serif;font-size:1.15rem;font-weight:700;margin-bottom:.4rem}
.progress-bar{width:100%;height:3px;background:var(--s3);border-radius:99px;margin-top:1.4rem;overflow:hidden}
.progress-fill{height:100%;background:linear-gradient(90deg,var(--accent2),var(--accent));
  border-radius:99px;animation:prog 3s ease forwards}
@keyframes prog{from{width:0}to{width:100%}}

/* Success */
.success-page{text-align:center;padding:1rem 0 2rem}
.success-ring{width:90px;height:90px;border-radius:50%;background:rgba(0,229,160,.1);
  border:2px solid var(--accent);display:grid;place-items:center;margin:0 auto 1.5rem;
  animation:ring-pulse 2.5s ease infinite}
@keyframes ring-pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,229,160,.3)}50%{box-shadow:0 0 0 16px rgba(0,229,160,0)}}
.success-page h1{font-family:'Syne',sans-serif;font-size:1.9rem;font-weight:800;color:var(--accent);margin-bottom:.5rem}
.success-page .sub{color:var(--muted);font-size:.9rem;margin-bottom:1.8rem}
.success-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:1.5rem}
.action-btn{display:flex;align-items:center;gap:8px;padding:12px 22px;border-radius:10px;
  font-family:'Syne',sans-serif;font-weight:700;font-size:.88rem;cursor:pointer;transition:all .2s;border:none}
.action-btn.primary{background:linear-gradient(135deg,var(--accent),#00b87a);color:#080c14}
.action-btn.primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,229,160,.3)}
.action-btn.outline{background:transparent;border:1.5px solid var(--border2);color:var(--text)}
.action-btn.outline:hover{border-color:var(--accent2);background:rgba(108,99,255,.08)}

/* Meta cards */
.meta-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:1.4rem 0}
@media(max-width:480px){.meta-grid{grid-template-columns:1fr}}
.meta-card{background:var(--s2);border:1px solid var(--border);border-radius:11px;padding:14px}
.meta-label{font-size:.7rem;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:4px}
.meta-val{font-family:'Syne',sans-serif;font-weight:700;font-size:.92rem;color:var(--text)}
.meta-val.accent{color:var(--accent)}

/* Tracking */
.track-steps{position:relative;padding-left:28px}
.track-steps::before{content:'';position:absolute;left:10px;top:8px;bottom:8px;width:2px;background:var(--border2)}
.track-step{position:relative;margin-bottom:24px}
.track-step:last-child{margin-bottom:0}
.track-dot{width:20px;height:20px;border-radius:50%;border:2px solid var(--border2);
  background:var(--s1);display:grid;place-items:center;position:absolute;left:-28px;top:0;z-index:1;transition:all .4s}
.track-dot.done{background:var(--accent);border-color:var(--accent)}
.track-dot.active{background:var(--accent2);border-color:var(--accent2);
  box-shadow:0 0 12px rgba(108,99,255,.6);animation:dot-pulse 1.5s ease infinite}
@keyframes dot-pulse{0%,100%{box-shadow:0 0 0 0 rgba(108,99,255,.5)}50%{box-shadow:0 0 0 6px rgba(108,99,255,0)}}
.track-event{font-weight:500;font-size:.88rem}
.track-time{font-size:.74rem;color:var(--muted);margin-top:2px}
.track-detail{font-size:.78rem;color:var(--muted2);margin-top:4px;
  background:var(--s2);border-radius:7px;padding:7px 10px;border:1px solid var(--border)}

/* Modal / Invoice */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(8px);
  display:grid;place-items:center;z-index:990;padding:1rem}
.modal{background:var(--s1);border:1px solid var(--border2);border-radius:18px;
  max-width:560px;width:100%;max-height:90vh;overflow-y:auto;
  animation:pop .3s cubic-bezier(.34,1.56,.64,1)}
@keyframes pop{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}
.modal-header{padding:1.4rem 1.6rem 0;display:flex;align-items:center;justify-content:space-between}
.modal-header h3{font-family:'Syne',sans-serif;font-weight:800;font-size:1.05rem}
.modal-close{background:var(--s3);border:none;color:var(--muted);width:30px;height:30px;
  border-radius:50%;cursor:pointer;font-size:1rem;display:grid;place-items:center}
.invoice-preview{padding:1.4rem 1.6rem}
.inv-header{display:flex;justify-content:space-between;align-items:flex-start;
  padding-bottom:1rem;border-bottom:1px solid var(--border);margin-bottom:1rem}
.inv-brand{font-family:'Syne',sans-serif;font-weight:800;font-size:1.4rem;color:var(--accent)}
.inv-tag{font-size:.72rem;color:var(--muted);margin-top:2px}
.inv-meta{text-align:right;font-size:.78rem;color:var(--muted);line-height:1.7}
.inv-meta strong{color:var(--text)}
.inv-parties{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}
.inv-party-label{font-size:.68rem;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:5px}
.inv-party-name{font-weight:600;font-size:.88rem;margin-bottom:2px}
.inv-party-addr{font-size:.78rem;color:var(--muted2);line-height:1.5}
.inv-table{width:100%;border-collapse:collapse;margin-bottom:1rem;font-size:.82rem}
.inv-table th{text-align:left;padding:7px 10px;background:var(--s2);color:var(--muted);
  font-size:.7rem;text-transform:uppercase;letter-spacing:.4px}
.inv-table th:last-child,.inv-table td:last-child{text-align:right}
.inv-table td{padding:9px 10px;border-bottom:1px solid var(--border)}
.inv-totals{margin-left:auto;width:210px}
.inv-total-row{display:flex;justify-content:space-between;font-size:.82rem;color:var(--muted);padding:4px 0}
.inv-total-row.grand{font-family:'Syne',sans-serif;font-weight:700;font-size:.95rem;
  color:var(--text);border-top:1px solid var(--border2);padding-top:8px;margin-top:4px}
.inv-footer{background:var(--s2);border-radius:9px;padding:10px 14px;
  font-size:.74rem;color:var(--muted);text-align:center;margin-top:1rem;line-height:1.6}
.inv-actions{display:flex;gap:8px;padding:0 1.6rem 1.4rem}

/* Alerts */
.alert-bar{background:rgba(255,77,109,.1);border:1px solid rgba(255,77,109,.25);
  border-radius:9px;padding:12px 16px;margin-bottom:1.2rem;font-size:.87rem;
  color:var(--danger);display:flex;align-items:center;gap:8px}
.check-path{stroke-dasharray:40;stroke-dashoffset:40;animation:draw-check .45s .1s ease forwards}
@keyframes draw-check{to{stroke-dashoffset:0}}
`;

/* ─── Constants ─── */
const PAY_METHODS = [
  { id:"razorpay",   icon:"⚡", label:"Razorpay",            sub:"UPI · Cards · Net Banking · Wallets", rzp:true },
  { id:"cod",        icon:"💵", label:"Cash on Delivery",    sub:"Pay when order arrives" },
  { id:"upi",        icon:"📱", label:"UPI (manual)",        sub:"Enter UPI ID manually" },
  { id:"card",       icon:"💳", label:"Credit / Debit Card", sub:"Visa, Mastercard, RuPay" },
  { id:"netbanking", icon:"🏦", label:"Net Banking",         sub:"All major Indian banks" },
];
const UPI_APPS = [{icon:"🟢",name:"GPay"},{icon:"🟣",name:"PhonePe"},{icon:"🔵",name:"Paytm"},{icon:"🟡",name:"BHIM"}];
const BANKS    = ["SBI","HDFC","ICICI","Axis","Kotak","BOB"];
const TRACKING = [
  {label:"Order Placed",     detail:"Your order is confirmed and being processed.", time:"Just now",  done:true, active:false},
  {label:"Order Picked Up",  detail:"Package picked up by our delivery partner.",  time:"Processing",done:false,active:true},
  {label:"In Transit",       detail:"Package is on its way to sorting facility.",  time:"Soon",      done:false,active:false},
  {label:"Out for Delivery", detail:"Package will be delivered today.",            time:"2–3 days",  done:false,active:false},
  {label:"Delivered",        detail:"Package delivered successfully.",             time:"3–5 days",  done:false,active:false},
];

function today(){return new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}

/* ─── Load Razorpay SDK dynamically ─── */
function loadRazorpaySDK(){
  return new Promise(resolve=>{
    if(window.Razorpay){resolve(true);return;}
    const s=document.createElement("script");
    s.src="https://checkout.razorpay.com/v1/checkout.js";
    s.onload=()=>resolve(true);
    s.onerror=()=>resolve(false);
    document.body.appendChild(s);
  });
}

/* ─── Stepper ─── */
function Stepper({step}){
  const steps=["Address","Payment","Confirmation"];
  return(
    <div className="stepper">
      {steps.map((s,i)=>(
        <div key={s} style={{display:"flex",alignItems:"center"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div className={`step-dot${step===i?" active":step>i?" done":""}`}>
              {step>i
                ?<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="11 3 5.5 9.5 2 6"/></svg>
                :i+1}
            </div>
            <div className="step-label">{s}</div>
          </div>
          {i<steps.length-1&&<div className={`step-line${step>i?" done":""}`}/>}
        </div>
      ))}
    </div>
  );
}

/* ─── Order Summary sidebar ─── */
function Summary({cartItems,getCartTotal,address}){
  const sub=getCartTotal(), gst=Math.round(sub*.18*100)/100, total=sub+gst;
  return(
    <div className="card">
      <div className="card-title">🧾 Order Summary</div>
      {cartItems.map(it=>(
        <div className="order-item" key={it._id}>
          <div className="item-thumb">
            {it.images?.[0]
              ?<img src={it.images[0]} alt={it.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              :"🛍️"}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div className="item-name" style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it.name}</div>
            <div className="item-qty">Qty: {it.quantity}</div>
          </div>
          <div className="item-price">₹{(it.price*it.quantity).toLocaleString("en-IN")}</div>
        </div>
      ))}
      <div className="divider"/>
      <div className="sum-row"><span>Subtotal</span><span>₹{sub.toLocaleString("en-IN")}</span></div>
      <div className="sum-row"><span>GST (18%)</span><span>₹{gst.toFixed(2)}</span></div>
      <div className="sum-row"><span>Shipping</span><span className="free">FREE 🎉</span></div>
      <div className="divider"/>
      <div className="sum-row total"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
      {address&&(
        <div className="deliver-box">
          <strong>📍 Delivering to:</strong>
          {address.line1}, {address.city} – {address.pin}
        </div>
      )}
      <div className="badges"><span>🔒 Secure</span><span>🛡️ Safe</span><span>✅ Protected</span></div>
    </div>
  );
}

/* ─── Step 1: Address ─── */
function AddressStep({onNext,cartItems,getCartTotal}){
  const [alert,setAlert]=useState("");
  const [form,setForm]=useState({name:"",phone:"",line1:"",line2:"",city:"",state:"",pin:"",type:"Home"});
  const set=k=>e=>setForm(p=>({...p,[k]:e.target.value}));

  const proceed=()=>{
    if(!form.name||!form.phone||!form.line1||!form.city||!form.pin){setAlert("Please fill all required fields.");return;}
    if(form.pin.length!==6||!/^\d+$/.test(form.pin)){setAlert("PIN code must be exactly 6 digits.");return;}
    if(form.phone.length!==10||!/^\d+$/.test(form.phone)){setAlert("Phone must be exactly 10 digits.");return;}
    onNext({tag:form.type,...form});
  };

  return(
    <div className="grid-2">
      <div className="card">
        <div className="card-title">📍 Delivery Address</div>
        {alert&&<div className="alert-bar">❌ {alert}</div>}
        <div className="addr-tabs">
          {["Home","Office","Other"].map(t=>(
            <div key={t} className={`addr-tab${form.type===t?" active":""}`}
              onClick={()=>setForm(p=>({...p,type:t}))}>{t}</div>
          ))}
        </div>
        <div className="row-2">
          <div className="field"><label>Full Name *</label><input placeholder="Your name" value={form.name} onChange={set("name")}/></div>
          <div className="field"><label>Phone *</label><input placeholder="10-digit mobile" maxLength={10} value={form.phone} onChange={set("phone")}/></div>
        </div>
        <div className="field"><label>Address Line 1 *</label><input placeholder="House no, Street name" value={form.line1} onChange={set("line1")}/></div>
        <div className="field"><label>Address Line 2</label><input placeholder="Landmark (optional)" value={form.line2} onChange={set("line2")}/></div>
        <div className="row-3">
          <div className="field"><label>City *</label><input placeholder="City" value={form.city} onChange={set("city")}/></div>
          <div className="field"><label>State</label><input placeholder="State" value={form.state} onChange={set("state")}/></div>
          <div className="field"><label>PIN Code *</label><input placeholder="6-digit PIN" maxLength={6} value={form.pin} onChange={set("pin")}/></div>
        </div>
        <button className="btn-primary" style={{marginTop:"1.2rem"}} onClick={proceed}>
          Deliver to This Address →
        </button>
      </div>
      <Summary cartItems={cartItems} getCartTotal={getCartTotal}/>
    </div>
  );
}

/* ─── Step 2: Payment ─── */
function PaymentStep({address,onSuccess,onBack,cartItems,getCartTotal}){
  const {authHeaders,user}=useAuth();
  const [method,setMethod]=useState("razorpay");
  const [pdata,setPdata]=useState({});
  const [processing,setProc]=useState(false);
  const [procMsg,setProcMsg]=useState("");
  const [upiApp,setUpiApp]=useState(null);
  const [bank,setBank]=useState(null);
  const [alert,setAlert]=useState("");

  const sub=getCartTotal(), gst=Math.round(sub*.18*100)/100, total=sub+gst;
  const upd=k=>e=>setPdata(p=>({...p,[k]:e.target.value}));

  /* Save order to our MongoDB */
  const saveOrder=async(paymentLabel,isPaid,paymentId="")=>{
    const items=cartItems.map(item=>({
      name:item.name, quantity:item.quantity, price:item.price,
      image:item.images?.[0]||"", product:item._id,
    }));
    const shippingAddress={
      address: address.line1+(address.line2?", "+address.line2:""),
      city:address.city, postalCode:address.pin,
      country:"India", phone:address.phone, name:address.name,
    };
    const res=await fetch(`${API}/orders`,{
      method:"POST",
      headers:authHeaders(),
      body:JSON.stringify({items,totalPrice:total,paymentMethod:paymentLabel,shippingAddress,isPaid,paymentId}),
    });
    const data=await res.json();
    if(!res.ok) throw new Error(data.msg||"Failed to save order");
    return data;
  };

  /* ── RAZORPAY FLOW ── */
  const handleRazorpay=async()=>{
    setAlert("");
    setProc(true);
    setProcMsg("Loading Razorpay…");

    // Load SDK
    const sdkLoaded=await loadRazorpaySDK();
    if(!sdkLoaded){
      setProc(false);
      setAlert("❌ Could not load Razorpay SDK. Check internet connection.");
      return;
    }

    try{
      // Step 1: Create Razorpay order on backend
      setProcMsg("Creating payment session…");
      const res=await fetch(`${API}/payment/create-order`,{
        method:"POST",
        headers:authHeaders(),
        body:JSON.stringify({amount:total}),
      });
      const rzpOrder=await res.json();
      if(!res.ok) throw new Error(rzpOrder.msg||"Could not create payment order");

      // Step 2: Hide our overlay, open Razorpay popup
      setProc(false);

      const options={
        key:       RAZORPAY_KEY,
        amount:    rzpOrder.amount,      // in paise
        currency:  "INR",
        name:      "ShopEase",
        description:`Payment for ${cartItems.length} item(s)`,
        order_id:  rzpOrder.orderId,
        prefill:{
          name:    user?.name  || address.name  || "",
          email:   user?.email || "",
          contact: address.phone || "",
        },
        notes:{ address: address.line1+", "+address.city },
        theme:{ color:"#00e5a0" },

        /* Payment SUCCESS callback */
        handler: async function(response){
          setProc(true);
          setProcMsg("Verifying payment…");
          try{
            // Step 3: Verify signature on backend
            const vRes=await fetch(`${API}/payment/verify`,{
              method:"POST",
              headers:authHeaders(),
              body:JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            });
            const vData=await vRes.json();
            if(!vRes.ok||!vData.success) throw new Error("Payment verification failed");

            // Step 4: Save confirmed order to our database
            setProcMsg("Saving your order…");
            const order=await saveOrder("Razorpay",true,response.razorpay_payment_id);

            setProc(false);
            onSuccess(
              "Razorpay · #"+response.razorpay_payment_id.slice(-8).toUpperCase(),
              order._id,
              total
            );
          }catch(err){
            setProc(false);
            setAlert("❌ "+err.message);
          }
        },

        modal:{
          ondismiss:()=>{
            setProc(false);
            setAlert("❌ Payment was cancelled. Please try again.");
          },
        },
      };

      const rzpInstance=new window.Razorpay(options);
      rzpInstance.on("payment.failed",function(resp){
        setAlert("❌ Payment failed: "+resp.error.description);
      });
      rzpInstance.open();

    }catch(err){
      setProc(false);
      setAlert("❌ "+err.message);
    }
  };

  /* ── OTHER PAYMENT FLOWS (COD, UPI manual, Card, Netbanking) ── */
  const validate=()=>{
    if(method==="upi"&&!pdata.upiId&&!upiApp){setAlert("Enter UPI ID or pick an app.");return false;}
    if(method==="card"){
      if(!pdata.card||pdata.card.length<16){setAlert("Enter valid 16-digit card number.");return false;}
      if(!pdata.cvv||pdata.cvv.length<3){setAlert("Enter valid CVV.");return false;}
    }
    if(method==="netbanking"&&!bank){setAlert("Please select your bank.");return false;}
    return true;
  };

  const handleOtherPay=async()=>{
    setAlert("");
    if(!validate())return;
    setProc(true);
    setProcMsg("Placing your order…");
    try{
      const label={
        cod:"Cash on Delivery",
        upi:`UPI${upiApp?" · "+upiApp:""}`,
        card:"Credit/Debit Card",
        netbanking:`Net Banking${bank?" · "+bank:""}`,
      }[method]||method;
      const order=await saveOrder(label, method!=="cod");
      setProc(false);
      onSuccess(label, order._id, total);
    }catch(err){
      setProc(false);
      setAlert("❌ "+err.message+". Is backend running on port 5000?");
    }
  };

  const handlePay=()=>{ method==="razorpay"?handleRazorpay():handleOtherPay(); };

  /* Sub-form shown under selected method */
  const payForm=()=>{
    if(method==="razorpay") return(
      <div className="rzp-info">
        <div className="rzp-info-title">⚡ Razorpay Secure Checkout</div>
        The Razorpay payment window will open. You can pay using:<br/>
        <strong style={{color:"var(--text)"}}>UPI · Credit/Debit Cards · Net Banking · Wallets</strong><br/>
        <span style={{fontSize:".75rem",color:"var(--muted)"}}>🔒 100% secure. Powered by Razorpay.</span>
      </div>
    );
    if(method==="cod") return(
      <div className="pay-form" style={{fontSize:".84rem",color:"var(--muted)",lineHeight:1.7}}>
        ✅ Pay cash when your order arrives. No advance needed.
      </div>
    );
    if(method==="upi") return(
      <div className="pay-form">
        <div className="field" style={{marginBottom:10}}>
          <label>UPI ID</label>
          <input placeholder="yourname@upi or 9876543210" onChange={upd("upiId")}/>
        </div>
        <div style={{fontSize:".72rem",textTransform:"uppercase",letterSpacing:".5px",color:"var(--muted)",marginBottom:6}}>Or choose app</div>
        <div className="upi-apps">
          {UPI_APPS.map(a=>(
            <div key={a.name} className={`upi-app${upiApp===a.name?" on":""}`}
              onClick={()=>{setUpiApp(a.name);setPdata(p=>({...p,app:a.name}))}}>
              {a.icon} {a.name}
            </div>
          ))}
        </div>
        {upiApp&&<p style={{fontSize:".76rem",color:"var(--accent)",marginTop:8}}>✓ {upiApp} selected</p>}
      </div>
    );
    if(method==="card") return(
      <div className="pay-form">
        <div className="field" style={{marginBottom:10}}>
          <label>Card Number</label>
          <input placeholder="4111 1111 1111 1111" maxLength={19}
            onChange={e=>{const v=e.target.value.replace(/\D/g,"").substring(0,16);
              e.target.value=v.replace(/(.{4})/g,"$1 ").trim();setPdata(p=>({...p,card:v}))}}/>
        </div>
        <div className="field" style={{marginBottom:10}}>
          <label>Cardholder Name</label>
          <input placeholder="Name on card" onChange={upd("chName")}/>
        </div>
        <div className="row-2">
          <div className="field"><label>Expiry</label><input placeholder="MM / YY" maxLength={7} onChange={upd("expiry")}/></div>
          <div className="field"><label>CVV</label><input placeholder="•••" maxLength={4} type="password" onChange={upd("cvv")}/></div>
        </div>
        <p style={{fontSize:".72rem",color:"var(--muted)"}}>🔒 256-bit SSL encrypted</p>
      </div>
    );
    if(method==="netbanking") return(
      <div className="pay-form">
        <div style={{fontSize:".72rem",textTransform:"uppercase",letterSpacing:".5px",color:"var(--muted)",marginBottom:8}}>Select Bank</div>
        <div className="bank-grid">
          {BANKS.map(b=>(
            <div key={b} className={`bank-btn${bank===b?" on":""}`}
              onClick={()=>{setBank(b);setPdata(p=>({...p,bank:b}))}}>
              🏦 {b}
            </div>
          ))}
        </div>
        {bank&&<p style={{fontSize:".76rem",color:"var(--accent)",marginTop:8}}>✓ {bank} selected</p>}
      </div>
    );
  };

  const btnLabel={
    razorpay:   `⚡ Pay ₹${total.toLocaleString("en-IN")} with Razorpay`,
    cod:        `🎁 Place Order (COD) · ₹${total.toLocaleString("en-IN")}`,
    upi:        `📱 Pay via UPI · ₹${total.toLocaleString("en-IN")}`,
    card:       `💳 Pay with Card · ₹${total.toLocaleString("en-IN")}`,
    netbanking: `🏦 Pay via Net Banking · ₹${total.toLocaleString("en-IN")}`,
  }[method];

  return(
    <>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">💳 Payment Method</div>

          {/* Delivery address mini banner */}
          <div style={{background:"var(--s2)",border:"1px solid var(--border)",borderRadius:9,
            padding:"10px 13px",marginBottom:"1.2rem",fontSize:".8rem",color:"var(--muted)"}}>
            📍 Delivering to{" "}
            <strong style={{color:"var(--text)"}}>{address?.city}, {address?.state}</strong> —{" "}
            <button onClick={onBack} style={{background:"none",border:"none",color:"var(--accent2)",
              cursor:"pointer",fontSize:".78rem",fontWeight:600}}>Change</button>
          </div>

          {alert&&<div className="alert-bar">{alert}</div>}

          {PAY_METHODS.map(m=>(
            <div key={m.id}>
              <div className={`pay-opt${m.rzp?" rzp":""}${method===m.id?" sel":""}`}
                onClick={()=>{setMethod(m.id);setAlert("");setUpiApp(null);setBank(null)}}>
                <div className="pay-left">
                  <div className="pay-icon">{m.icon}</div>
                  <div>
                    <div className="pay-name">
                      {m.label}
                      {m.rzp&&<span className="rzp-badge">RECOMMENDED</span>}
                    </div>
                    <div className="pay-sub">{m.sub}</div>
                  </div>
                </div>
                <div className="p-radio"><div className="p-dot"/></div>
              </div>
              {method===m.id&&payForm()}
            </div>
          ))}

          <button className="btn-primary" onClick={handlePay} disabled={processing}>
            {processing
              ?<><div className="spin"/><span>{procMsg}</span></>
              :<span>{btnLabel}</span>}
          </button>
          <div style={{textAlign:"center",marginTop:10,fontSize:".72rem",color:"var(--muted)"}}>
            🔒 100% Secure Checkout
          </div>
        </div>
        <Summary cartItems={cartItems} getCartTotal={getCartTotal} address={address}/>
      </div>

      {/* Full-screen processing overlay */}
      {processing&&(
        <div className="overlay">
          <div className="overlay-box">
            <div className="big-spin"/>
            <h3>{procMsg}</h3>
            <p style={{color:"var(--muted)",fontSize:".83rem"}}>
              Please wait, do not close this window
            </p>
            <div className="progress-bar"><div className="progress-fill"/></div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Step 3: Success ─── */
function SuccessStep({orderId,address,payMethod,cartItems,orderTotal}){
  const navigate=useNavigate();
  const [showInv,setShowInv]=useState(false);
  const sub=cartItems.reduce((s,i)=>s+i.price*i.quantity,0);
  const gst=Math.round(sub*.18*100)/100;
  const total=orderTotal||(sub+gst);

  return(
    <div>
      <div className="success-page">
        <div className="success-ring">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" className="check-path"/>
          </svg>
        </div>
        <h1>Payment Successful! 🎉</h1>
        <p className="sub">Your order is confirmed. Thank you for shopping with ShopEase!</p>

        <div className="meta-grid">
          <div className="meta-card">
            <div className="meta-label">Order ID</div>
            <div className="meta-val accent">#{orderId?.slice(-8)?.toUpperCase()}</div>
          </div>
          <div className="meta-card">
            <div className="meta-label">Payment</div>
            <div className="meta-val" style={{fontSize:".8rem",wordBreak:"break-all"}}>{payMethod}</div>
          </div>
          <div className="meta-card">
            <div className="meta-label">Amount Paid</div>
            <div className="meta-val accent">₹{total.toLocaleString("en-IN")}</div>
          </div>
          <div className="meta-card">
            <div className="meta-label">Est. Delivery</div>
            <div className="meta-val">3–5 Business Days</div>
          </div>
        </div>

        <div className="success-actions">
          <button className="action-btn primary" onClick={()=>setShowInv(true)}>📄 View Invoice</button>
          <button className="action-btn outline" onClick={()=>navigate("/orders")}>📦 My Orders</button>
          <button className="action-btn outline" onClick={()=>navigate("/dashboard")}>🛍️ Continue Shopping</button>
        </div>
      </div>

      {/* Tracking preview */}
      <div className="card" style={{marginBottom:"1.5rem"}}>
        <div className="card-title">🚚 Order Tracking</div>
        <div style={{fontSize:".8rem",color:"var(--muted)",marginBottom:"1.2rem"}}>
          Order ID:{" "}
          <strong style={{color:"var(--text)",fontFamily:"monospace"}}>
            #{orderId?.slice(-8)?.toUpperCase()}
          </strong>
          {address&&` · ${address.city}, ${address.state}`}
        </div>
        <div className="track-steps">
          {TRACKING.map((ev,i)=>(
            <div className="track-step" key={i}>
              <div className={`track-dot${ev.done?" done":ev.active?" active":""}`}>
                {ev.done&&<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#080c14" strokeWidth="2" strokeLinecap="round"><polyline points="8 2 4 7 2 5"/></svg>}
                {ev.active&&<div style={{width:6,height:6,borderRadius:"50%",background:"#fff"}}/>}
              </div>
              <div>
                <div className="track-event" style={{color:ev.active?"var(--accent2)":ev.done?"var(--text)":"var(--muted)"}}>{ev.label}</div>
                <div className="track-time">{ev.time}</div>
                {(ev.done||ev.active)&&<div className="track-detail">{ev.detail}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showInv&&(
        <InvoiceModal
          orderId={orderId} address={address} payMethod={payMethod}
          cartItems={cartItems} orderTotal={total}
          onClose={()=>setShowInv(false)}
        />
      )}
    </div>
  );
}

/* ─── Invoice Modal ─── */
function InvoiceModal({orderId,address,payMethod,cartItems,orderTotal,onClose}){
  const sub=cartItems.reduce((s,i)=>s+i.price*i.quantity,0);
  const gst=Math.round(sub*.18*100)/100;
  const total=orderTotal||(sub+gst);

  const download=()=>{
    const win=window.open("","_blank","width=700,height=900");
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice #${orderId?.slice(-8)?.toUpperCase()}</title>
    <style>body{font-family:Arial,sans-serif;padding:32px;color:#111;max-width:640px;margin:0 auto}
    h1{color:#00b87a;font-size:1.8rem;margin-bottom:4px}
    table{width:100%;border-collapse:collapse;margin:16px 0}
    th{background:#f5f5f5;text-align:left;padding:8px 10px;font-size:.78rem;text-transform:uppercase}
    td{padding:9px 10px;border-bottom:1px solid #eee;font-size:.85rem}
    td:last-child,th:last-child{text-align:right}
    .totals{margin-left:auto;width:220px}
    .tr{display:flex;justify-content:space-between;padding:4px 0;font-size:.85rem;color:#555}
    .grand{font-weight:700;font-size:1rem;color:#111;border-top:1px solid #ddd;padding-top:8px;margin-top:4px}
    .footer{background:#f9f9f9;border-radius:8px;padding:10px 14px;text-align:center;font-size:.75rem;color:#888;margin-top:16px}
    @media print{button{display:none}}</style></head><body>
    <h1>ShopEase</h1><p style="color:#888;font-size:.82rem">Tax Invoice</p>
    <hr style="border:none;border-top:1px solid #eee;margin:12px 0">
    <div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:.82rem">
      <div><strong>Order ID:</strong> #${orderId?.slice(-8)?.toUpperCase()}<br>
           <strong>Date:</strong> ${today()}<br>
           <strong>Payment:</strong> ${payMethod}</div>
      <div style="text-align:right"><strong>Ship to:</strong><br>
           ${address?.name||"Customer"}<br>${address?.line1||""}<br>
           ${address?.city||""}, ${address?.state||""} – ${address?.pin||""}</div>
    </div>
    <table><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead>
    <tbody>${cartItems.map((it,i)=>
      `<tr><td>${i+1}</td><td>${it.name}</td><td>${it.quantity}</td>
       <td>₹${Number(it.price).toLocaleString("en-IN")}</td>
       <td>₹${(it.price*it.quantity).toLocaleString("en-IN")}</td></tr>`).join("")}
    </tbody></table>
    <div class="totals">
      <div class="tr"><span>Subtotal</span><span>₹${sub.toLocaleString("en-IN")}</span></div>
      <div class="tr"><span>GST (18%)</span><span>₹${gst.toFixed(2)}</span></div>
      <div class="tr"><span>Shipping</span><span style="color:#00b87a">FREE</span></div>
      <div class="tr grand"><span>Total</span><span>₹${total.toLocaleString("en-IN")}</span></div>
    </div>
    <div class="footer">Thank you for shopping with ShopEase! · support@shopease.in</div>
    <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),1200)}<\/script>
    </body></html>`);
    win.document.close();
  };

  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>📄 Invoice — #{orderId?.slice(-8)?.toUpperCase()}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="invoice-preview">
          <div className="inv-header">
            <div><div className="inv-brand">ShopEase</div><div className="inv-tag">Tax Invoice</div></div>
            <div className="inv-meta">
              <div>Order: <strong>#{orderId?.slice(-8)?.toUpperCase()}</strong></div>
              <div>Date: <strong>{today()}</strong></div>
              <div>Status: <strong style={{color:"var(--accent)"}}>✓ PAID</strong></div>
            </div>
          </div>
          <div className="inv-parties">
            <div>
              <div className="inv-party-label">Bill From</div>
              <div className="inv-party-name">ShopEase Pvt. Ltd.</div>
              <div className="inv-party-addr">MG Road, Bengaluru – 560001<br/>Karnataka, India</div>
            </div>
            <div>
              <div className="inv-party-label">Ship To</div>
              <div className="inv-party-name">{address?.name||"Customer"}</div>
              <div className="inv-party-addr">
                {address?.line1}<br/>
                {address?.city}, {address?.state} – {address?.pin}
              </div>
            </div>
          </div>
          <table className="inv-table">
            <thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
            <tbody>
              {cartItems.map((it,i)=>(
                <tr key={i}>
                  <td style={{color:"var(--muted)"}}>{i+1}</td>
                  <td>{it.name}</td>
                  <td>{it.quantity}</td>
                  <td>₹{Number(it.price).toLocaleString("en-IN")}</td>
                  <td><strong>₹{(it.price*it.quantity).toLocaleString("en-IN")}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="inv-totals">
            <div className="inv-total-row"><span>Subtotal</span><span>₹{sub.toLocaleString("en-IN")}</span></div>
            <div className="inv-total-row"><span>GST (18%)</span><span>₹{gst.toFixed(2)}</span></div>
            <div className="inv-total-row"><span>Shipping</span><span className="free">FREE</span></div>
            <div className="inv-total-row grand"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
          </div>
          <div style={{marginTop:"1rem",fontSize:".78rem",color:"var(--muted)"}}>
            Payment: <strong style={{color:"var(--text)"}}>{payMethod}</strong>
          </div>
          <div className="inv-footer">Thank you for shopping with ShopEase!</div>
        </div>
        <div className="inv-actions">
          <button className="btn-primary" style={{margin:0,flex:1}} onClick={download}>⬇️ Download / Print</button>
          <button className="btn-secondary" style={{margin:0,flex:1}} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Root Component ─── */
export default function ShopEase(){
  const navigate=useNavigate();
  const {cartItems,getCartTotal,clearCart}=useCart();
  const [step,setStep]=useState(0);
  const [address,setAddress]=useState(null);
  const [orderId,setOrderId]=useState("");
  const [payMethod,setPayMethod]=useState("");
  const [orderTotal,setOrderTotal]=useState(0);
  const [snapItems,setSnapItems]=useState([]); // cart snapshot after clearing

  useEffect(()=>{
    const tag=document.createElement("style");
    tag.setAttribute("data-shopease","1");
    tag.textContent=STYLES;
    document.head.appendChild(tag);
    return()=>document.head.querySelector("[data-shopease]")?.remove();
  },[]);

  // Empty cart guard
  if(cartItems.length===0&&step!==2){
    return(
      <>
        <style>{STYLES}</style>
        <div className="app" style={{textAlign:"center",paddingTop:"5rem"}}>
          <div style={{fontSize:"3.5rem",marginBottom:"1rem"}}>🛒</div>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,marginBottom:8,color:"var(--text)"}}>
            Your cart is empty
          </h2>
          <p style={{color:"var(--muted)",marginBottom:24}}>Add some products before checking out.</p>
          <button className="btn-primary" style={{width:"auto",padding:"12px 32px"}}
            onClick={()=>navigate("/dashboard")}>Browse Products</button>
        </div>
      </>
    );
  }

  const handleAddressDone=addr=>{
    setAddress(addr);
    setStep(1);
    window.scrollTo({top:0});
  };

  const handlePaySuccess=(method,backendId,total)=>{
    setSnapItems([...cartItems]); // snapshot before clearing
    setPayMethod(method);
    setOrderId(backendId);
    setOrderTotal(total);
    clearCart();
    setStep(2);
    window.scrollTo({top:0});
  };

  return(
    <div className="app">
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:"1.8rem",flexWrap:"wrap"}}>
        <button onClick={()=>navigate("/dashboard")}
          style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",
            borderRadius:9,padding:"8px 16px",color:"rgba(255,255,255,.7)",cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif",fontSize:13}}>
          ← Back
        </button>
        <div style={{textAlign:"center",flex:1}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:"1.6rem",color:"var(--accent)"}}>
            ShopEase 🛒
          </div>
          <div style={{fontSize:".78rem",color:"var(--muted)",marginTop:3}}>
            {step===0?"Select delivery address":step===1?"Choose how to pay":"Payment successful!"}
          </div>
        </div>
      </div>

      <Stepper step={step}/>

      {step===0&&<AddressStep onNext={handleAddressDone} cartItems={cartItems} getCartTotal={getCartTotal}/>}
      {step===1&&<PaymentStep address={address} onSuccess={handlePaySuccess} onBack={()=>setStep(0)} cartItems={cartItems} getCartTotal={getCartTotal}/>}
      {step===2&&<SuccessStep orderId={orderId} address={address} payMethod={payMethod} cartItems={snapItems} orderTotal={orderTotal}/>}
    </div>
  );
}