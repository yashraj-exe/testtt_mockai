import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Trophy, Medal, Users, Crown, Star, Filter, Info, ArrowUpDown, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LeaderboardUser {
  name: string;
  points: number;
  rank: number;
  avatar: string;
  interviews: number;
  averageScore: number;
}

export default function Leaderboard() {
  const { getLeaderboard, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'rank' | 'points' | 'interviews' | 'averageScore'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [highlightedUser, setHighlightedUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<{
    topPerformers: LeaderboardUser[];
    allUsers: LeaderboardUser[];
  }>({
    topPerformers: [],
    allUsers: []
  });
  const usersPerPage = 10;

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await getLeaderboard();
        
        if (result.success && result.data) {
          setLeaderboardData({
            topPerformers: result.data.topPerformers || [],
            allUsers: result.data.allUsers || []
          });
        } else {
          setError(result.message || 'Failed to fetch leaderboard data');
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboardData();
  }, [getLeaderboard]);
  
  // Filter users based on search term
  const filteredUsers = leaderboardData.allUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort users based on selected criteria
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'rank':
        comparison = a.rank - b.rank;
        break;
      case 'points':
        comparison = b.points - a.points;
        break;
      case 'interviews':
        comparison = b.interviews - a.interviews;
        break;
      case 'averageScore':
        comparison = b.averageScore - a.averageScore;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  // Get top 3 performers
  const topPerformers = leaderboardData.topPerformers.slice(0, 3);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to leaderboard section smoothly
    document.getElementById('leaderboard-table')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSort = (criteria: 'rank' | 'points' | 'interviews' | 'averageScore') => {
    if (sortBy === criteria) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      setSortOrder('asc');
    }
  };

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  const getSortIcon = (column: 'rank' | 'points' | 'interviews' | 'averageScore') => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />;
  };

  const getTrophyIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-700" />;
      default:
        return <span className="text-lg font-bold text-[rgb(var(--muted))]">{rank}</span>;
    }
  };

  // Find current user in the leaderboard
  const currentUserData = user ? leaderboardData.allUsers.find(u => u.name === user.name) : null;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Global Leaderboard</h1>
          <p className="text-[rgb(var(--muted))]">
            See how you stack up against other users. Climb the ranks by completing more interviews and earning points!
          </p>

          {isLoading ? (
            <div className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-12 shadow-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
                <p className="text-[rgb(var(--muted))]">Loading leaderboard data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 text-center">
              <p className="text-red-200 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500/30 hover:bg-red-500/40 text-red-100 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Top Performers Podium */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[rgb(var(--card))] to-[rgb(var(--card-hover))] backdrop-blur-lg rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Top Performers
                </h2>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                  {/* Second Place */}
                  {topPerformers[1] && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="relative order-2 md:order-1"
                    >
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-400 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                        <span className="font-bold">2</span>
                      </div>
                      <div className="bg-[rgb(var(--card))] rounded-xl p-4 w-64 flex flex-col items-center text-center shadow-md border-2 border-gray-400">
                        <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-gray-400">
                          <img src={topPerformers[1].avatar} alt={topPerformers[1].name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">{topPerformers[1].name}</h3>
                        <p className="text-[rgb(var(--muted))] text-sm mb-2">{topPerformers[1].points} points</p>
                        <div className="flex items-center justify-center gap-2 text-xs text-[rgb(var(--muted))]">
                          <span>{topPerformers[1].interviews} interviews</span>
                          <span>•</span>
                          <span>{topPerformers[1].averageScore} avg</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* First Place */}
                  {topPerformers[0] && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05 }}
                      className="relative order-1 md:order-2 z-10 -mt-4 md:mt-0"
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <Crown className="w-12 h-12 text-yellow-400 drop-shadow-lg" />
                      </div>
                      <div className="bg-gradient-to-b from-yellow-500/20 to-[rgb(var(--card))] rounded-xl p-6 w-72 flex flex-col items-center text-center shadow-lg border-2 border-yellow-400">
                        <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-yellow-400 shadow-md">
                          <img src={topPerformers[0].avatar} alt={topPerformers[0].name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-bold text-xl mb-1">{topPerformers[0].name}</h3>
                        <p className="text-[rgb(var(--accent))] font-semibold mb-2">{topPerformers[0].points} points</p>
                        <div className="flex items-center justify-center gap-2 text-sm text-[rgb(var(--muted))]">
                          <span>{topPerformers[0].interviews} interviews</span>
                          <span>•</span>
                          <span>{topPerformers[0].averageScore} avg</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Third Place */}
                  {topPerformers[2] && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.05 }}
                      className="relative order-3"
                    >
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-700 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                        <span className="font-bold">3</span>
                      </div>
                      <div className="bg-[rgb(var(--card))] rounded-xl p-4 w-64 flex flex-col items-center text-center shadow-md border-2 border-amber-700">
                        <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-amber-700">
                          <img src={topPerformers[2].avatar} alt={topPerformers[2].name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">{topPerformers[2].name}</h3>
                        <p className="text-[rgb(var(--muted))] text-sm mb-2">{topPerformers[2].points} points</p>
                        <div className="flex items-center justify-center gap-2 text-xs text-[rgb(var(--muted))]">
                          <span>{topPerformers[2].interviews} interviews</span>
                          <span>•</span>
                          <span>{topPerformers[2].averageScore} avg</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Search and List */}
              <div id="leaderboard" className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted))] w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--card-hover))] rounded-lg border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="flex items-center gap-2 px-3 py-2 bg-[rgb(var(--card-hover))] rounded-lg hover:bg-[rgb(var(--border))] transition-colors"
                    >
                      <Filter className="w-4 h-4" />
                      <span>Filters</span>
                      {isFilterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    <div className="relative group">
                      <button className="p-2 rounded-full bg-[rgb(var(--card-hover))] hover:bg-[rgb(var(--border))] transition-colors">
                        <Info className="w-4 h-4 text-[rgb(var(--muted))]" />
                      </button>
                      <div className="absolute z-10 right-0 mt-2 w-64 p-3 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <p className="text-xs text-[rgb(var(--muted))]">
                          <strong>Points:</strong> Earned by completing interviews and achieving high scores.
                          <br /><br />
                          <strong>Rank:</strong> Your position on the global leaderboard.
                          <br /><br />
                          <strong>Click on a user</strong> to see more details.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-6 overflow-hidden"
                    >
                      <div className="p-4 bg-[rgb(var(--card-hover))] rounded-lg">
                        <h3 className="font-medium mb-3">Sort By</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <button
                            onClick={() => handleSort('rank')}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                              sortBy === 'rank' ? 'bg-[rgb(var(--accent))] text-white' : 'bg-[rgb(var(--card))] hover:bg-[rgb(var(--border))]'
                            }`}
                          >
                            <Trophy className="w-4 h-4" />
                            <span>Rank</span>
                            {getSortIcon('rank')}
                          </button>
                          
                          <button
                            onClick={() => handleSort('points')}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                              sortBy === 'points' ? 'bg-[rgb(var(--accent))] text-white' : 'bg-[rgb(var(--card))] hover:bg-[rgb(var(--border))]'
                            }`}
                          >
                            <Star className="w-4 h-4" />
                            <span>Points</span>
                            {getSortIcon('points')}
                          </button>
                          
                          <button
                            onClick={() => handleSort('interviews')}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                              sortBy === 'interviews' ? 'bg-[rgb(var(--accent))] text-white' : 'bg-[rgb(var(--card))] hover:bg-[rgb(var(--border))]'
                            }`}
                          >
                            <Users className="w-4 h-4" />
                            <span>Interviews</span>
                            {getSortIcon('interviews')}
                          </button>
                          
                          <button
                            onClick={() => handleSort('averageScore')}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                              sortBy === 'averageScore' ? 'bg-[rgb(var(--accent))] text-white' : 'bg-[rgb(var(--card))] hover:bg-[rgb(var(--border))]'
                            }`}
                          >
                            <ArrowUpDown className="w-4 h-4" />
                            <span>Avg Score</span>
                            {getSortIcon('averageScore')}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Table Header */}
                <div id="leaderboard-table" className="hidden md:flex items-center justify-between p-4 bg-[rgb(var(--card-hover))] rounded-t-lg border-b border-[rgb(var(--border))]">
                  <div className="w-16 text-center font-medium">Rank</div>
                  <div className="flex-1 font-medium">User</div>
                  <div className="w-24 text-center font-medium">Points</div>
                  <div className="w-24 text-center font-medium">Interviews</div>
                  <div className="w-24 text-center font-medium">Avg Score</div>
                </div>

                {/* User List */}
                <div className="space-y-2 md:space-y-2 md:rounded-t-none rounded-lg overflow-hidden">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, i) => (
                      <motion.div
                        key={user.name + user.rank}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setHighlightedUser(highlightedUser === user.name ? null : user.name)}
                        className={`flex flex-col md:flex-row md:items-center justify-between p-4 cursor-pointer transition-colors ${
                          highlightedUser === user.name 
                            ? 'bg-[rgb(var(--accent))]/10 border-l-4 border-[rgb(var(--accent))]' 
                            : user.rank <= 3 
                              ? 'bg-gradient-to-r from-[rgb(var(--card-hover))]/50 to-[rgb(var(--card-hover))] border-l-4 border-yellow-400'
                              : 'bg-[rgb(var(--card-hover))] hover:bg-[rgb(var(--border))]'
                        } ${i === 0 ? 'md:rounded-t-none' : ''} ${i === currentUsers.length - 1 ? 'rounded-b-lg' : ''}`}
                      >
                        {/* Mobile View */}
                        <div className="md:hidden flex items-center justify-between w-full mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[rgb(var(--card))]">
                              <span className="text-sm font-bold">{user.rank}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full overflow-hidden border border-[rgb(var(--border))]">
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </div>
                          <div className="font-bold">{user.points} pts</div>
                        </div>
                        
                        <div className="md:hidden grid grid-cols-2 gap-2 text-sm text-[rgb(var(--muted))]">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{user.interviews} interviews</span>
                          </div>
                          <div className="flex items-center gap-1 justify-end">
                            <ArrowUpDown className="w-3 h-3" />
                            <span>{user.averageScore} avg score</span>
                          </div>
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:flex md:w-16 md:justify-center">
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[rgb(var(--card))]">
                            <span className="text-sm font-bold">{user.rank}</span>
                          </div>
                        </div>
                        
                        <div className="hidden md:flex md:flex-1 md:items-center md:gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-[rgb(var(--border))]">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                        
                        <div className="hidden md:flex md:w-24 md:justify-center font-bold">
                          {user.points}
                        </div>
                        
                        <div className="hidden md:flex md:w-24 md:justify-center text-[rgb(var(--muted))]">
                          {user.interviews}
                        </div>
                        
                        <div className="hidden md:flex md:w-24 md:justify-center text-[rgb(var(--muted))]">
                          {user.averageScore}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-[rgb(var(--muted))]">
                      No users found matching your search criteria
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-[rgb(var(--card-hover))] hover:bg-[rgb(var(--border))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={i}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`w-10 h-10 rounded-lg ${
                              currentPage === pageNumber
                                ? 'bg-[rgb(var(--accent))] text-white'
                                : 'bg-[rgb(var(--card-hover))] hover:bg-[rgb(var(--border))]'
                            } transition-colors`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-[rgb(var(--card-hover))] hover:bg-[rgb(var(--border))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                <div className="mt-4 text-center text-sm text-[rgb(var(--muted))]">
                  Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, sortedUsers.length)} of {sortedUsers.length} users
                </div>
              </div>

              {/* Your Rank Card */}
              {currentUserData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6 shadow-sm"
                >
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-[rgb(var(--accent))]" />
                    Your Position
                  </h2>
                  
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 bg-[rgb(var(--card-hover))] rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[rgb(var(--accent))]">
                        <img 
                          src={currentUserData.avatar} 
                          alt="Your Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{currentUserData.name}</h3>
                        <p className="text-[rgb(var(--muted))]">Rank #{currentUserData.rank}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-2xl font-bold text-[rgb(var(--accent))]">{currentUserData.points}</p>
                        <p className="text-sm text-[rgb(var(--muted))]">Points</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{currentUserData.interviews}</p>
                        <p className="text-sm text-[rgb(var(--muted))]">Interviews</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{currentUserData.averageScore}</p>
                        <p className="text-sm text-[rgb(var(--muted))]">Avg Score</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}