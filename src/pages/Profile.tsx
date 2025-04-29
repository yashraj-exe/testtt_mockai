import React, { useState,useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, Trash2, Lock, FileText, User, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth} from '../context/AuthContext';


// Predefined avatars
const avatars = [
  {
    id: 'a1B2',
    avatar: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_1.png'
  },
  {
    id: 'c3D4',
    avatar: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_3.png'
  },
  {
    id: 'e5F6',
    avatar: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_16.png'
  },
  {
    id: 'g7H8',
    avatar: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_23.png'
  },
  {
    id: 'i9J0',
    avatar: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_32.png'
  },
  {
    id: 'k1L2',
    avatar: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_5.png'
  },
  {
    id: 'm3N4',
    avatar: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_7.png'
  },
  {
    id: 'o5P6',
    avatar: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_17.png'
  },
  {
    id: 'q7R8',
    avatar: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_29.png'
  },
  {
    id: 's9T0',
    avatar: 'https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_19.png'
  }
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, changeUsername, changePassword, changeAvatar, uploadResume, deleteResume } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.name || '');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isDeletingResume, setIsDeletingResume] = useState<string | null>(null);


  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const result = await changePassword(currentPassword, newPassword);
      
      if (result.success) {
        setSuccess(result.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameUpdate = async () => {
    setUsernameError(null);
    setIsLoading(true);
    
    // Basic validation
    if (!newUsername.trim()) {
      setUsernameError('Username cannot be empty');
      setIsLoading(false);
      return;
    }

    try {
      const result = await changeUsername(newUsername);
      
      if (result.success) {
        setSuccess(result.message);
        setIsEditingUsername(false);
      } else {
        setUsernameError(result.message);
      }
    } catch (err) {
      setUsernameError('Failed to update username');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpdate = async () => {
    if (!selectedAvatar) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Find the avatar ID from the selected avatar URL
      const selectedAvatarObj = avatars.find(avatar => avatar.avatar === selectedAvatar);
      if (!selectedAvatarObj) {
        throw new Error('Invalid avatar selected');
      }

      const result = await changeAvatar(selectedAvatarObj.id);
      
      if (result.success) {
        setSuccess(result.message);
        setIsChangingAvatar(false);
        setSelectedAvatar('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to update avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResume(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await uploadResume(file);
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to upload resume');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleResumeDelete = async (id: string) => {
    setIsDeletingResume(id);
    setError(null);
    setSuccess(null);

    try {
      const result = await deleteResume(id);
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to delete resume');
    } finally {
      setIsDeletingResume(null);
    }
  };
  useEffect(() => {
    let timeoutId;

    if (success) {
      timeoutId = setTimeout(() => {
        setSuccess(null);
      }, 3000);
    }

    if (error) {
      timeoutId = setTimeout(() => {
        setError(null);
      }, 3000);
    }

    return () => clearTimeout(timeoutId);
  }, [success, error]);
  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto space-y-6"
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
          <h1 className="text-3xl font-bold">Profile Settings</h1>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Avatar Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Avatar
            </h2>

            {isChangingAvatar ? (
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-3">
                  {avatars.map((avatar) => (
                    <motion.button
                      key={avatar.id}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedAvatar(avatar.avatar)}
                      className={`relative rounded-xl overflow-hidden aspect-square ${
                        selectedAvatar === avatar.avatar
                          ? 'ring-4 ring-[rgb(var(--accent))]'
                          : 'hover:ring-2 hover:ring-[rgb(var(--border))]'
                      } transition-all duration-200 bg-[rgb(var(--card-hover))]`}
                      disabled={isLoading}
                    >
                      <img
                        src={avatar.avatar}
                        alt={`Avatar ${avatar.id}`}
                        className="w-full h-full object-contain p-2"
                      />
                      {selectedAvatar === avatar.avatar && (
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
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setIsChangingAvatar(false);
                      setSelectedAvatar('');
                    }}
                    className="px-4 py-2 rounded-lg hover:bg-[rgb(var(--card-hover))] transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAvatarUpdate}
                    disabled={!selectedAvatar || isLoading}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      selectedAvatar && !isLoading
                        ? 'bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white'
                        : 'bg-[rgb(var(--card-hover))] text-[rgb(var(--muted))] cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      'Save Avatar'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[rgb(var(--card-hover))]">
                  <img
                    src={user?.avatarUrl || avatars[0].avatar}
                    alt="Current Avatar"
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <div>
                  <p className="text-sm text-[rgb(var(--muted))]">Your avatar</p>
                  <button
                    onClick={() => setIsChangingAvatar(true)}
                    className="text-[rgb(var(--accent))] hover:text-[rgb(var(--accent-hover))] transition-colors mt-1"
                  >
                    Change Avatar
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Username Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Username
            </h2>
            
            {isEditingUsername ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">New Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg bg-[rgb(var(--card-hover))] border ${
                        usernameError ? 'border-red-500' : 'border-[rgb(var(--border))]'
                      } focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors pr-24`}
                      placeholder="Enter new username"
                      disabled={isLoading}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsEditingUsername(false);
                          setNewUsername(user?.name || '');
                          setUsernameError(null);
                        }}
                        className="text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] transition-colors px-2 py-1"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUsernameUpdate}
                        disabled={isLoading}
                        className="bg-[rgb(var(--accent))] text-white px-3 py-1 rounded-md hover:bg-[rgb(var(--accent-hover))] transition-colors flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          'Save'
                        )}
                      </button>
                    </div>
                  </div>
                  {usernameError && (
                    <p className="mt-1 text-sm text-red-400">{usernameError}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium">{user?.name}</p>
                  <p className="text-sm text-[rgb(var(--muted))]">Your display name</p>
                </div>
                <button
                  onClick={() => setIsEditingUsername(true)}
                  className="px-4 py-2 rounded-lg bg-[rgb(var(--card-hover))] hover:bg-[rgb(var(--border))] transition-colors"
                >
                  Edit
                </button>
              </div>
            )}
          </motion.div>

          {/* Password Update */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </h2>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
  <label className="block text-sm font-medium mb-2">Current Password</label>
  <input
    type="password"
    value={currentPassword}
    onChange={(e) => setCurrentPassword(e.target.value)}
    className="w-full px-4 py-2 rounded-lg bg-[rgb(var(--card-hover))] border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors"
    required
    disabled={isLoading}
  />
</div>

              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[rgb(var(--card-hover))] border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[rgb(var(--card-hover))] border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors"
                  required
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-sm flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </motion.div>

          {/* Resume Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6 shadow-sm md:col-span-1"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Resume Management
            </h2>
            <div className="space-y-4">
              {user?.resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between p-3 bg-[rgb(var(--card-hover))] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[rgb(var(--muted))]" />
                    <div>
                      <p className="font-medium">{resume.name}</p>
                      <p className="text-sm text-[rgb(var(--muted))]">
                        Uploaded on {resume.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleResumeDelete(resume.id)}
                    disabled={isDeletingResume === resume.id}
                    className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                  >
                    {isDeletingResume === resume.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              ))}

              {user?.resumes.length < 3 && (
                <label className="block">
                  <div className="border-2 border-dashed border-[rgb(var(--border))] rounded-lg p-6 text-center cursor-pointer hover:border-[rgb(var(--accent))] transition-colors relative">
                    {isUploadingResume ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-[rgb(var(--muted))]">Uploading resume...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-[rgb(var(--muted))]" />
                        <p className="text-sm text-[rgb(var(--muted))]">
                          Click to upload a new resume
                          <br />
                          <span className="text-xs">
                            ({3 - (user?.resumes.length || 0)} slots remaining)
                          </span>
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}