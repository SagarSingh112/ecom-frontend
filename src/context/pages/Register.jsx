import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone, FiUserPlus } from 'react-icons/fi';
import { BsEmojiSmile, BsEmojiWink, BsEmojiHeartEyes } from 'react-icons/bs';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");        // ✅ Added
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {            // ✅ Fixed
    e.preventDefault();
    setLoading(true);
    setError("");
    const success = await register(formData.name, formData.email, formData.password, formData.phone);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    } else {
      setError("Registration failed. Email may already exist.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md neon-border"
      >
        {/* Emoji Animation */}
        <div className="flex justify-center space-x-4 mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <BsEmojiSmile className="text-4xl text-yellow-400" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <BsEmojiHeartEyes className="text-4xl text-pink-500" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <BsEmojiWink className="text-4xl text-blue-400" />
          </motion.div>
        </div>

        <h2 className="text-4xl font-bold text-center mb-8 neon-text text-white">
          Join SHOPZONE! 🎉
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2">Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-30 rounded-lg focus:outline-none glow-input text-white placeholder-gray-300"
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-white mb-2">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-30 rounded-lg focus:outline-none glow-input text-white placeholder-gray-300"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-white mb-2">Phone</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-3 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-30 rounded-lg focus:outline-none glow-input text-white placeholder-gray-300"
                placeholder="Enter 10-digit phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-white mb-2">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-30 rounded-lg focus:outline-none glow-input text-white placeholder-gray-300"
                placeholder="Create a password (min 6 characters)"
              />
            </div>
          </div>

          {/* ✅ Error message added here */}
          {error && (
            <p className="text-red-400 text-center text-sm">{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full btn-neon text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <FiUserPlus />
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
          </motion.button>
        </form>

        <p className="mt-6 text-center text-white">
          Already have an account?{' '}
          <Link to="/login" className="text-yellow-300 hover:text-yellow-400 font-semibold hover:underline">
            Login here 🔐
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;