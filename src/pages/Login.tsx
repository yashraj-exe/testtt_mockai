import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, AtSign, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-5 gap-6 relative">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="fixed md:absolute top-4 left-4 z-50 bg-[rgb(var(--card))] md:bg-[rgb(var(--accent))]/20 hover:bg-[rgb(var(--accent))]/30 text-[rgb(var(--accent))] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm md:shadow-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="md:inline">Back</span>
        </motion.button>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[rgb(var(--card))] p-8 rounded-xl backdrop-blur-lg shadow-sm md:col-span-3"
        >
          <div className="flex justify-center mb-6">
            <UserCircle className="w-16 h-16 text-[rgb(var(--accent))]" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
          <p className="text-[rgb(var(--muted))] text-center mb-6">Sign in to continue your journey</p>
          
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-200 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted))] w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[rgb(var(--card-hover))] border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted))] w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 rounded-lg bg-[rgb(var(--card-hover))] border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] transition-colors"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white font-semibold py-2 px-4 rounded-lg transition duration-200 relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2">Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </motion.div>

        {/* Sign Up Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-hover))] p-8 rounded-xl text-white flex flex-col justify-center md:col-span-2"
        >
          <h3 className="text-2xl font-bold mb-4">New Here?</h3>
          <p className="mb-6 text-white/90">
            Join our community of professionals and take your interview skills to the next level
          </p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              Practice with AI-powered interviews
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              Get detailed feedback and insights
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              Track your progress over time
            </li>
          </ul>
          <Link
            to="/register"
            className="bg-white text-[rgb(var(--accent))] hover:bg-white/90 font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            Create Account <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}