import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ClipboardList, Award, ArrowRight, ChevronUp, ChevronDown, Search, Filter, SlidersHorizontal, AlertCircle, Eye, Play, FileText, Clock, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Interview {
  id: string;
  title: string;
  dateAndTime: string;
  interviewType: string;
  level: string;
  status: 'pending' | 'completed' | 'canceled' | 'scheduled';
  scheduledTime?: string;
  interviewDuration: number;
}

interface InterviewCardProps {
  interview: Interview;
  index: number;
  onNavigate: (path: string) => void;
}

const useCountdown = (targetDate: string | undefined) => {
  // targetDate = "2025-04-01T11:59:30.845Z"
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isTimeToStart, setIsTimeToStart] = useState(false);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft('');
      setIsTimeToStart(false);
      return;
    }

    const calculateTimeLeft = () => {
      // Get current time in Asia/Kolkata timezone
      const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const currentTime = new Date(now).getTime();

      // Convert target date to Asia/Kolkata timezone
      const target = new Date(targetDate).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const targetTime = new Date(target).getTime();
      
      const difference = targetTime - currentTime;
      
      if (difference <= 0) {
        setIsTimeToStart(true);
        setTimeLeft('');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      let timeString = '';
      if (days > 0) timeString += `${days}d `;
      if (hours > 0) timeString += `${hours}h `;
      if (minutes > 0) timeString += `${minutes}m `;
      timeString += `${seconds}s`;

      setTimeLeft(timeString.trim());
      setIsTimeToStart(false);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return { timeLeft, isTimeToStart };
};

const InterviewCard: React.FC<InterviewCardProps> = ({ interview, index, onNavigate }) => {
  const { timeLeft, isTimeToStart } = useCountdown(interview.scheduledTime);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'canceled':
        return 'bg-red-500/20 text-red-400';
      case 'scheduled':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  const formatDuration = (duration: number) => {
    if (duration === 0) return 'Not started';
    return `${duration}m`;
    };

  return (
    <motion.div
      key={interview.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-4 md:p-6 hover:bg-[rgb(var(--card-hover))] transition-colors shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg md:text-xl font-semibold">{interview.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(interview.status)}`}>
              {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-[rgb(var(--muted))]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {interview.dateAndTime}
            </div>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              {interview.interviewType}
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Experience: {interview.level}
            </div>
            {interview.interviewDuration > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duration: {formatDuration(interview.interviewDuration)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            {(interview.status === 'scheduled' || interview.status === 'pending') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate(`/interview-room/${interview.id}`)}
                disabled={interview.status === 'scheduled' && !isTimeToStart}
                className={`w-full md:w-auto px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm ${
                  interview.status === 'scheduled' && !isTimeToStart
                    ? 'bg-[rgb(var(--card-hover))] text-[rgb(var(--muted))] cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {interview.status === 'scheduled' && !isTimeToStart ? (
                  <>
                    <Timer className="w-4 h-4" />
                    <span>Starts in {timeLeft}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start Interview</span>
                  </>
                )}
              </motion.button>
            )}
            
            {interview.status === 'completed' ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate(`/interview/${interview.id}`)}
                className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-[rgb(var(--accent))] hover:from-purple-600 hover:to-[rgb(var(--accent-hover))] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                <Eye className="w-4 h-4" />
                View Feedback
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate(`/interview/${interview.id}`)}
                className="w-full md:w-auto bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4" />
                View Details
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Interviews() {
  const navigate = useNavigate();
  const { getInterviews, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'canceled' | 'scheduled'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetchedInterviews, setHasFetchedInterviews] = useState(false);
  const [filterInterviewType, setFilterInterviewType] = useState<string>('all');

  useEffect(() => {
    const fetchInterviews = async () => {
      if (user && !hasFetchedInterviews && !user.interviews.length) {
        setIsLoading(true);
        setError(null);

        try {
          const result = await getInterviews();
          if (!result.success) {
            setError(result.message);
          } else {
            setHasFetchedInterviews(true);
          }
        } catch (err) {
          setError('Failed to fetch interviews');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, [user, getInterviews, hasFetchedInterviews]);

  const filteredInterviews = (user?.interviews || [])
    .filter(interview => 
      (interview.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       interview.level.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterLevel === 'all' || interview.level === filterLevel) &&
      (filterStatus === 'all' || interview.status === filterStatus) &&
      (filterInterviewType === 'all' || interview.interviewType === filterInterviewType)
    )
    .sort((a, b) => {
      const dateA = new Date(a.dateAndTime.replace(/(\d{2})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}) (AM|PM)/, '20$3-$2-$1 $4:$5 $6')).getTime();
      const dateB = new Date(b.dateAndTime.replace(/(\d{2})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}) (AM|PM)/, '20$3-$2-$1 $4:$5 $6')).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const levels = Array.from(new Set((user?.interviews || []).map(interview => interview.level)));
  const interviewTypes = Array.from(new Set((user?.interviews || []).map(interview => interview.interviewType)));

  return (
    <div className="min-h-screen p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto space-y-4 md:space-y-6"
      >
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Interview Details</h1>
         
          <div className="bg-[rgb(var(--card))] backdrop-blur-sm rounded-lg p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted))] w-4 h-4" />
              <input
                type="text"
                placeholder="Search interviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--card-hover))] rounded-lg border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors"
              />
            </div>

            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="md:hidden w-full flex items-center justify-between px-4 py-2 bg-[rgb(var(--card-hover))] rounded-lg border border-[rgb(var(--border))] transition-colors"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </div>
              {isFilterOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            <AnimatePresence>
              {(isFilterOpen || window.innerWidth >= 768) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 md:space-y-0 md:flex md:gap-4"
                >
                  <div className="relative flex-1">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted))] w-4 h-4" />
                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--card-hover))] rounded-lg border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors"
                    >
                      <option value="all">All Levels</option>
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative flex-2">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted))] w-4 h-4" />
                    <select
                      value={filterInterviewType}
                      onChange={(e) => setFilterInterviewType(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--card-hover))] rounded-lg border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors"
                    >
                      <option value="all">All Types</option>
                      {interviewTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'completed' | 'canceled' | 'scheduled')}
                    className="w-full md:w-auto px-4 py-2 bg-[rgb(var(--card-hover))] rounded-lg border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[rgb(var(--card-hover))] rounded-lg border border-[rgb(var(--border))] hover:bg-[rgb(var(--border))] transition-colors"
                  >
                    {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Date
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
                <p className="text-[rgb(var(--muted))]">Loading interviews...</p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-200">{error}</p>
            </motion.div>
          ) : !user?.interviews.length ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12 bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl shadow-sm"
            >
              <p className="text-[rgb(var(--muted))]">No interviews found. Create your first interview to get started!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/create-interview')}
                className="mt-4 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                Create Interview <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ) : filteredInterviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12 bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl shadow-sm"
            >
              <p className="text-[rgb(var(--muted))]">No interviews match your search criteria</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredInterviews.map((interview, index) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  index={index}
                  onNavigate={navigate}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}