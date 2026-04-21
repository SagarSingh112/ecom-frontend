import React, { createContext, useContext, useState } from 'react';
const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart     = (p)        => setCartItems(prev => { const f = prev.find(i => i._id === p._id); return f ? prev.map(i => i._id===p._id ? {...i, quantity:i.quantity+1} : i) : [...prev, {...p, quantity:1}]; });
  const removeFromCart= (id)       => setCartItems(prev => prev.filter(i => i._id !== id));
  const updateQuantity= (id, qty)  => { if (qty <= 0) { removeFromCart(id); return; } setCartItems(prev => prev.map(i => i._id===id ? {...i, quantity:qty} : i)); };
  const clearCart     = ()         => setCartItems([]);
  const getCartTotal  = ()         => cartItems.reduce((t, i) => t + i.price * i.quantity, 0);
  const getCartCount  = ()         => cartItems.reduce((t, i) => t + i.quantity, 0);

  return <Ctx.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount }}>{children}</Ctx.Provider>;
};