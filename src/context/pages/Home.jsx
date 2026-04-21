import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useCart } from "../CartContext";
import { BsCartPlus } from "react-icons/bs";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const Home = () => {
  const { addToCart } = useCart();
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://https://ecom-backend-16sc.onrender.com/api/products")
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      {/* ✅ Navbar */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 30px",
        background: "#1a1a2e",
        color: "white"
      }}>
        <h2 style={{ margin: 0 }}>🛒 MyShop</h2>

        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>Home</Link>
          <Link to="/cart" style={{ color: "white", textDecoration: "none" }}>Cart</Link>

          {user ? (
            <>
              <Link to="/dashboard" style={{ color: "white", textDecoration: "none" }}>Dashboard</Link>
              <Link to="/orders" style={{ color: "white", textDecoration: "none" }}>Orders</Link>
              <button
                onClick={logout}
                style={{
                  padding: "6px 14px",
                  background: "crimson",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                color: "white",
                textDecoration: "none",
                padding: "6px 14px",
                background: "#6c63ff",
                borderRadius: "5px"
              }}>
                Login
              </Link>
              <Link to="/register" style={{
                color: "white",
                textDecoration: "none",
                padding: "6px 14px",
                background: "#28a745",
                borderRadius: "5px"
              }}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ✅ Products */}
      <div style={{ padding: "20px" }}>
        <h2>Products</h2>

        {products.length === 0 ? (
          <p style={{ color: "gray" }}>No products found. Make sure your backend is running.</p>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px"
          }}>
            {products.map(product => (
              <motion.div
                key={product._id}
                whileHover={{ scale: 1.05 }}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  borderRadius: "10px",
                  textAlign: "center"
                }}
              >
                <h4>{product.name}</h4>
                <p>₹{product.price}</p>

                <button
                  onClick={() => addToCart(product)}
                  style={{
                    padding: "8px 15px",
                    background: "black",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  <BsCartPlus /> Add to Cart
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;