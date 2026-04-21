import { useCart } from "../CartContext";
import { useAuth } from "../AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { FiTrash2, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { BsCartX } from 'react-icons/bs';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <BsCartX className="text-8xl text-gray-400 mb-4" />
        <h2 className="text-2xl text-white mb-4">Your cart is empty</h2>
        <Link
          to="/"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
        >
          <FiArrowLeft />
          <span>Continue Shopping</span>
        </Link>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart 🛒</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-2xl p-4 flex flex-col md:flex-row gap-4"
            >
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-32 h-32 object-cover rounded-lg"
              />
              
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-2">
                  {item.name}
                </h3>
                <p className="text-purple-200 text-sm mb-2">{item.brand}</p>
                <p className="text-white font-bold text-xl">₹{item.price}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white bg-opacity-20 rounded-lg">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="px-3 py-1 text-white hover:bg-white hover:bg-opacity-10 rounded-l-lg"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="px-3 py-1 text-white hover:bg-white hover:bg-opacity-10 rounded-r-lg"
                  >
                    +
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-400 hover:text-red-500"
                >
                  <FiTrash2 size={20} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-2xl p-6 sticky top-24">
            <h2 className="text-2xl font-bold text-white mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-white">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Tax (18% GST)</span>
                <span>₹{tax}</span>
              </div>
              <div className="border-t border-gray-600 pt-3">
                <div className="flex justify-between text-white font-bold text-xl">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCheckout}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <FiShoppingBag />
              <span>Proceed to Checkout</span>
            </motion.button>

            <Link
              to="/"
              className="mt-4 text-center text-white hover:text-purple-300 transition-colors flex items-center justify-center space-x-1"
            >
              <FiArrowLeft />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;