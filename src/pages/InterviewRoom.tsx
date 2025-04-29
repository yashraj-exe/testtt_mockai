import React, { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Mic,
  Play,
  AlertCircle,
  Info,
  VideoOff,
  MicOff,
  PhoneOff,
  Code,
  X,
  Send,
  CheckCircle,
  Shield,
  Lightbulb,
  Volume2,
  MessageSquare,
  Maximize2,
  Clock 
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { SidebarContext } from '../App';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { useAuth } from '../context/AuthContext';


const API_URL = 'https://a0f5-2401-4900-8823-15fc-35bf-4af4-e76d-7961.ngrok-free.app';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  interviewPosition: string;
}

const languageOptions = [
  { id: 'cpp', name: 'C++', extension: '.cpp', language: cpp },
  { id: 'java', name: 'Java', extension: '.java', language: java },
  { id: 'python', name: 'Python', extension: '.py', language: python },
  { id: 'javascript', name: 'JavaScript', extension: '.js', language: javascript }
];

const getDefaultCode = (languageId: string) => {
  switch (languageId) {
    case 'cpp':
      return `// Write your code here`;
    case 'java':
      return `// Write your code here`;
    case 'python':
      return `# Write your code here`;
    case 'javascript':
      return `// Write your code here`;
    default:
      return '';
  }
};

interface QuestionData {
  question?: string;
  url: string;
  type: 'theory' | 'code';
  userInputRequired?: boolean;
}

export default function InterviewRoom() {
  const navigate = useNavigate();
  const { setShowSidebar } = useContext(SidebarContext);
  const { updateInterviewStatus } = useAuth();
  const [showInstructions, setShowInstructions] = useState(false);
  const [permissions, setPermissions] = useState({
    camera: false,
    microphone: false,
  });
  const [isStarted, setIsStarted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0]);
  const [code, setCode] = useState(getDefaultCode(languageOptions[0].id));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codingQuestion, setCodingQuestion] = useState<string>('');
  const [questionType, setQuestionType] = useState<string>('theory');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [userInputRequired, setUserInputRequired] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { id } = useParams();
  const [interviewId, setinterviewId] = useState<string | null>(id || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [fullscreenWarningTimer, setFullscreenWarningTimer] = useState<NodeJS.Timeout | null>(null);
  const [isInterviewCanceled, setIsInterviewCanceled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const [timeLeft, setTimeLeft] = useState<number>(100); // 600 seconds = 10 minutes
  const codeRef = useRef<string>('');
  useEffect(() => {
  codeRef.current = code;
}, [code]);


  
  const playAudio = (url: string) => {
  return new Promise<void>((resolve, reject) => {
    // Don't play audio if component is unmounted
    if (!isMountedRef.current) {
      resolve();
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.onended = () => {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setIsAudioPlaying(false);
      }
      resolve();
    };

    audioRef.current.onerror = (e) => {
      console.error('Audio playback error:', e);
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setIsAudioPlaying(false);
      }
      reject(new Error('Failed to play audio'));
    };

    audioRef.current.src = url;
    
    audioRef.current.play()
      .then(() => {
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setIsAudioPlaying(true);
        }
      })
      .catch(error => {
        console.error('Error playing audio:', error);
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setIsAudioPlaying(false);
        }
        reject(error);
      });
  });
};

  const handleInterviewCancellation = async (eventType: 'exit_fullscreen' | 'dev_tools_open' | 'manually_ended') => {
  if (isInterviewCanceled || !interviewId) return;

  try {
    await fetch(`${API_URL}/user/report-activity?id=${interviewId}&eventType=${eventType}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (interviewId) {
      updateInterviewStatus(interviewId, 'canceled');
    }

    setIsInterviewCanceled(true);
      // Stop all media streams
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    // Stop speech recognition
    stopListening();
    
    // Reset UI state
    setShowSidebar(true);
    await exitFullscreen();
    
    // Navigate back to interviews page
    navigate('/interviews');
  } catch (error) {
    console.error('Error reporting activity:', error);
  }
};

  const cleanupAudio = () => {
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current = null;
  }
};
  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement);
    
    if (isStarted && !document.fullscreenElement) {
      setShowFullscreenWarning(true);
      
      if (fullscreenWarningTimer) {
        clearTimeout(fullscreenWarningTimer);
      }
      
      const timer = setTimeout(() => {
        if (!document.fullscreenElement) {
          handleInterviewCancellation('exit_fullscreen');
        }
        setShowFullscreenWarning(false);
      }, 10000);
      
      setFullscreenWarningTimer(timer);
    } else {
      setShowFullscreenWarning(false);
      if (fullscreenWarningTimer) {
        clearTimeout(fullscreenWarningTimer);
        setFullscreenWarningTimer(null);
      }
    }
  };

  const detectDevTools = () => {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (isStarted && (widthThreshold || heightThreshold)) {
      handleInterviewCancellation('dev_tools_open');
    }
  };

  useEffect(() => {
    if (isStarted) {
      window.addEventListener('resize', detectDevTools);
      const interval = setInterval(detectDevTools, 1000);
      
      return () => {
        window.removeEventListener('resize', detectDevTools);
        clearInterval(interval);
      };
    }
  }, [isStarted]);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (fullscreenWarningTimer) {
        clearTimeout(fullscreenWarningTimer);
      }
    };
  }, [isStarted, fullscreenWarningTimer]);

  useEffect(() => {
    return () => {
      if (fullscreenWarningTimer) {
        clearTimeout(fullscreenWarningTimer);
      }
    };
  }, []);

  // Add this helper function with other utility functions
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
  let timer: NodeJS.Timeout;
  
  if (showCodeEditor && questionType === 'code') {
    setTimeLeft(60);
    
    timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Use the ref to get the latest code value
          handleSubmitCode(true, codeRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return () => {
    if (timer) {
      clearInterval(timer);
    }
  };
}, [showCodeEditor, questionType]);



  // Function to enter fullscreen
  const enterFullscreen = async () => {
    try {
      if (containerRef.current) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).mozRequestFullScreen) {
          await (containerRef.current as any).mozRequestFullScreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          await (containerRef.current as any).msRequestFullscreen();
        }
        setShowFullscreenWarning(false);
      }
    } catch (err) {
      console.error("Error requesting fullscreen:", err);
    }
  };

  // Function to exit fullscreen
  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error exiting fullscreen:', err);
    }
  };

  const fetchUtilityVoice = async (code: number) => {
    try {
      const response = await fetch(`${API_URL}/user/utility-voice?code=${code}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': 'true'
        },
      });
      const data = await response.json();
      if (data.status === 'SUCCESS') {
        await playAudio(data.data.audioUrl);
      }
    } catch (error) {
      console.error('Error fetching utility voice:', error);
    }
  };
  const startInterview = async (interviewId) => {
    try {
      const response = await fetch(`${API_URL}/user/start-interview?id=${interviewId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': 'true'
        },
      });
      const data = await response.json();
      if (data.status === 'SUCCESS') {
        await playAudio(data.data.url);
      }
    } catch (error) {
      console.error('Error fetching utility voice:', error);
    }
  };

  const fetchQuestion = async (id: string) => {
    try {
      setIsProcessing(true);
      const response = await fetch(`${API_URL}/user/question?id=${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': 'true'
        },
      });

      if (response.status === 204) {
        if (interviewId) {
          updateInterviewStatus(interviewId, 'completed');
        }
        await fetchUtilityVoice(6000);
        handleEndInterview();
        return;
      }

      const data = await response.json();
      if (data.status === 'SUCCESS') {
        setUserInputRequired(data.data.userInputRequired);
        if (data.data.type === 'code') {
          setQuestionType("code");
          setCodingQuestion(data.data.question);
          setShowCodeEditor(true);
          
        }

        await playAudio(data.data.url);

        if (data.data.type === 'theory' && data.data.userInputRequired) {
          setIsMicOn(true);
        }
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const submitUserResponse = async (answer: string) => {
    if (!interviewId) return;

    if (questionType != "code" && answer.length < 30) {
      await fetchUtilityVoice(2000);
    }

    try {
      setIsProcessing(true);
      const response = await fetch(`${API_URL}/user/user-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          id: interviewId,
          answer: answer,
        }),
      });

      const data = await response.json();
      if (data.status === 'SUCCESS') {
        if (interviewId && questionType == "theory") {
          await fetchQuestion(interviewId);
        }
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setIsProcessing(false);
    }
  };
useEffect(() => {
  // Set mounted ref to true when component mounts
  isMountedRef.current = true;

  // Cleanup function that runs when component unmounts
  return () => {
    isMountedRef.current = false;
    cleanupAudio();
    
    // Clear any fullscreen warning timer
    if (fullscreenWarningTimer) {
      clearTimeout(fullscreenWarningTimer);
    }
    
    // Stop any media streams
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
}, []);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (isMicOn && isStarted) {
      startListening();
    } else {
      stopListening();
    }
  }, [isMicOn, isStarted]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleStartInterview = async () => {
    setShowInstructions(true);
  };

  const handleAgreeAndStart = async () => {
    setShowInstructions(false);
    setIsStarted(true);
    setShowSidebar(false);
    await enterFullscreen();

    try {
      await startInterview(interviewId);
      // await fetchUtilityVoice(1000);
      if (interviewId) {
        await fetchQuestion(interviewId);
      }
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

const handleEndInterview = async () => {
  // First report the cancellation if it's a manual end
  await handleInterviewCancellation('manually_ended');
  
  // Clean up audio
  cleanupAudio();
  
  // Stop all media streams
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    setStream(null);
  }
  
  // Stop speech recognition
  stopListening();
  
  // Reset UI state
  setShowSidebar(true);
  await exitFullscreen();
  
  // Navigate back to interviews page
  navigate('/interviews');
};

  const handleLanguageChange = (languageId: string) => {
    const newLanguage = languageOptions.find(lang => lang.id === languageId) || languageOptions[0];
    setSelectedLanguage(newLanguage);
    setCode(getDefaultCode(languageId));
  };

const handleSubmitCode = async (isAutoSubmit: boolean = false, submittedCode?: string) => {
  // Use submitted code if provided (from timer), otherwise use state
  const codeToSubmit = submittedCode || code;
  
  if (!codeToSubmit || !interviewId) return;

  // Clear any running timer if manually submitted
  if (!isAutoSubmit) {
    setTimeLeft(0);
  }
  
  setIsSubmitting(true);
  try {
    await submitUserResponse(codeToSubmit);
    setIsSubmitting(false);
    setShowCodeEditor(false);
    if (interviewId && questionType == "code") {
      await fetchQuestion(interviewId);
    }
    setCode(getDefaultCode(selectedLanguage.id));
  } catch (error) {
    console.error('Code submission error:', error);
  }
};


  const checkDeviceAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      const hasMicrophone = devices.some(device => device.kind === 'audioinput');

      if (!hasCamera && !hasMicrophone) {
        if (import.meta.env.DEV) {
          setIsSimulationMode(true);
          return true;
        }
        throw new Error('No camera or microphone found. Please connect the required devices and try again.');
      }
      if (!hasCamera) {
        if (import.meta.env.DEV) {
          setIsSimulationMode(true);
          return true;
        }
        throw new Error('No camera found. Please connect a camera and try again.');
      }
      if (!hasMicrophone) {
        if (import.meta.env.DEV) {
          setIsSimulationMode(true);
          return true;
        }
        throw new Error('No microphone found. Please connect a microphone and try again.');
      }

      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        setIsSimulationMode(true);
        return true;
      }
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Unable to access media devices. Please check your device permissions.');
      }
      return false;
    }
  };

  const initializeStream = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      newStream.getVideoTracks().forEach(track => {
        track.enabled = isCameraOn;
      });
      newStream.getAudioTracks().forEach(track => {
        track.enabled = isMicOn;
      });

      return newStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
      return null;
    }
  };

  const requestPermissions = async () => {
    try {
      setError(null);

      const devicesAvailable = await checkDeviceAvailability();
      if (!devicesAvailable) return;

      if (isSimulationMode) {
        setPermissions({ camera: true, microphone: true });
        return;
      }

      const newStream = await initializeStream();
      if (newStream) {
        setPermissions({ camera: true, microphone: true });
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        setIsSimulationMode(true);
        setPermissions({ camera: true, microphone: true });
        return;
      }

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setError('Permission denied. Please allow access to your camera and microphone.');
        } else if (error.name === 'NotFoundError') {
          setError('Required devices not found. Please check your camera and microphone connection.');
        } else if (error.name === 'NotReadableError') {
          setError('Unable to access your camera or microphone. Please check if another application is using them.');
        } else {
          setError('An error occurred while accessing your devices. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setPermissions({ camera: false, microphone: false });
    }
  };

  const toggleCamera = async () => {
    try {
      const newCameraState = !isCameraOn;
      setIsCameraOn(newCameraState);

      if (newCameraState) {
        const newStream = await initializeStream();
        if (newStream && videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } else {
        if (stream) {
          stream.getVideoTracks().forEach(track => track.stop());
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        }
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
      setError('Failed to toggle camera. Please try again.');
    }
  };

  const toggleMicrophone = async () => {
    if (!stream || isAudioPlaying || !userInputRequired) return;

    const audioTracks = stream.getAudioTracks();
    const newMicState = !isMicOn;

    audioTracks.forEach(track => {
      track.enabled = newMicState;
    });

    setIsMicOn(newMicState);

    if (!newMicState && transcript) {
      await submitUserResponse(transcript);
      setTranscript('');
    }
  };

  useEffect(() => {
    if (transcript && !isMicOn && userInputRequired) {
      submitUserResponse(transcript);
      setTranscript('');
    }
  }, [isMicOn, transcript]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (isStarted && !isSimulationMode && isCameraOn) {
      initializeStream();
    }
  }, [isStarted]);

  useEffect(() => {
    if (isStarted && !isSimulationMode) {
      if (isCameraOn) {
        initializeStream();
      } else if (stream) {
        stream.getVideoTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    }
  }, [isCameraOn]);

  if (showInstructions) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl"
        >
          <div className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-8 text-center shadow-sm">
            <h1 className="text-3xl font-bold mb-8">Important Guidelines</h1>
            <div className="space-y-8 mb-8">
              <div className="bg-[rgb(var(--card-hover))] p-6 rounded-xl">
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="space-y-3 text-left">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-1" />
                      <p className="text-[rgb(var(--text))]">
                        Speak clearly and maintain a professional demeanor throughout the interview.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-1" />
                      <p className="text-[rgb(var(--text))]">
                        Listen carefully to questions and take a moment to structure your responses.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-1" />
                      <p className="text-[rgb(var(--text))]">
                        For coding questions, explain your approach before starting to code.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-1" />
                      <p className="text-[rgb(var(--text))]">
                        If you need clarification, don't hesitate to ask questions.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Maximize2 className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-1" />
                      <p className="text-[rgb(var(--text))]">
                        The interview will be conducted in fullscreen mode for optimal experience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAgreeAndStart}
                className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white font-semibold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition duration-200 shadow-sm"
              >
                <CheckCircle className="w-5 h-5" />
                I Understand & Agree
              </motion.button>

              <button
                onClick={() => navigate('/interviews')}
                className="text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
              >
                Return to Interviews
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

   if (isStarted) {
    return (
      <div ref={containerRef} className="min-h-screen bg-[rgb(var(--background))]">
        {/* Fullscreen Warning */}
        <AnimatePresence>
          {showFullscreenWarning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5" />
              <span>Please return to fullscreen mode within 5 seconds or the interview will be canceled</span>
              <button
                onClick={enterFullscreen}
                className="bg-white text-red-500 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Return to Fullscreen
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative h-[calc(100vh-100px)]">
          <div className="h-full p-4">
            {/* Video Containers */}
            <div className="w-full h-full flex items-center justify-center gap-4">
              {/* Candidate Video */}
              <div className="w-1/2 h-[50vh] relative rounded-2xl overflow-hidden bg-[rgb(var(--card))] flex items-center justify-center shadow-sm">
                {isCameraOn ? (
                  isSimulationMode ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--card))] flex items-center justify-center opacity-50">
                      <div className="text-4xl font-bold text-white">You</div>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover mirror"
                      autoPlay
                      playsInline
                      muted
                    />
                  )
                ) : (
                  <div className="absolute inset-0 bg-[rgb(var(--card))] flex items-center justify-center">
                    <VideoOff className="w-16 h-16 text-[rgb(var(--muted))]" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-[rgb(var(--background))]/80 px-3 py-1 rounded-lg">
                  <span className="text-sm font-medium">You</span>
                </div>
              </div>

              {/* AI Interviewer Video */}
              <div className="w-1/2 h-[50vh] relative rounded-2xl overflow-hidden bg-[rgb(var(--card))] flex items-center justify-center shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--card))] flex items-center justify-center opacity-50">
                  <div className="text-4xl font-bold text-white">AI Interviewer</div>
                </div>
                <div className="absolute bottom-4 left-4 bg-[rgb(var(--background))]/80 px-3 py-1 rounded-lg">
                  <span className="text-sm font-medium">AI Interviewer</span>
                </div>
              </div>
            </div>

            {/* Code Editor Overlay */}
            <AnimatePresence>
              {showCodeEditor && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-4 bg-[rgb(var(--background))]/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg z-10"
                >
                  <div className="h-full bg-[rgb(var(--card))] rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[rgb(var(--border))]">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <select
                            value={selectedLanguage.id}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="px-3 py-1 rounded-lg bg-[rgb(var(--card-hover))] border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var( --accent))] transition-colors"
                          >
                            {languageOptions.map(lang => (
                              <option key={lang.id} value={lang.id}>
                                {lang.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="prose prose-invert max-h-[200px] overflow-y-auto custom-scrollbar">
                        <p className="whitespace-pre-line">{codingQuestion}</p>
                      </div>
                    </div>
                    {/* Add this inside the code editor overlay, before CodeMirror */}
<div className="absolute top-4 right-4 bg-[rgb(var(--card-hover))] px-4 py-2 rounded-lg flex items-center gap-2">
  <Clock className="w-4 h-4 text-[rgb(var(--muted))]" />
  <span className={`font-mono ${timeLeft <= 60 ? 'text-red-400 animate-pulse' : ''}`}>
    {formatTime(timeLeft)}
  </span>
</div>

                    <div className="flex-1 overflow-hidden">
                      <CodeMirror
                        value={code}
                        height="100%"
                        theme={vscodeDark}
                        extensions={[selectedLanguage.language()]}
                        onChange={(value) => setCode(value)}
                        className="h-full"
                      />
                    </div>

                    <div className="p-4 border-t border-[rgb(var(--border))] flex justify-end">
                      <button
                        onClick={handleSubmitCode}
                        disabled={isSubmitting}
                        className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Code</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="h-[100px] flex items-center justify-center gap-4 bg-[rgb(var(--card))] backdrop-blur-lg px-6 shadow-sm">
          <button
            onClick={toggleCamera}
            className={`p-4 rounded-full ${isCameraOn ? 'bg-[rgb(var(--card-hover))] hover:bg-[rgb(var(--border))]' : 'bg-red-500 hover:bg-red-600'
              } transition-colors duration-200`}
          >
            {isCameraOn ? <Camera className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>
<button
  onClick={toggleMicrophone}
  disabled={!userInputRequired || isAudioPlaying || isProcessing || questionType === "code"}
  className={`p-4 rounded-full ${
    isMicOn ? 'bg-[rgb(var(--card-hover))] hover:bg-[rgb(var(--border))]' : 'bg-red-500 hover:bg-red-600'
  } ${(!userInputRequired || isAudioPlaying || questionType === "code") ? 'opacity-50 cursor-not-allowed' : ''} 
  transition-colors duration-200 relative`}
>
  {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
  {isListening && (
    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
  )}
  
  {/* Tooltip */}
  {isMicOn && (
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-yellow-500/90 text-black font-medium text-sm rounded-lg whitespace-nowrap shadow-lg animate-pulse">
      Turn Off Mic After Response
    </div>
  )}
  
  {/* Tooltip for coding questions */}
  {/* {questionType === "code" && (
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-500/90 text-white text-sm rounded-lg whitespace-nowrap shadow-lg">
      Microphone disabled during coding
    </div>
  )} */}
</button>




          <button
            onClick={handleEndInterview}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-200"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen p-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        <div className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold mb-8">Interview Room</h1>

          {isSimulationMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg flex items-center gap-3"
            >
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <p className="text-blue-200 text-sm text-left">
                Running in simulation mode. Camera and microphone access will be simulated.
              </p>
            </motion.div>
          )}

          {error && !isSimulationMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-200 text-sm text-left">{error}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className={`p-6 rounded-lg ${permissions.camera
              ? 'bg-green-500/20 border-green-500/50'
              : 'bg-[rgb(var(--card-hover))] border-[rgb(var(--border))]'
              } border transition-colors duration-300`}
            >
              <Camera className={`w-8 h-8 mx-auto mb-2 ${permissions.camera ? 'text-green-400' : 'text-[rgb(var(--muted))]'
                }`} />
              <p className="font-medium">Camera</p>
              <p className="text-sm text-[rgb(var(--muted))]">
                {permissions.camera ? 'Ready' : 'Permission needed'}
              </p>
            </div>

            <div className={`p-6 rounded-lg ${permissions.microphone
              ? 'bg-green-500/20 border-green-500/50'
              : 'bg-[rgb(var(--card-hover))] border-[rgb(var(--border))]'
              } border transition-colors duration-300`}
            >
              <Mic className={`w-8 h-8 mx-auto mb-2 ${permissions.microphone ? 'text-green-400' : 'text-[rgb(var(--muted))]'
                }`} />
              <p className="font-medium">Microphone</p>
              <p className="text-sm text-[rgb(var(--muted))]">
                {permissions.microphone ? 'Ready' : 'Permission needed'}
              </p>
            </div>
          </div>

          {!permissions.camera || !permissions.microphone ? (
            <button
              onClick={requestPermissions}
              className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white font-semibold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition duration-200 shadow-sm"
            >
              Request Permissions
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => enterFullscreen()}
                disabled={isFullscreen}
                className={`bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white font-semibold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition duration-200 shadow-sm ${
                  isFullscreen ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Maximize2 className="w-5 h-5" />
                {isFullscreen ? 'Fullscreen Mode Active' : 'Enter Fullscreen Mode'}
              </button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartInterview}
                className={`bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg inline-flex items-center gap-2 transition duration-200 shadow-sm ${
                  !isFullscreen ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!isFullscreen}
              >
                <Play className="w-4 h-4" /> Let's Go
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
