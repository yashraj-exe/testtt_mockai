import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  AtSign,
  Phone,
  Building2,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Timer,
  Send,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = 'https://a0f5-2401-4900-8823-15fc-35bf-4af4-e76d-7961.ngrok-free.app';

// Predefined avatars
const avatars = [
  {
    id: "a1B2",
    avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_1.png",
  },
  {
    id: "c3D4",
    avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_3.png",
  },
  {
    id: "e5F6",
    avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_16.png",
  },
  {
    id: "g7H8",
    avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_23.png",
  },
  {
    id: "i9J0",
    avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_32.png",
  },
  {
    id: "k1L2",
    avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_5.png",
  },
  {
    id: "m3N4",
    avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_7.png",
  },
  {
    id: "o5P6",
    avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_17.png",
  },
  {
    id: "q7R8",
    avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_29.png",
  },
  {
    id: "s9T0",
    avatar: "https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_19.png",
  },
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization: string;
  password: string;
  confirmPassword: string;
  selectedAvatar: string;
  otp: string;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  organization: "",
  password: "",
  confirmPassword: "",
  selectedAvatar: "",
  otp: "",
};

const validations = {
  firstName: (value: string) => {
    if (!value.trim()) return "First name is required";
    if (value.length < 2) return "First name must be at least 2 characters";
    if (!/^[a-zA-Z\s]*$/.test(value))
      return "First name can only contain letters";
    return "";
  },
  lastName: (value: string) => {
    if (!value.trim()) return "Last name is required";
    if (value.length < 2) return "Last name must be at least 2 characters";
    if (!/^[a-zA-Z\s]*$/.test(value))
      return "Last name can only contain letters";
    return "";
  },
  email: (value: string) => {
    if (!value.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Please enter a valid email";
    return "";
  },
  phone: (value: string) => {
    if (!value.trim()) return "Phone number is required";
    if (!/^\+?[\d\s-]{10,}$/.test(value))
      return "Please enter a valid phone number";
    return "";
  },
  organization: (value: string) => {
    if (!value.trim()) return "Organization is required";
    if (value.length < 2)
      return "Organization name must be at least 2 characters";
    return "";
  },
  password: (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/(?=.*[a-z])/.test(value))
      return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(value))
      return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(value))
      return "Password must contain at least one number";
    return "";
  },
  confirmPassword: (value: string, password: string) => {
    if (!value) return "Please confirm your password";
    if (value !== password) return "Passwords do not match";
    return "";
  },
  selectedAvatar: (value: string) => {
    if (!value) return "Please select an avatar";
    return "";
  },
  otp: (value: string) => {
    if (!value) return "Please enter OTP";
    if (value.length !== 4) return "OTP must be 4 digits";
    if (!/^\d+$/.test(value)) return "OTP must contain only numbers";
    return "";
  },
};

// Separate OTP Input Component
const OtpInput: React.FC<{
  isOtpSent: boolean;
  isVerifyingOtp: boolean;
  errors: Record<string, string>;
  onOtpChange: (otp: string) => void;
}> = ({ isOtpSent, isVerifyingOtp, errors, onOtpChange }) => {
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      
      // Combine OTP values and update parent
      const combinedOtp = newOtpValues.join('');
      onOtpChange(combinedOtp);

      // Move to next input if value is entered
      if (value && index < 3) {
        otpInputRefs[index + 1].current?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const newOtpValues = pastedData.split('').concat(Array(4 - pastedData.length).fill(''));
      setOtpValues(newOtpValues);
      onOtpChange(pastedData);
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {otpValues.map((value, index) => (
        <input
          key={index}
          ref={otpInputRefs[index]}
          type="text"
          maxLength={1}
          value={value}
          onChange={(e) => handleOtpChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={!isOtpSent || isVerifyingOtp}
          className={`w-14 h-14 text-center text-2xl rounded-lg border 
            ${errors.otp ? "border-red-500" : "border-[rgb(var(--border))]"}
            ${!isOtpSent ? "bg-[rgb(var(--card-hover))]/50 cursor-not-allowed" : "bg-[rgb(var(--card-hover))]"}
            focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors`}
        />
      ))}
    </div>
  );
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isGeneratingOtp, setIsGeneratingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (successMessage || error) {
      timeoutId = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 3000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [successMessage, error]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const validateField = (field: keyof FormData, value: string) => {
    if (field === "confirmPassword") {
      return validations[field](value, formData.password);
    }
    return validations[field as keyof typeof validations](value);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateStep = (step: number) => {
    const fieldsToValidate: Record<number, (keyof FormData)[]> = {
      1: ["firstName", "lastName", "email", "phone", "organization"],
      2: ["otp"],
      3: ["selectedAvatar"],
      4: ["password", "confirmPassword"],
    };

    const stepErrors: Record<string, string> = {};
    fieldsToValidate[step].forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) stepErrors[field] = error;
    });

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleGenerateOtp = async () => {
    if (!formData.phone) {
      setErrors({ phone: "Phone number is required" });
      return;
    }

    setIsGeneratingOtp(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/user/generateOtp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          phone: formData.phone,
          email : formData.email
        })
      });

      const data = await response.json();

      if (data.status === 'SUCCESS') {
        setSuccessMessage("OTP sent successfully");
        setTimer(60);
        setIsOtpSent(true);
      } else {
        setErrors({ otp: data.message });
      }
    } catch (err) {
      setErrors({ otp: "Failed to send OTP" });
    } finally {
      setIsGeneratingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp) {
      setErrors({ otp: "Please enter OTP" });
      return;
    }

    setIsVerifyingOtp(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/user/validateOtp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          phone: formData.phone,
          otp: parseInt(formData.otp)
        })
      });

      const data = await response.json();

      if (data.status === 'SUCCESS') {
        setSuccessMessage("OTP verified successfully");
        setIsOtpVerified(true);
        setTimeout(() => {
          handleNext();
        }, 2000);
      } else {
        setErrors({ otp: data.message });
      }
    } catch (err) {
      setErrors({ otp: "Failed to verify OTP" });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleNext = async () => {
  if (validateStep(currentStep)) {
    if (currentStep === 1) {
      // Validate phone number before moving to OTP step
      setIsGeneratingOtp(true);
      setErrors({});

      try {
        const response = await fetch(`${API_URL}/user/generateOtp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            phone: formData.phone,
            email: formData.email
          })
        });

        const data = await response.json();

        if (data.status === 'SUCCESS') {
          setSuccessMessage("OTP sent successfully");
          setTimer(60);
          setIsOtpSent(true);
          setCurrentStep(2); // Move to OTP verification step
        } else {
          if(data.message == "Email already exists"){
            setErrors({ email: data.message });
          }else if(data.message == "Email and phone number already exist"){
            setErrors({email : "Email already exists",phone : "Phone number already exists"})
          }else{
            setErrors({ phone: data.message });  
          }
        }
      } catch (err) {
        setErrors({ phone: "Failed to send OTP" });
      } finally {
        setIsGeneratingOtp(false);
      }
    } else if (currentStep === 2 && isOtpVerified) {
      setCurrentStep(3); // Move to avatar selection
    } else if (currentStep === 3) {
      setCurrentStep(4); // Move to password setup
    }
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsLoading(true);
    setErrors({});

    try {
      const selectedAvatarObj = avatars.find(
        (avatar) => avatar.avatar === formData.selectedAvatar
      );
      const avatarId = selectedAvatarObj?.id || avatars[0].id;

      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: parseInt(formData.phone.replace(/\D/g, "")),
        organisation: formData.organization.trim(),
        password: formData.password,
        avatarId,
      };

      const result = await register(registrationData);

      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setErrors({ submit: result.message });
      }
    } catch (err) {
      setErrors({ submit: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    field: keyof FormData,
    label: string,
    type: string,
    icon: React.ReactNode,
    placeholder: string
  ) => (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted))]">
          {icon}
        </div>
        <input
          type={type}
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={`w-full pl-10 pr-4 py-2 bg-[rgb(var(--card-hover))] rounded-lg border ${errors[field] ? "border-red-500" : "border-[rgb(var(--border))]"
            } focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors`}
          placeholder={placeholder}
          disabled={isLoading}
        />
      </div>
      {errors[field] && (
        <p className="mt-1 text-sm text-red-500">{errors[field]}</p>
      )}
    </div>
  );

  const renderPasswordInput = (
    field: "password" | "confirmPassword",
    label: string,
    showPasswordState: boolean,
    setShowPasswordState: (value: boolean) => void
  ) => (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted))] w-5 h-5" />
        <input
          type={showPasswordState ? "text" : "password"}
          value={formData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={`w-full pl-10 pr-12 py-2 bg-[rgb(var(--card-hover))] rounded-lg border ${errors[field] ? "border-red-500" : "border-[rgb(var(--border))]"
            } focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors`}
          placeholder={`Enter your ${field === "password" ? "password" : "password confirmation"
            }`}
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPasswordState(!showPasswordState)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
          disabled={isLoading}
        >
          {showPasswordState ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      {errors[field] && (
        <p className="mt-1 text-sm text-red-500">{errors[field]}</p>
      )}
    </div>
  );

const renderOtpStep = () => (
  <motion.div
    key="step2"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="text-center space-y-16">
      {isOtpVerified ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <p className="text-lg font-medium text-green-500">Phone Verified!</p>
            <p className="text-[rgb(var(--muted))]">Thank you for verifying your phone number</p>
          </div>
        </motion.div>
      ) : (
        <p className="text-[rgb(var(--muted))]">
          Enter the 4-digit code sent to {formData.phone}
        </p>
      )}
    </div>

    {!isOtpVerified && (
      <div className="space-y-6">
        <OtpInput
          isOtpSent={isOtpSent}
          isVerifyingOtp={isVerifyingOtp}
          errors={errors}
          onOtpChange={(otp) => handleInputChange("otp", otp)}
        />

        {errors.otp && (
          <p className="text-sm text-red-500 text-center">{errors.otp}</p>
        )}

        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={formData.otp.length !== 4 || isVerifyingOtp}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                formData.otp.length === 4 && !isVerifyingOtp
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-[rgb(var(--card-hover))] text-[rgb(var(--muted))] cursor-not-allowed"
              }`}
            >
              {isVerifyingOtp ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Verify OTP</span>
                </>
              )}
            </button>

            {timer > 0 ? (
              <div className="flex items-center gap-2 text-[rgb(var(--muted))]">
                <Timer className="w-4 h-4" />
                <span>Resend in {timer}s</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGenerateOtp}
                disabled={isGeneratingOtp}
                className="text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Resend OTP</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )}
  </motion.div>
);


  return (
    <div className="min-h-screen p-4 md:p-6">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 bg-[rgb(var(--card))] md:bg-[rgb(var(--accent))]/20 hover:bg-[rgb(var(--accent))]/30 text-[rgb(var(--accent))] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm md:shadow-none"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="md:inline">Back</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-[rgb(var(--card))] rounded-xl p-6 md:p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-[rgb(var(--muted))]">
              Join our community of interviewers and candidates
            </p>
          </div>

          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3"
              >
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-green-200">{successMessage}</p>
              </motion.div>
            )}

            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-200">{errors.submit}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className="relative flex items-center justify-center">
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor:
                        currentStep >= step
                          ? "rgb(var(--accent))"
                          : "rgb(var(--card-hover))",
                      scale: currentStep === step ? 1.1 : 1,
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
                  >
                    {currentStep > step ? <Check className="w-5 h-5" /> : step}
                  </motion.div>
                  <AnimatePresence>
                    {currentStep === step && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-10 -translate-x-1/2 whitespace-nowrap text-sm font-medium"
                      >
                        {step === 1
                          ? "Basic Info"
                          : step === 2
                            ? "Verify Phone"
                            : step === 3
                              ? "Choose Avatar"
                              : "Set Password"}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${currentStep > step
                      ? "bg-[rgb(var(--accent))]"
                      : "bg-[rgb(var(--card-hover))]"
                      }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={() => { }} autoComplete="off" className="space-y-6">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput(
                      "firstName",
                      "First Name",
                      "text",
                      <User className="w-5 h-5" />,
                      "Enter your First Name"
                    )}
                    {renderInput(
                      "lastName",
                      "Last Name",
                      "text",
                      <User className="w-5 h-5" />,
                      "Enter your Last Name"
                    )}
                  </div>
                  {renderInput(
                    "email",
                    "Email",
                    "email",
                    <AtSign className="w-5 h-5" />,
                    "Enter your Email"
                  )}
                  {renderInput(
                    "phone",
                    "Phone Number",
                    "tel",
                    <Phone className="w-5 h-5" />,
                    "Enter your Phone Number"
                  )}
                  {renderInput(
                    "organization",
                    "Organization/College/School",
                    "text",
                    <Building2 className="w-5 h-5" />,
                    "Enter your Organization/College/School"
                  )}
                </motion.div>
              )}

              {currentStep === 2 && renderOtpStep()}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    {/* <h3 className="text-lg font-semibold mb-2">
                      Choose Your Avatar
                    </h3> */}
                    <p className="text-[rgb(var(--muted))]">
                      Select an avatar that represents you
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {avatars.map((avatar) => (
                      <motion.button
                        key={avatar.id}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleInputChange("selectedAvatar", avatar.avatar)
                        }
                        className={`relative rounded-xl overflow-hidden aspect-square ${formData.selectedAvatar === avatar.avatar
                          ? "ring-4 ring-[rgb(var(--accent))]"
                          : "hover:ring-2 hover:ring-[rgb(var(--border))]"
                          } transition-all duration-200 bg-[rgb(var(--card-hover))]`}
                        disabled={isLoading}
                      >
                        
                        <img
                          src={avatar.avatar}
                          alt={`Avatar ${avatar.id}`}
                          className="w-full h-full object-contain p-2"
                        />
                        {formData.selectedAvatar === avatar.avatar && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-[rgb(var(--accent))]/20 flex items-center justify-center"
                          >
                            <Check className="w-6 h-6 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                  {errors.selectedAvatar && (
                    <p className="text-sm text-red-500 text-center">
                      {errors.selectedAvatar}
                    </p>
                  )}
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {renderPasswordInput(
                    "password",
                    "Password",
                    showPassword,
                    setShowPassword
                  )}
                  {renderPasswordInput(
                    "confirmPassword",
                    "Confirm Password",
                    showConfirmPassword,
                    setShowConfirmPassword
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between items-center pt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
                  disabled={isLoading}
                >
                  Back
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors"
                >
                  Already have an account?
                </Link>
              )}

              {currentStep < 4 ? (
                <motion.button
                  type="button"
                  onClick={handleNext}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${(currentStep === 2 && !isOtpVerified) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  disabled={isLoading || (currentStep === 2 && !isOtpVerified)}
                >
                  Next <ArrowRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  whileHover={{scale: 1.02}}
                  whileTap={{scale: 0.98}}
                  disabled={isLoading}
                  onClick={handleSubmit}
                  className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
