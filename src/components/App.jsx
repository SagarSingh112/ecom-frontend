// src/components/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth }        from '../context/AuthContext';
import Login              from '../context/pages/Login';
import Dashboard          from '../context/pages/Dashboard';
import Checkout           from '../context/pages/Checkout';
import Orders             from '../context/pages/Orders';
import AdminDashboard     from '../context/pages/AdminDashboard';
import AdminLogin         from '../context/pages/AdminLogin';
import SupportPage        from '../context/pages/SupportPage';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0a0a2e', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#fff', fontFamily:'Poppins,sans-serif', gap:14 }}>
      <div style={{ fontSize:52 }}>🛍️</div>
      <p style={{ margin:0, color:'rgba(255,255,255,0.6)', fontSize:16 }}>Loading ShopZone...</p>
    </div>
  );

  return (
    <Routes>
      <Route path="/"            element={<Navigate to={user ? (user.isAdmin ? '/admin' : '/dashboard') : '/login'} replace />} />
      <Route path="/login"       element={!user ? <Login /> : <Navigate to={user.isAdmin ? '/admin' : '/dashboard'} replace />} />
      <Route path="/admin-login" element={!user ? <AdminLogin /> : <Navigate to={user.isAdmin ? '/admin' : '/dashboard'} replace />} />
      <Route path="/dashboard"   element={user && !user.isAdmin ? <Dashboard /> : <Navigate to={user ? '/admin' : '/login'} replace />} />
      <Route path="/checkout"    element={user ? <Checkout />  : <Navigate to="/login" replace />} />
      <Route path="/orders"      element={user ? <Orders />    : <Navigate to="/login" replace />} />
      <Route path="/admin"       element={user?.isAdmin ? <AdminDashboard /> : <Navigate to="/admin-login" replace />} />

      {/* ✅ Support page — accessible to all logged-in users */}
      <Route path="/support"     element={user ? <SupportPage /> : <Navigate to="/login" replace />} />

      <Route path="*"            element={<Navigate to={user ? (user.isAdmin ? '/admin' : '/dashboard') : '/login'} replace />} />
    </Routes>
  );
}