import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  Globe, 
  Briefcase, 
  UserCircle, 
  Clock, 
  FileText, 
  Upload, 
  Plus, 
  Menu, 
  X, 
  LogOut, 
  MessageSquare, 
  Star, 
  CheckCircle, 
  Trophy, 
  FileSearch, 
  Code, 
  Cpu, 
  Brain, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type InterviewType = 'Technical' | 'Technical + Code' | 'Behavioral';

interface InterviewTypeOption {
  value: InterviewType;
  label: string;
  description: string;
}

const interviewTypes: InterviewTypeOption[] = [
  {
    value: 'Technical',
    label: 'Technical Interview',
    description: 'In-depth technical discussion and system design questions'
  },
  {
    value: 'Technical + Code',
    label: 'Technical + Coding',
    description: 'Comprehensive technical interview with live coding challenges'
  },
  {
    value: 'Behavioral',
    label: 'Behavioral Interview',
    description: 'Focus on soft skills, past experiences, and situational questions'
  }
];

export default function CreateInterview() {
  const navigate = useNavigate();
  const { user, createInterview, uploadResume } = useAuth();
  const [formData, setFormData] = useState({
    jobTitle: '',
    experienceLevel: '',
    jobDescription: '',
    selectedResume: '',
    language: 'english',
    interviewType: '' as InterviewType,
    company: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.interviewType) {
      newErrors.interviewType = 'Please select an interview type';
    }
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Please enter a job title';
    } else if (!/^[A-Za-z\s]+$/.test(formData.jobTitle)) {
      newErrors.jobTitle = 'Job title should only contain letters';
    }
    if (!formData.experienceLevel) {
      newErrors.experienceLevel = 'Please select an experience level';
    }
    if (!formData.selectedResume && user?.resumes && user.resumes.length > 0) {
      newErrors.selectedResume = 'Please select a resume';
    }
    if (!formData.company.trim()) {
      newErrors.company = 'Please enter a company name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      formData.interviewType !== '' &&
      formData.jobTitle.trim() !== '' &&
      formData.experienceLevel !== '' &&
      formData.company.trim() !== '' &&
      (formData.selectedResume !== '' || !user?.resumes?.length)
    );
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResume(true);
    setError(null);
    setUploadSuccess(null);

    try {
      const result = await uploadResume(file);
      if (result.success) {
        setUploadSuccess(result.message);
        // Auto-select the newly uploaded resume
        if (user?.resumes && user.resumes.length > 0) {
          setFormData(prev => ({
            ...prev,
            selectedResume: user.resumes[0].id
          }));
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to upload resume');
    } finally {
      setIsUploadingResume(false);
      // Clear the input
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 800);

    try {
      const result = await createInterview({
        role: formData.jobTitle,
        experience: formData.experienceLevel,
        jobDescription: formData.jobDescription,
        company: formData.company,
        resumeId: formData.selectedResume,
        interviewType: formData.interviewType
      });

      setLoadingProgress(100);
      
      if (result.success) {
        // Small delay to show 100% completion before navigating
        setTimeout(() => {
          navigate('/interviews');
        }, 800);
      } else {
        setError(result.message);
        setIsGenerating(false);
      }
    } catch (err) {
      setError('Failed to create interview. Please try again.');
      setIsGenerating(false);
    } finally {
      clearInterval(progressInterval);
    }
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        setUploadSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  const selectedTypeDescription = interviewTypes.find(type => type.value === formData.interviewType)?.description;

  if (isGenerating) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="animated-background">
          <div className="floating-ball" style={{ left: '10%', top: '20%', opacity: 0.15 }} />
          <div className="floating-ball" style={{ right: '10%', top: '60%', opacity: 0.15 }} />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[rgb(var(--card))] rounded-xl p-8 max-w-md w-full shadow-sm text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <motion.div 
              className="absolute inset-0 rounded-full border-4 border-[rgb(var(--accent))] border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-10 h-10 text-[rgb(var(--accent))]" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-3">Creating Your Interview</h2>
          <p className="text-[rgb(var(--muted))] mb-6">
            We're preparing your personalized interview for {formData.jobTitle} at {formData.company}
          </p>
          
          <div className="w-full space-y-2">
            <div className="h-3 bg-[rgb(var(--card-hover))] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-[rgb(var(--accent))]"
                initial={{ width: "0%" }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.5 }}
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'gradientMove 3s linear infinite'
                }}
              />
            </div>
            <div className="flex justify-between text-sm text-[rgb(var(--muted))]">
              <span>{formData.interviewType} Interview</span>
              <span>{Math.round(loadingProgress)}%</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="bg-[rgb(var(--accent))]/20 hover:bg-[rgb(var(--accent))]/30 text-[rgb(var(--accent))] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>
          <h1 className="text-3xl font-bold">Create New Interview</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {uploadSuccess && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200">
            {uploadSuccess}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Interview Type <span className="text-red-400">*</span>
                    </span>
                  </label>
                  <select
                    value={formData.interviewType}
                    onChange={(e) => {
                      setFormData({ ...formData, interviewType: e.target.value as InterviewType });
                      if (errors.interviewType) {
                        setErrors({ ...errors, interviewType: '' });
                      }
                    }}
                    className={`w-full px-4 py-2 rounded-lg bg-[rgb(var(--card-hover))] border ${
                      errors.interviewType ? 'border-red-500' : 'border-[rgb(var(--border))]'
                    } focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors`}
                    required
                  >
                    <option value="">Select interview type</option>
                    {interviewTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.interviewType && (
                    <p className="mt-1 text-sm text-red-500">{errors.interviewType}</p>
                  )}
                  {selectedTypeDescription && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-[rgb(var(--muted))] pl-4 border-l-2 border-[rgb(var(--accent))]"
                    >
                      {selectedTypeDescription}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Job Title <span className="text-red-400">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => {
                      setFormData({ ...formData, jobTitle: e.target.value });
                      if (errors.jobTitle) {
                        setErrors({ ...errors, jobTitle: '' });
                      }
                    }}
                    placeholder="e.g. Senior Frontend Developer"
                    className={`w-full px-4 py-2 rounded-lg bg-[rgb(var(--card-hover))] border ${
                      errors.jobTitle ? 'border-red-500' : 'border-[rgb(var(--border))]'
                    } focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors`}
                    required
                  />
                  {errors.jobTitle && (
                    <p className="mt-1 text-sm text-red-500">{errors.jobTitle}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Company Name <span className="text-red-400">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => {
                      setFormData({ ...formData, company: e.target.value });
                      if (errors.company) {
                        setErrors({ ...errors, company: '' });
                      }
                    }}
                    placeholder="e.g. Google"
                    className={`w-full px-4 py-2 rounded-lg bg-[rgb(var(--card-hover))] border ${
                      errors.company ? 'border-red-500' : 'border-[rgb(var(--border))]'
                    } focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors`}
                    required
                  />
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-500">{errors.company}</p>
                  )}
                </div>

                {/* <div>
                  <label className="block text-sm font-medium mb-2">
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Interview Language
                    </span>
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-[rgb(var(--card-hover))] border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors"
                    required
                  >
                    <option value="english">English</option>
                  </select>
                </div> */}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <span className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4" />
                      Experience Level <span className="text-red-400">*</span>
                    </span>
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => {
                      setFormData({ ...formData, experienceLevel: e.target.value });
                      if (errors.experienceLevel) {
                        setErrors({ ...errors, experienceLevel: '' });
                      }
                    }}
                    className={`w-full px-4 py-2 rounded-lg bg-[rgb(var(--card-hover))] border ${
                      errors.experienceLevel ? 'border-red-500' : 'border-[rgb(var(--border))]'
                    } focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors`}
                    required
                  >
                    <option value="">Select level</option>
                    <option value="0-1">Entry-Level (0-1 years)</option>
                    <option value="1-2">Early-Career (1-2 years)</option>
                    <option value="3+">Senior (3+ years)</option>
                  </select>
                  {errors.experienceLevel && (
                    <p className="mt-1 text-sm text-red-500">{errors.experienceLevel}</p>
                  )}
                </div>

                {/* Resume Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Resume <span className="text-red-400">*</span>
                    </span>
                  </label>

                  {/* Show resume selection if user has resumes */}
                  {user?.resumes && user.resumes.length > 0 ? (
                    <div>
                      <select
                        value={formData.selectedResume}
                        onChange={(e) => {
                          setFormData({ ...formData, selectedResume: e.target.value });
                          if (errors.selectedResume) {
                            setErrors({ ...errors, selectedResume: '' });
                          }
                        }}
                        className={`w-full px-4 py-2 rounded-lg bg-[rgb(var(--card-hover))] border ${
                          errors.selectedResume ? 'border-red-500' : 'border-[rgb(var(--border))]'
                        } focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors`}
                        required
                      >
                        <option value="">Select a resume</option>
                        {user.resumes.map((resume) => (
                          <option key={resume.id} value={resume.id}>
                            {resume.name}
                          </option>
                        ))}
                      </select>
                      {errors.selectedResume && (
                        <p className="mt-1 text-sm text-red-500">{errors.selectedResume}</p>
                      )}
                    </div>
                  ) : (
                    /* Show only upload option if user has no resumes */
                    <label className="block">
                      <div className="border-2 border-dashed border-[rgb(var(--border))] rounded-lg p-6 text-center cursor-pointer hover:border-[rgb(var(--accent))] transition-colors">
                        {isUploadingResume ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-[rgb(var(--muted))]">Uploading resume...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mx-auto mb-2 text-[rgb(var(--muted))]" />
                            <p className="text-sm text-[rgb(var(--muted))]">
                              Upload your resume to continue
                              <br />
                              <span className="text-xs">(PDF format only)</span>
                            </p>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf"
                              onChange={handleResumeUpload}
                              disabled={isUploadingResume}
                            />
                          </>
                        )}
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Job Description
                  </span>
                </label>
                <textarea
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  placeholder="Paste the job description here..."
                  className="w-full px-4 py-2 rounded-lg bg-[rgb(var(--card-hover))] border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors h-[95%] min-h-[300px]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid()}
            className={`w-full py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition duration-200 shadow-sm ${
              isFormValid()
                ? 'bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white'
                : 'bg-[rgb(var(--card-hover))] text-[rgb(var(--muted))] cursor-not-allowed'
            }`}
          >
            Create Interview <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}