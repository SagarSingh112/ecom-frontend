import React, { createContext, useContext, useState, useEffect } from 'react';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const u = localStorage.getItem('user');
      if (u) setUser(JSON.parse(u));
    } catch { localStorage.clear(); }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await fetch('https://ecom-backend-16sc.onrender.com/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg);
    localStorage.setItem('user',  JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, phone) => {
    const res = await fetch('https://ecom-backend-16sc.onrender.com/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name, email, password, phone }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg);
    localStorage.setItem('user',  JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => { localStorage.removeItem('user'); localStorage.removeItem('token'); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
};