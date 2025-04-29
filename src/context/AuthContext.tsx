import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Resume {
  id: string;
  name: string;
  uploadedAt: string;
}

interface Interview {
  id: string;
  title: string;
  dateAndTime: string;
  interviewType: string;
  level: string;
  score: number;
  status: 'pending' | 'completed' | 'canceled' | 'scheduled';
  scheduledTime?: data; 
}

interface TopPerformer {
  rank: string;
  name: string;
  avatarUrl: string;
  points: number;
  completedInterviews: number;
  avgScore: number;
}

interface DashboardData {
  user: {
    name: string;
    avatarUrl: string;
    totalInterviews: number;
    totalTime: string;
    completed: number;
    pending: number;
    totalPoints: number;
    globalRank: string;
    Resumes: Resume[];
    credits : number
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  rank: string;
  resumes: Resume[];
  interviews: Interview[];
  avatarUrl: string;
  totalInterviews: number;
  totalTime: string;
  completedInterviews: number;
  pendingInterviews: number;
  credits: number;
}

interface CreateInterviewData {
  role: string;
  experience: string;
  jobDescription: string;
  company: string;
  resumeId: string;
  interviewType: string;
}

interface InterviewJudgement {
  Correctness: number;
  Relevance: number;
  Detail: number;
  Efficiency: number;
  'Communication & Clarity': number;
  'Problem-solving': number;
}

interface InterviewQuestion {
  question: string;
  answer: string;
  type: 'theory' | 'code';
  feedback: string;
  judgement: InterviewJudgement;
  mistakes?: string;
  correct_approach?: string;
  correct_code?: string;
}

interface PendingInterviewDetails {
  role: string;
  experience: string;
  jobDescription: string;
  company: string;
  resume: string;
  sessionStatus: 'pending';
}

interface CompletedInterviewDetails {
  _id: string;
  role: string;
  experience: string;
  jobDescription: string;
  company: string;
  questions: InterviewQuestion[];
  overallInterviewPoints: number;
  sessionStatus: 'completed';
}

type InterviewDetails = PendingInterviewDetails | CompletedInterviewDetails;

interface LeaderboardUser {
  name: string;
  points: number;
  rank: number;
  avatar: string;
  interviews: number;
  averageScore: number;
}

interface LeaderboardData {
  topPerformers: LeaderboardUser[];
  allUsers: LeaderboardUser[];
}

interface AuthContextType {
  user: User | null;
  isLoggingOut: boolean;
  setIsLoggingOut: (value: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  changeAvatar: (avatarId: string) => Promise<{ success: boolean; message: string }>;
  changeUsername: (newUsername: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  uploadResume: (file: File) => Promise<{ success: boolean; message: string }>;
  deleteResume: (resumeId: string) => Promise<{ success: boolean; message: string }>;
  submitFeedback: (rating: number, comment: string) => Promise<{ success: boolean; message: string }>;
  getInterviews: () => Promise<{ success: boolean; message: string; data?: Interview[] }>;
  getDashboardData: () => Promise<{ success: boolean; message: string; data?: DashboardData }>;
  createInterview: (data: CreateInterviewData) => Promise<{ success: boolean; message: string; data?: Interview }>;
  getInterviewDetails: (id: string) => Promise<{ success: boolean; message: string; statusCode?: number; data?: InterviewDetails }>;
  updateInterviewStatus: (id: string, status: 'completed' | 'canceled') => void;
  deleteInterview: (id: string) => Promise<{ success: boolean; message: string }>;
  getLeaderboard: () => Promise<{ success: boolean; message: string; data?: LeaderboardData }>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: number;
  organisation: string;
  password: string;
  avatarId: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = 'https://a0f5-2401-4900-8823-15fc-35bf-4af4-e76d-7961.ngrok-free.app';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('token');
    if (token) {
      return {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        points: 100,
        rank: '#5',
        resumes: [],
        interviews: [],
        avatarUrl: '',
        totalInterviews: 0,
        totalTime: '0h 0m',
        completedInterviews: 0,
        pendingInterviews: 0,
        credits: 1
      };
    }
    return null;
  });

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const updateInterviewStatus = (id: string, status: 'completed' | 'canceled') => {
    setUser(prevUser => {
      if (!prevUser) return null;

      const updatedInterviews = prevUser.interviews.map(interview => {
        if (interview.id === id && interview.status === 'completed') {
          return interview;
        }
        return interview.id === id ? { ...interview, status } : interview;
      });

      const completedCount = updatedInterviews.filter(interview => interview.status === 'completed').length;
      const pendingCount = updatedInterviews.filter(interview => interview.status === 'pending').length;

      return {
        ...prevUser,
        interviews: updatedInterviews,
        completedInterviews: completedCount,
        pendingInterviews: pendingCount
      };
    });
  };

  const getLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await fetch(`${API_URL}/user/leaderboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const data = await response.json();

      if (data.status === 'SUCCESS' && data.statusCode === 200) {
        return {
          success: true,
          message: data.message,
          data: {
            topPerformers: data.data.topPerformers,
            allUsers: data.data.allUsers
          }
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to fetch leaderboard data'
        };
      }
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          success: false,
          message: 'Unable to connect to the server. Please check your internet connection or try again later.'
        };
      }

      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  };

  const deleteInterview = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await fetch(`${API_URL}/user/delete-interview?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const data = await response.json();

      if (data.status === 'SUCCESS') {
        setUser(prevUser => {
          if (!prevUser) return null;
          
          const updatedInterviews = prevUser.interviews.filter(interview => interview.id !== id);
          const completedCount = updatedInterviews.filter(interview => interview.status === 'completed').length;
          const pendingCount = updatedInterviews.filter(interview => interview.status === 'pending').length;
          
          return {
            ...prevUser,
            interviews: updatedInterviews,
            completedInterviews: completedCount,
            pendingInterviews: pendingCount,
            totalInterviews: updatedInterviews.length
          };
        });

        return {
          success: true,
          message: data.message || 'Interview deleted successfully'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to delete interview'
        };
      }
    } catch (error) {
      console.error('Delete interview error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          success: false,
          message: 'Unable to connect to the server. Please check your internet connection or try again later.'
        };
      }

      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  };

  const getInterviewDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const interview = user?.interviews.find(interview => interview.id === id);
      const interviewType = interview?.status || 'pending';

      const response = await fetch(`${API_URL}/user/interview-details?id=${id}&type=${interviewType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.status === 204) {
        return {
          success: true,
          statusCode: 204,
          message: 'Feedback is being generated'
        };
      }

      const data = await response.json();

      if (data.status === 'SUCCESS' && data.statusCode === 200) {
        return {
          success: true,
          statusCode: 200,
          message: data.message,
          data: data.data
        };
      } else {
        return {
          success: false,
          statusCode: data.statusCode,
          message: data.message || 'Failed to fetch interview details'
        };
      }
    } catch (error) {
      console.error('Get interview details error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          success: false,
          message: 'Unable to connect to the server. Please check your internet connection or try again later.'
        };
      }

      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  };

  const createInterview = async (data: CreateInterviewData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await fetch(`${API_URL}/user/create-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (responseData.status === 'SUCCESS' && responseData.statusCode === 200) {
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            interviews: [...prevUser.interviews, {
              id: responseData.data.id,
              title: responseData.data.title,
              dateAndTime: responseData.data.dateAndTime,
              interviewType: responseData.data.interviewType,
              level: responseData.data.level,
              score: 0,
              status: responseData.data.status as 'pending' | 'completed'
            }]
          };
        });

        return {
          success: true,
          message: responseData.message,
          data: responseData.data
        };
      } else {
        return {
          success: false,
          message: responseData.message || 'Failed to create interview'
        };
      }
    } catch (error) {
      console.error('Create interview error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          success: false,
          message: 'Unable to connect to the server. Please check your internet connection or try again later.'
        };
      }

      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  };

  const getDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await fetch(`${API_URL}/user/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const data = await response.json();

      if (data.status === 'SUCCESS' && data.statusCode === 200) {
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            name: data.data.user.name,
            avatarUrl: data.data.user.avatarUrl,
            totalInterviews: data.data.user.totalInterviews,
            totalTime: data.data.user.totalTime,
            completedInterviews: data.data.user.completed,
            pendingInterviews: data.data.user.pending,
            points: data.data.user.totalPoints,
            rank: data.data.user.globalRank,
            resumes: data.data.user.Resumes,
            credits: data.data.user.credits
          };
        });

        return {
          success: true,
          message: data.message,
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to fetch dashboard data'
        };
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          success: false,
          message: 'Unable to connect to the server. Please check your internet connection or try again later.'
        };
      }

      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch(`${API_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (responseData.status === 'SUCCESS' && responseData.statusCode === 201) {
        return { 
          success: true, 
          message: responseData.message 
        };
      } else {
        return { 
          success: false, 
          message: responseData.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return { 
          success: false, 
          message: 'Unable to connect to the server. Please check your internet connection or try again later.' 
        };
      }

      return { 
        success: false, 
        message: 'An unexpected error occurred. Please try again.' 
      };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        return { 
          success: false, 
          message: 'Please provide both email and password' 
        };
      }

      setIsLoggingOut(false);

      const response = await fetch(`${API_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim(),
          password: password.trim()
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { 
            success: false, 
            message: 'Service not available. Please try again later.' 
          };
        }
        
        try {
          const errorData = await response.json();
          return { 
            success: false, 
            message: errorData.message || 'Login failed. Please try again.' 
          };
        } catch {
          return { 
            success: false, 
            message: `Login failed with status: ${response.status}` 
          };
        }
      }

      const data = await response.json();

      if (data.status === 'SUCCESS' && data.statusCode === 200) {
        localStorage.setItem('token', data.data);

        setUser({
          id: '1',
          name: 'John Doe',
          email,
          points: 100,
          rank: '#5',
          resumes: [],
          interviews: [],
          avatarUrl: '',
          totalInterviews: 0,
          totalTime: '0h 0m',
          completedInterviews: 0,
          pendingInterviews: 0,
          credits: 1
        });

        return { success: true, message: data.message };
      } else {
        return { 
          success: false, 
          message: data.message || 'Invalid credentials' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return { 
          success: false, 
          message: 'Unable to connect to the server. Please check your internet connection or try again later.' 
        };
      }

      return { 
        success: false, 
        message: 'An unexpected error occurred. Please try again.' 
      };
    }
  };

  const getInterviews = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await fetch(`${API_URL}/user/interviews`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      const data = await response.json();
      
      if (data.status === 'SUCCESS' && (data.statusCode === 200 || data.statusCode === 404)) {
        setUser(prevUser =>
          prevUser ? { ...prevUser, interviews: data.data || [] } : null
        );
        
        return {
          success: true,
          message: data.message,
          data: data.data || []
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to fetch interviews'
        };
      }
    } catch (error) {
      console.error('Get interviews error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          success: false,
          message: 'Unable to connect to the server. Please check your internet connection or try again later.'
        };
      }

      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  };

  const changeUsername = async (newUsername: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await fetch(`${API_URL}/user/change-username`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newUsername
        }),
      });

      const data = await response.json();

      if (data.status === 'SUCCESS' && data.statusCode === 200) {
        setUser(prevUser => prevUser ? {
          ...prevUser,
          name: newUsername
        } : null);

        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to update username'
        };
      }
    } catch (error) {
      console.error('Username update error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          success: false,
          message: 'Unable to connect to the server. Please check your internet connection or try again later.'
        };
      }

      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await fetch(`${API_URL}/user/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      const data = await response.json();

      if (data.status === 'SUCCESS' && data.statusCode === 200) {
        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to update password'
        };
      }
    } catch (error) {
      console.error('Password update error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          success: false,
          message: 'Unable to connect to the server. Please check your internet connection or try again later.'
        };
      }

      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  };

  const uploadResume = async (file: File) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(`${API_URL}/user/upload-resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.status === 'SUCCESS' && data.statusCode === 200) {
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            resumes: [{
              id: data.data.id,
              name: data.data.name,
              uploadedAt: data.data.uploadedAt
            }, ...prevUser.resumes]
          };
        });

        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to upload resume'
        };
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          success: false,
          message: 'Unable to connect to the server. Please check your internet connection or try again later.'
        };
      }

      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  };

  const deleteResume = async (resumeId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await fetch(`${API_URL}/user/delete-resume?id=${resumeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.status === 'SUCCESS' && data.statusCode === 200) {
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            resumes: prevUser.resumes.filter(resume => resume.id !== resumeId)
          };
        });

        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to delete resume'
        };
      }
    } catch (error) {
      console.error('Resume deletion error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          success: false,
          message: 'Unable to connect to the server. Please check your internet connection or try again later.'
        };
      }

      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  };

  const changeAvatar = async (avatarId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await fetch(`${API_URL}/user/change-avatar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newAvatarId: avatarId
        }),
      });

      const data = await response.json();

      if (data.status === 'SUCCESS' && data.statusCode === 200) {
        setUser((prevUser) => ({
          ...prevUser!,
          avatarUrl: data.data.avatarUrl
        }));
        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to update avatar'
        };
      }
    } catch (error) {
      console.error('Avatar update error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          success: false,
          message: 'Unable to connect to the server. Please check your internet connection or try again later.'
        };
      }

      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  };

  const submitFeedback = async (rating: number, comment: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await fetch(`${API_URL}/user/submit-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          comment
        }),
      });

      const data = await response.json();

      if (data.status === 'SUCCESS' && data.statusCode === 200) {
        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to submit feedback'
        };
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          success: false,
          message: 'Unable to connect to the server. Please check your internet connection or try again later.'
        };
      }

      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      isLoggingOut,
      setIsLoggingOut,
      login,
      logout,
      register,
      changeAvatar,
      changeUsername,
      changePassword,
      uploadResume,
      deleteResume,
      submitFeedback,
      getInterviews,
      getDashboardData,
      createInterview,
      getInterviewDetails,
      updateInterviewStatus,
      deleteInterview,
      getLeaderboard
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}