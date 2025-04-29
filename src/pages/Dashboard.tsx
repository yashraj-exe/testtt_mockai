import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Users, ArrowRight, Clock, Calendar, CheckCircle, Timer, Filter, Info, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Function to format date as DD/MM/YYYY
const formatDate = (dateString: string) => {
  const [date, time] = dateString.split(' ');
  const [day, month, year] = date.split('-');
  return `${day}/${month}`;
};

// Function to format time as h:mm AM/PM
const formatTime = (timeString: string) => {
  return timeString;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, getDashboardData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [selectedInterviewType, setSelectedInterviewType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'dateTime' | 'date'>('dateTime');
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchDashboardData = useCallback(async () => {
    if (hasFetchedData) return;

    try {
      const result = await getDashboardData();
      if (result.success && result.data) {
        setDashboardData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
      setHasFetchedData(true);
    }
  }, [getDashboardData, hasFetchedData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Filter chart data based on selected interview type
  const filteredData = selectedInterviewType === 'all' 
    ? dashboardData?.user?.progress || []
    : (dashboardData?.user?.progress || []).filter((item: any) => item.type === selectedInterviewType);

  // Process data based on view mode
  const processedData = React.useMemo(() => {
    if (!filteredData.length) return [];

    if (viewMode === 'dateTime') {
      return [...filteredData].sort((a, b) => {
        const dateA = new Date(a.dateAndTime.replace(/(\d{2})-(\d{2})-(\d{2}) (\d{2}:\d{2} [AP]M)/, '20$3-$2-$1 $4')).getTime();
        const dateB = new Date(b.dateAndTime.replace(/(\d{2})-(\d{2})-(\d{2}) (\d{2}:\d{2} [AP]M)/, '20$3-$2-$1 $4')).getTime();
        return dateA - dateB;
      });
    } else {
      // Group by date and combine points for the same type
      const groupedByDate = filteredData.reduce((acc: any, item: any) => {
        const date = item.dateAndTime.split(' ')[0];
        
        if (!acc[date]) {
          acc[date] = {};
        }
        
        if (!acc[date][item.type]) {
          acc[date][item.type] = {
            points: 0,
            count: 0,
            interviews: []
          };
        }
        
        acc[date][item.type].points += item.points;
        acc[date][item.type].count += 1;
        acc[date][item.type].interviews.push({
          time: item.dateAndTime.split(' ')[1],
          role: item.role,
          company: item.company,
          points: item.points
        });
        
        return acc;
      }, {});
      
      // Convert grouped data to array format
      const result = Object.entries(groupedByDate).flatMap(([date, types]: [string, any]) =>
        Object.entries(types).map(([type, data]: [string, any]) => ({
          date,
          type,
          points: data.points,
          count: data.count,
          interviews: data.interviews
        }))
      );
      
      // Sort by date
      return result.sort((a, b) => {
        const dateA = new Date(a.date.split('-').reverse().join('-')).getTime();
        const dateB = new Date(b.date.split('-').reverse().join('-')).getTime();
        return dateA - dateB;
      });
    }
  }, [filteredData, viewMode]);

  // Reset selected point when data changes
  useEffect(() => {
    setSelectedPoint(null);
  }, [viewMode, selectedInterviewType]);

  // Get all unique interview types
  const interviewTypes = Array.from(
    new Set((dashboardData?.user?.progress || []).map((item: any) => item.type))
  );

  // Prepare data for Chart.js
  const labels = processedData.map((item: any) => {
    if (viewMode === 'dateTime') {
      return `${formatDate(item.dateAndTime.split(' ')[0])} ${item.dateAndTime.split(' ')[1]}`;
    } else {
      return formatDate(item.date);
    }
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Interview Points',
        data: processedData.map((item: any) => item.points),
        borderColor: 'rgb(124, 58, 237)',
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        pointBackgroundColor: '#1f2937',
        pointBorderColor: 'rgb(124, 58, 237)',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.3,
        fill: true
      }
    ]
  };

  const handleChartClick = (event: any, elements: any) => {
    if (elements && elements.length > 0) {
      setSelectedPoint(elements[0].index);
    } else {
      setSelectedPoint(null);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: viewMode === 'date' ? 400 : 100,
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
        ticks: {
          color: 'rgba(156, 163, 175, 1)',
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(156, 163, 175, 1)',
          font: {
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        titleColor: 'rgba(243, 244, 246, 1)',
        bodyColor: 'rgba(243, 244, 246, 1)',
        borderColor: 'rgba(75, 85, 99, 0.3)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            const item = processedData[index];
            
            if (viewMode === 'dateTime') {
              return item.dateAndTime;
            } else {
              return formatDate(item.date);
            }
          },
          label: (context: any) => {
            const index = context.dataIndex;
            const item = processedData[index];
            
            if (viewMode === 'dateTime') {
              return [
                `Role: ${item.role}`,
                `Company: ${item.company}`,
                `Type: ${item.type}`,
                `Points: ${context.parsed.y}`
              ];
            } else {
              const lines = [
                `Type: ${item.type}`,
                `Total Points: ${item.points}`,
                `Interviews: ${item.count}`,
                `-------------------`
              ];
              
              item.interviews.forEach((interview: any, i: number) => {
                lines.push(`Interview ${i+1}:`);
                lines.push(`  Time: ${interview.time}`);
                lines.push(`  Role: ${interview.role}`);
                lines.push(`  Company: ${interview.company}`);
                lines.push(`  Points: ${interview.points}`);
                if (i < item.interviews.length - 1) {
                  lines.push(`-------------------`);
                }
              });
              
              return lines;
            }
          }
        }
      }
    },
    onClick: handleChartClick
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
          <p className="text-[rgb(var(--muted))]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        {/* Header */}
        {/* Update the header section in Dashboard.tsx */}
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[rgb(var(--card))] p-6 rounded-xl shadow-sm">
  <div>
    <h1 className="text-3xl font-bold">Welcome back, {dashboardData?.user?.name}</h1>
    <p className="text-[rgb(var(--muted))]">Track your interview progress and performance</p>
  </div>
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-hover))] px-6 py-3 rounded-lg text-white flex flex-col items-center justify-center shadow-lg"
  >
    <span className="text-2xl font-bold">{dashboardData?.user?.credits || 1}</span>
    <span className="text-sm text-white/90">Available Credits</span>
  </motion.div>
</div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <Calendar className="w-8 h-8 text-[rgb(var(--accent))]" />
              <div>
                <p className="text-sm text-[rgb(var(--muted))]">Total Interviews</p>
                <p className="text-2xl font-bold">{dashboardData?.user?.totalInterviews}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <Timer className="w-8 h-8 text-[rgb(var(--accent))]" />
              <div>
                <p className="text-sm text-[rgb(var(--muted))]">Total Time</p>
                <p className="text-2xl font-bold">{dashboardData?.user?.totalTime}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-[rgb(var(--accent))]" />
              <div>
                <p className="text-sm text-[rgb(var(--muted))]">Completed</p>
                <p className="text-2xl font-bold">{dashboardData?.user?.completed}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-[rgb(var(--accent))]" />
              <div>
                <p className="text-sm text-[rgb(var(--muted))]">Pending</p>
                <p className="text-2xl font-bold">{dashboardData?.user?.pending}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <Trophy className="w-8 h-8 text-[rgb(var(--accent))]" />
              <div>
                <p className="text-sm text-[rgb(var(--muted))]">Total Points</p>
                <p className="text-2xl font-bold">{dashboardData?.user?.totalPoints}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-[rgb(var(--accent))]" />
              <div>
                <p className="text-sm text-[rgb(var(--muted))]">Global Rank</p>
                <p className="text-2xl font-bold">{dashboardData?.user?.globalRank}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Progress Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold">Performance Progress</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[rgb(var(--muted))]" />
                <select
                  value={selectedInterviewType}
                  onChange={(e) => setSelectedInterviewType(e.target.value)}
                  className="bg-[rgb(var(--card-hover))] border border-[rgb(var(--border))] rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                >
                  <option value="all">All Types</option>
                  {interviewTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[rgb(var(--muted))]" />
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'dateTime' | 'date')}
                  className="bg-[rgb(var(--card-hover))] border border-[rgb(var(--border))] rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                >
                  <option value="dateTime">By Date & Time</option>
                  <option value="date">By Date</option>
                </select>
              </div>
              
              <div className="relative group">
                <button className="p-1 rounded-full bg-[rgb(var(--card-hover))] hover:bg-[rgb(var(--border))] transition-colors">
                  <Info className="w-4 h-4 text-[rgb(var(--muted))]" />
                </button>
                <div className="absolute z-10 right-0 mt-2 w-64 p-3 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <p className="text-xs text-[rgb(var(--muted))]">
                    <strong>By Date & Time:</strong> Shows individual interview points.
                    <br /><br />
                    <strong>By Date:</strong> Combines points for interviews of the same type on the same date.
                    <br /><br />
                    <strong>Click on a data point</strong> to see detailed information.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full">
            {processedData.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-[rgb(var(--muted))]">No data available for the selected filter</p>
              </div>
            )}
          </div>
          
          {/* Data point details - only shown when a point is clicked */}
          <AnimatePresence>
            {selectedPoint !== null && processedData[selectedPoint] && (
              <motion.div 
                key="data-details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 p-4 bg-[rgb(var(--card-hover))] rounded-lg border border-[rgb(var(--border))]"
              >
                {viewMode === 'dateTime' ? (
                  <div>
                    <h3 className="font-medium mb-2">Interview Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-[rgb(var(--muted))]">Date & Time</p>
                        <p className="font-medium">{processedData[selectedPoint].dateAndTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[rgb(var(--muted))]">Role</p>
                        <p className="font-medium">{processedData[selectedPoint].role}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[rgb(var(--muted))]">Company</p>
                        <p className="font-medium">{processedData[selectedPoint].company}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-[rgb(var(--muted))]">Interview Type</p>
                        <p className="font-medium">{processedData[selectedPoint].type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[rgb(var(--muted))]">Points Earned</p>
                        <p className="font-medium">{processedData[selectedPoint].points}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-medium mb-2">Date Summary: {formatDate(processedData[selectedPoint].date)}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-[rgb(var(--muted))]">Interview Type</p>
                        <p className="font-medium">{processedData[selectedPoint].type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[rgb(var(--muted))]">Total Points</p>
                        <p className="font-medium">{processedData[selectedPoint].points}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[rgb(var(--muted))]">Number of Interviews</p>
                        <p className="font-medium">{processedData[selectedPoint].count}</p>
                      </div>
                    </div>
                    
                    {processedData[selectedPoint].interviews && processedData[selectedPoint].interviews.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Individual Interviews</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {processedData[selectedPoint].interviews.map((interview: any, idx: number) => (
                            <div key={idx} className="p-3 bg-[rgb(var(--card))] rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{interview.time}</p>
                                  <p className="text-sm text-[rgb(var(--muted))]">{interview.role}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{interview.points} pts</p>
                                  <p className="text-sm text-[rgb(var(--muted))]">{interview.company}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-end mt-4">
                  <button 
                    onClick={() => setSelectedPoint(null)}
                    className="px-3 py-1 text-sm bg-[rgb(var(--card))] hover:bg-[rgb(var(--border))] rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-4 text-center text-sm text-[rgb(var(--muted))]">
            Points progression over time
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}