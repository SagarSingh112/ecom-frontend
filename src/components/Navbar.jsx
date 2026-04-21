import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiLogOut, FiUser, FiPackage, FiHome } from 'react-icons/fi';
import { BsShop } from 'react-icons/bs';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg shadow-xl sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BsShop className="text-3xl text-purple-400" />
            <span className="text-2xl font-bold neon-text text-white">SHOPZONE</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-purple-300 transition-colors flex items-center space-x-1">
              <FiHome />
              <span>Home</span>
            </Link>

            {user && (
              <>
                <Link to="/dashboard" className="text-white hover:text-purple-300 transition-colors">
                  Dashboard
                </Link>
                <Link to="/myproducts" className="text-white hover:text-purple-300 transition-colors">
                  My Products
                </Link>
                <Link to="/orders" className="text-white hover:text-purple-300 transition-colors flex items-center space-x-1">
                  <FiPackage />
                  <span>Orders</span>
                </Link>
              </>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative">
              <FiShoppingCart className="text-2xl text-white hover:text-purple-300 transition-colors" />
              {cartItems.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-white">
                  <FiUser />
                  <span className="hidden md:inline">{user.name}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="text-white hover:text-red-400 transition-colors"
                >
                  <FiLogOut />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-white hover:text-purple-300 transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;