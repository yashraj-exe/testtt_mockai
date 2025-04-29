import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Users, UserCircle, Sun, Moon, Home, Plus, Menu, X, LogOut, MessageSquare, Star, CheckCircle, Trophy, Calendar, BookOpen, Coins } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Interviews from './pages/Interviews';
import CreateInterview from './pages/CreateInterview';
import InterviewRoom from './pages/InterviewRoom';
import InterviewDetails from './pages/InterviewDetails';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import Leaderboard from './pages/Leaderboard';
import Experts from './pages/Experts';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import BuyCreditsModal from './components/BuyCreditsModal';

export const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-0 ${className}`}>
    <span className="text-2xl font-bold">Inter</span>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="32" 
      height="32" 
      viewBox="0 0 256 256"
      className="text-[rgb(var(--accent))]"
    >
      <g fill="currentColor" fillRule="nonzero">
        <path d="M53.333 21.333c-17.551 0-32 14.449-32 32v149.334c0 17.551 14.449 32 32 32h149.334c17.551 0 32-14.449 32-32v-85.334h-21.334v85.334c0 5.915-4.752 10.666-10.666 10.666H53.333c-5.915 0-10.666-4.751-10.666-10.666V53.333c0-5.915 4.751-10.666 10.666-10.666h96v-21.334h-96zM218.379 41.749l-99.125 105.083-39.168-39.168-15.083 15.083 54.688 54.688 114.208-121.043-15.52-14.643z" />
      </g>
    </svg>
    <span className="text-2xl font-bold">iewSync</span>
  </div>
);

export const SidebarContext = React.createContext<{
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}>({
  showSidebar: true,
  setShowSidebar: () => {},
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { logout, user, submitFeedback, isLoggingOut, setIsLoggingOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const { showSidebar } = React.useContext(SidebarContext);
  
  const isLandingPage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const shouldShowSidebar = showSidebar && !isLandingPage && !isLoginPage && !isRegisterPage && user;
  
  if (!shouldShowSidebar) return null;

const links = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/create-interview', icon: Plus, label: 'Create Interview' },
  { path: '/interviews', icon: FileText, label: 'View Interviews' },
  { path: '/experts', icon: Users, label: 'Expert Interviews' },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { path: '/profile', icon: UserCircle, label: 'Profile' },
];


  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/login');
  };

  const handleFeedback = () => {
    setShowFeedbackModal(true);
  };

  const getRatingEmoji = (value: number) => {
    switch (value) {
      case 1:
        return '😢';
      case 2:
        return '😞';
      case 3:
        return '😐';
      case 4:
        return '🙂';
      case 5:
        return '😄';
      default:
        return '';
    }
  };

  const getRatingLabel = (value: number) => {
    switch (value) {
      case 1:
        return 'Sad';
      case 2:
        return 'Disappointed';
      case 3:
        return 'Neutral';
      case 4:
        return 'Happy';
      case 5:
        return 'Extremely Happy';
      default:
        return '';
    }
  };

  const handleSubmitFeedback = async () => {
    const result = await submitFeedback(rating, feedbackText);
    
    if (result.success) {
      setShowFeedbackModal(false);
      setShowFeedbackSuccess(true);
      
      setFeedbackText('');
      setRating(0);

      setTimeout(() => {
        setShowFeedbackSuccess(false);
      }, 5000);
    }
  };

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 px-2 py-4">
        <Users className="w-8 h-8 text-[rgb(var(--accent))]" />
        <span className="text-xl font-bold">AI Interview</span>
      </div>
      
      <nav className="flex-1 mt-8">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === link.path
                    ? 'bg-[rgb(var(--accent))] text-white'
                    : 'hover:bg-[rgb(var(--card-hover))]'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-2 mt-auto">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[rgb(var(--card-hover))] transition-colors"
        >
          {isDark ? (
            <>
              <Sun className="w-5 h-5" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="w-5 h-5" />
              Dark Mode
            </>
          )}
        </button>

        <button
          onClick={() => setShowBuyCreditsModal(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[rgb(var(--card-hover))] transition-colors text-yellow-400"
        >
          <Coins className="w-5 h-5" />
          Buy Credits
        </button>

        <button
          onClick={handleFeedback}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[rgb(var(--card-hover))] transition-colors text-blue-400"
        >
          <MessageSquare className="w-5 h-5" />
          Feedback
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[rgb(var(--card-hover))] transition-colors text-red-400"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      <BuyCreditsModal 
        isOpen={showBuyCreditsModal} 
        onClose={() => setShowBuyCreditsModal(false)} 
      />
    </>
  );

  return (
    <>
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[rgb(var(--card))] rounded-xl p-6 max-w-sm w-full m-4 text-center"
            >
              <LogOut className="w-12 h-12 mx-auto mb-4 text-[rgb(var(--accent))]" />
              <h2 className="text-xl font-bold mb-2">Logging out...</h2>
              <p className="text-[rgb(var(--muted))]">Thank you for using AI Interview!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[rgb(var(--card))] md:hidden"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      <div className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-[rgb(var(--card))] border-r border-[rgb(var(--border))] p-4 flex-col">
        {sidebarContent}
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed left-0 top-0 h-screen w-64 bg-[rgb(var(--card))] border-r border-[rgb(var(--border))] p-4 flex flex-col z-50 md:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowFeedbackModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[rgb(var(--card))] rounded-xl p-6 max-w-md w-full shadow-lg"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold">How was your experience?</h2>
                <p className="text-[rgb(var(--muted))] text-sm mt-1">Your feedback helps us improve</p>
              </div>
              
              <div className="flex justify-center mb-8">
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setRating(value)}
                      onMouseEnter={() => setHoveredRating(value)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="relative group"
                    >
                      <div className="flex flex-col items-center">
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            value <= (hoveredRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-[rgb(var(--muted))]'
                          }`}
                        />
                        
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ 
                            opacity: (hoveredRating === value || rating === value) ? 1 : 0,
                            y: (hoveredRating === value || rating === value) ? 0 : -10
                          }}
                          className="h-8 mt-2 text-2xl"
                        >
                          {getRatingEmoji(value)}
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: (hoveredRating === value || rating === value) ? 1 : 0
                          }}
                          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                        >
                          <span className="text-xs px-2 py-1 bg-[rgb(var(--card-hover))] rounded-md">
                            {getRatingLabel(value)}
                          </span>
                        </motion.div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="block text-sm font-medium">
                  Tell us more (optional)
                </label>
                <textarea
                  placeholder="What went well? What could be improved?"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[rgb(var(--card-hover))] border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors h-24"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 rounded-lg hover:bg-[rgb(var(--card-hover))] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  disabled={!rating}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    rating
                      ? 'bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white'
                      : 'bg-[rgb(var(--card-hover))] text-[rgb(var(--muted))] cursor-not-allowed'
                  }`}
                >
                  Send Feedback
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFeedbackSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
          >
            <CheckCircle className="w-5 h-5" />
            <p>Thank you for your feedback! We'll use it to improve your experience.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { showSidebar } = React.useContext(SidebarContext);
  const { user } = useAuth();
  
  const isLandingPage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const shouldAddPadding = showSidebar && !isLandingPage && !isLoginPage && !isRegisterPage && user;

  return (
    <div className={shouldAddPadding ? 'md:pl-64' : ''}>
      {children}
    </div>
  );
}

function App() {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarContext.Provider value={{ showSidebar, setShowSidebar }}>
          <BrowserRouter>
            <Sidebar />
            <AppLayout>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/interviews" element={<ProtectedRoute><Interviews /></ProtectedRoute>} />
                <Route path="/create-interview" element={<ProtectedRoute><CreateInterview /></ProtectedRoute>} />
                <Route path="/interview-room/:id" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
                <Route path="/interview/:id" element={<ProtectedRoute><InterviewDetails /></ProtectedRoute>} />
                <Route path="/experts" element={<ProtectedRoute><Experts /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </SidebarContext.Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;