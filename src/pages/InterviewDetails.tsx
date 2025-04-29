import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MessageSquare, 
  Star, 
  Target, 
  Users, 
  RefreshCw,
  Mic, 
  Brain, 
  ChevronDown, 
  ChevronUp,
  Briefcase,
  GraduationCap,
  Clock,
  FileText,
  Trash2,
  AlertCircle,
  Loader,
  Check,
  Code,
  X,
  Send,
  CheckCircle,
  Shield,
  Lightbulb,
  Volume2,
  MessageSquare as MessageSquareIcon,
  Maximize2,
  FileSearch
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  interviewPosition: string;
}

function DeleteModal({ isOpen, onClose, onConfirm, interviewPosition }: DeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[rgb(var(--card))] rounded-xl p-6 max-w-md w-full shadow-lg"
          >
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-xl font-semibold">Delete Interview</h3>
            </div>
            
            <p className="text-[rgb(var(--text))] mb-6">
              Are you sure you want to delete the interview for <span className="font-semibold">{interviewPosition}</span>? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg hover:bg-[rgb(var(--card-hover))] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function InterviewDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { deleteInterview, getInterviewDetails } = useAuth();
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [showJobDescription, setShowJobDescription] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interviewDetails, setInterviewDetails] = useState<any>(null);
  const [isFeedbackGenerating, setIsFeedbackGenerating] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const fetchInterviewDetails = async () =>{
    if (!id) return;

    try {
      const result = await getInterviewDetails(id);
      
      if (!isMountedRef.current) return;
      
      if (result.success && result.data) {
        setInterviewDetails(result.data);
        setIsFeedbackGenerating(false);
        
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        
        setIsLoading(false);
      } else if (result.statusCode === 204) {
        setIsFeedbackGenerating(true);
        setPollingCount(prev => prev + 1);
        
        setIsLoading(true);
      } else {
        setError(result.message);
        setIsLoading(false);
        
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      
      setError('Failed to fetch interview details');
      setIsLoading(false);
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    fetchInterviewDetails();
    
    if (!pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(fetchInterviewDetails, 10000);
    }
    
    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [id]);

  useEffect(() => {
    if (pollingCount > 24) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setIsFeedbackGenerating(false);
      setIsLoading(false);
      setError('Feedback generation is taking longer than expected. Please check back later.');
    }
  }, [pollingCount]);

  const handleDelete = async () => {
    if (id) {
      await deleteInterview(id);
      navigate('/interviews');
    }
  };

  const handleBackClick = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    navigate('/interviews');
  };

  const MetricBar = ({ value, label }: { value: number; label: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-[rgb(var(--muted))]">{label}</span>
        <span className="font-medium">{value}/10</span>
      </div>
      <div className="h-2 bg-[rgb(var(--card-hover))] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value * 10}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${
            value >= 9 ? 'bg-green-500' :
            value >= 7 ? 'bg-blue-500' :
            value >= 5 ? 'bg-yellow-500' :
            'bg-red-500'
          }`}
        />
      </div>
    </div>
  );

  if (isLoading && !isFeedbackGenerating) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-[rgb(var(--accent))]" />
          <p className="text-[rgb(var(--muted))]">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (isFeedbackGenerating) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[rgb(var(--card))] rounded-xl p-8 max-w-md w-full shadow-sm text-center"
        >
          <div className="relative w-16 h-16 mx-auto mb-6">
            <motion.div 
              className="absolute inset-0 rounded-full border-4 border-[rgb(var(--accent))] border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-8 h-8 text-[rgb(var(--accent))]" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-3">Generating Feedback</h2>
          <p className="text-[rgb(var(--muted))] mb-6">
            Our AI is analyzing your interview responses and preparing detailed feedback. This may take a moment.
          </p>
          
          <div className="w-full space-y-2">
            
            
            <div className="flex justify-between items-center text-sm text-[rgb(var(--muted))]">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Processing...</span>
              </div>
              <button
                onClick={handleBackClick}
                className="text-[rgb(var(--accent))] hover:underline"
              >
                Back to Interviews
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackClick}
              className="bg-[rgb(var(--accent))]/20 hover:bg-[rgb(var(--accent))]/30 text-[rgb(var(--accent))] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>
          </div>
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!interviewDetails) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackClick}
              className="bg-[rgb(var(--accent))]/20 hover:bg-[rgb(var(--accent))]/30 text-[rgb(var(--accent))] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>
          </div>
          <div className="bg-[rgb(var(--card))] rounded-lg p-4 text-center">
            <p className="text-[rgb(var(--muted))]">No interview details found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        interviewPosition={interviewDetails.role}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackClick}
            className="bg-[rgb(var(--accent))]/20 hover:bg-[rgb(var(--accent))]/30 text-[rgb(var(--accent))] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold">{interviewDetails.role}</h1>
            <p className="text-[rgb(var(--muted))]">
              {interviewDetails.company} • {interviewDetails.experience} years experience
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6 shadow-sm space-y-4 md:col-span-2"
          >
            <h2 className="text-xl font-semibold mb-4">Interview Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-[rgb(var(--accent))]" />
                <div>
                  <p className="text-sm text-[rgb(var(--muted))]">Position</p>
                  <p className="font-medium">{interviewDetails.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-[rgb(var(--muted))]">Experience Level</p>
                  <p className="font-medium">{interviewDetails.experience} years</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-[rgb(var(--muted))]">Resume Used</p>
                  <p className="font-medium">{interviewDetails.resume}</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setShowJobDescription(!showJobDescription)}
                className="flex items-center justify-between w-full px-4 py-2 bg-[rgb(var(--card-hover))] rounded-lg hover:bg-[rgb(var(--border))] transition-colors"
              >
                <span className="font-medium">Job Description</span>
                {showJobDescription ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              <AnimatePresence>
                {showJobDescription && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 bg-[rgb(var(--card-hover))] rounded-lg">
                      <div className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar whitespace-pre-line">
                        {interviewDetails.jobDescription}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {interviewDetails.sessionStatus === 'completed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6 shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Performance Score</h3>
                  <div className="text-2xl font-bold text-[rgb(var(--accent))]">
                    {interviewDetails.overallInterviewPoints}
                  </div>
                </div>
                
                {interviewDetails.summary && (
                  <div className="pt-4 border-t border-[rgb(var(--border))]">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileSearch className="w-4 h-4" />
                      Interview Summary
                    </h3>
                    <p className="text-[rgb(var(--muted))] text-sm whitespace-pre-line">
                      {interviewDetails.summary}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {interviewDetails.sessionStatus === 'completed' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Interview Questions</h2>
            {interviewDetails.questions.map((q: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl overflow-hidden shadow-sm"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-[rgb(var(--card-hover))] transition-colors"
                  onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Question {index + 1}</h3>
                    {expandedQuestion === index ? (
                      <ChevronUp className="w-5 h-5 text-[rgb(var(--muted))]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[rgb(var(--muted))]" />
                    )}
                  </div>
                  <p className="mt-2 text-[rgb(var(--text))]">{q.question}</p>
                </div>

                <AnimatePresence>
                  {expandedQuestion === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-[rgb(var(--border))]"
                    >
                      <div className="p-6 space-y-6">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-400" />
                            Your Answer
                          </h4>
                          <p className="text-[rgb(var(--text))]">{q.answer}</p>
                        </div>

                        {q.type === 'code' && q.mistakes && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-red-400" />
                              Mistakes
                            </h4>
                            <p className="text-[rgb(var(--text))]">{q.mistakes}</p>
                          </div>
                        )}

                        {q.type === 'code' && q.correct_approach && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-400" />
                              Correct Approach
                            </h4>
                            <p className="text-[rgb(var(--text))]">{q.correct_approach}</p>
                          </div>
                        )}

                        {q.type === 'code' && q.correct_code && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Code className="w-4 h-4 text-yellow-400" />
                              Correct Code
                            </h4>
                            <pre className="bg-[rgb(var(--card-hover))] p-4 rounded-lg overflow-x-auto">
                              <code>{q.correct_code}</code>
                            </pre>
                          </div>
                        )}

                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            Feedback
                          </h4>
                          <p className="text-[rgb(var(--text))]">{q.feedback}</p>
                        </div>

                        {q.judgement && (
                          <div>
                          <h4 className="font-medium mb-3">Metrics</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(q.judgement).map(([key, value]) => (
                              <div
                                key={key}
                                className="flex items-center gap-3"
                              >
                                <div className="me-4">
                                  <Target className="w-5 h-5 text-[rgb(var(--accent))]" />
                                </div>
                                <div className="w-full">
                                  <MetricBar
                                    value={value as number}
                                    label={key}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setDeleteModalOpen(true)}
          className="fixed bottom-6 right-6 bg-red-500/20 hover:bg-red-500/30 text-red-400 p-3 rounded-full flex items-center justify-center gap-2 transition-colors shadow-lg group"
        >
          <Trash2 className="w-5 h-5" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] transition-all duration-300 ease-in-out">
            Delete
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}