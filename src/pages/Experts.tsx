import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Search, Filter, ChevronDown, ChevronUp, Calendar, Clock, Briefcase, GraduationCap, Users, AlertCircle, X, Check, SlidersHorizontal, ArrowUpDown, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Service {
  name: string;
  price: number;
  duration: number;
}

interface TimeSlot {
  time: string;
  status: 'available' | 'booked';
}

interface Availability {
  date: string;
  slots: TimeSlot[];
}

interface Expert {
  _id: string;
  name: string;
  profile: string;
  averageRating: number;
  totalReviews: number;
  specialization: string[];
  experience: string[];
  education: string;
  about: string;
  totalInterview: number;
  services: Service[];
  availability: Availability[];
}

interface Review {
  name: string;
  review : string;
  rating: number;
  createdAt: string;
}

interface ReviewsResponse {
  reviews: Review[];
  currentPage: number;
  totalPages: number;
  totalReviews: number;
}

interface BookingModalProps {
  expert: Expert;
  isOpen: boolean;
  onClose: () => void;
}

interface ExpertDetailsModalProps {
  expert: Expert;
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = ' https://a0f5-2401-4900-8823-15fc-35bf-4af4-e76d-7961.ngrok-free.app';

const BookingModal: React.FC<BookingModalProps> = ({ expert, isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const availableSlots = expert.availability
    .find(a => a.date === selectedDate)
    ?.slots || [];

  const handleBooking = async () => {
    setIsBooking(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsBooking(false);
    onClose();
  };

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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold">Book a Session</h3>
                <p className="text-sm text-[rgb(var(--muted))]">with {expert.name}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[rgb(var(--card-hover))] rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Select Service</label>
                <div className="space-y-2">
                  {expert.services.map((service) => (
                    <button
                      key={service.name}
                      onClick={() => setSelectedService(service)}
                      className={`w-full p-4 rounded-lg text-left transition-colors ${
                        selectedService?.name === service.name
                          ? 'bg-[rgb(var(--accent))] text-white'
                          : 'bg-[rgb(var(--card-hover))] hover:bg-[rgb(var(--border))]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{service.name}</span>
                        <span className="font-bold">₹{service.price}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm opacity-80">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration} minutes</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedService && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Date</label>
                    <select
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTime('');
                      }}
                      className="w-full px-4 py-2 rounded-lg bg-[rgb(var(--card-hover))] border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors"
                    >
                      <option value="">Choose a date</option>
                      {expert.availability.map((date) => (
                        <option key={date.date} value={date.date}>
                          {new Date(date.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Available Time Slots</label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedTime(slot.time)}
                            disabled={slot.status === 'booked'}
                            className={`
                              px-3 py-2 rounded-lg text-sm transition-colors
                              ${slot.status === 'booked' 
                                ? 'bg-red-500/20 text-red-200 cursor-not-allowed'
                                : selectedTime === slot.time
                                  ? 'bg-[rgb(var(--accent))] text-white'
                                  : 'bg-[rgb(var(--card-hover))] hover:bg-[rgb(var(--border))]'
                              }
                            `}
                          >
                            {slot.time}
                            {slot.status === 'booked' && (
                              <div className="text-xs opacity-75">Booked</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-[rgb(var(--border))] pt-4 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-[rgb(var(--muted))]">
                        <div>{selectedService.name}</div>
                        <div>{selectedService.duration} minutes</div>
                      </div>
                      <div className="text-xl font-bold">₹{selectedService.price}</div>
                    </div>

                    <button
                      onClick={handleBooking}
                      disabled={!selectedDate || !selectedTime || isBooking}
                      className={`
                        w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2
                        ${selectedDate && selectedTime && !isBooking
                          ? 'bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white'
                          : 'bg-[rgb(var(--card-hover))] text-[rgb(var(--muted))] cursor-not-allowed'
                        }
                      `}
                    >
                      {isBooking ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Booking...</span>
                        </>
                      ) : (
                        'Confirm Booking'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ExpertDetailsModal: React.FC<ExpertDetailsModalProps> = ({ expert, isOpen, onClose }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [showReviews, setShowReviews] = useState(false);

  const fetchReviews = async (page: number) => {
    try {
      setIsLoadingReviews(true);
      setReviewsError(null);

      const response = await fetch(`${API_URL}/expert/reviews/${expert._id}?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      const data = await response.json();

      if (data.status === 'SUCCESS') {
        if (page === 1) {
          setReviews(data.data.reviews);
        } else {
          setReviews(prev => [...prev, ...data.data.reviews]);
        }
        setCurrentPage(data.data.currentPage);
        setTotalPages(data.data.totalPages);
        setTotalReviews(data.data.totalReviews);
      } else {
        setReviewsError(data.message);
      }
    } catch (error) {
      setReviewsError('Failed to fetch reviews');
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchReviews(currentPage + 1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
            className="bg-[rgb(var(--card))] rounded-xl shadow-lg max-h-[90vh] overflow-hidden flex flex-col w-full max-w-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-[rgb(var(--border))]">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <img
                    src={expert.profile}
                    alt={expert.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[rgb(var(--accent))]"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{expert.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted))]">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="ml-1">{expert.averageRating}</span>
                      </div>
                      <span>•</span>
                      <span>{expert.totalReviews} reviews</span>
                      <span>•</span>
                      <span>{expert.totalInterview} sessions</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-[rgb(var(--card-hover))] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-semibold mb-2">About</h4>
                  <p className="text-[rgb(var(--muted))]">{expert.about}</p>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Specialization</h4>
                  <div className="flex flex-wrap gap-2">
                    {expert.specialization.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Experience</h4>
                  <div className="space-y-4">
                    {expert.experience.map((exp, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-[rgb(var(--card-hover))] rounded-lg"
                      >
                        <Briefcase className="w-5 h-5 text-[rgb(var(--accent))]" />
                        <div>
                          <p>{exp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Education</h4>
                  <div className="flex items-center gap-3 p-4 bg-[rgb(var(--card-hover))] rounded-lg">
                    <GraduationCap className="w-5 h-5 text-[rgb(var(--accent))]" />
                    <p>{expert.education}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Services</h4>
                  <div className="grid gap-4">
                    {expert.services.map((service) => (
                      <div
                        key={service.name}
                        className="p-4 bg-[rgb(var(--card-hover))] rounded-lg"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium">{service.name}</h5>
                          <span className="text-lg font-bold text-[rgb(var(--accent))]">
                            ₹{service.price}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted))]">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration} minutes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews Section */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center justify-between">
                    <span>Reviews ({totalReviews})</span>
                    <button
                      onClick={() => {
                        if (!showReviews) {
                          fetchReviews(1);
                        }
                        setShowReviews(!showReviews);
                      }}
                      className="text-sm px-3 py-1 rounded-lg bg-[rgb(var(--card-hover))] hover:bg-[rgb(var(--border))] transition-colors"
                    >
                      {showReviews ? 'Hide Reviews' : 'Show Reviews'}
                    </button>
                  </h4>

                  <AnimatePresence>
                    {showReviews && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        {isLoadingReviews && reviews.length === 0 ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : reviewsError ? (
                          <div className="text-center py-8 text-red-400">
                            {reviewsError}
                          </div>
                        ) : reviews.length === 0 ? (
                          <div className="text-center py-8 text-[rgb(var(--muted))]">
                            No reviews yet
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {reviews.map((review, index) => (
                              <motion.div
                                key={`${review.name}-${review.createdAt}-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-4 bg-[rgb(var(--card-hover))] rounded-lg"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <h5 className="font-medium">{review.name}</h5>
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < review.rating
                                              ? 'text-yellow-400 fill-yellow-400'
                                              : 'text-[rgb(var(--muted))]'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <span className="text-sm text-[rgb(var(--muted))]">
                                    {formatDate(review.createdAt)}
                                  </span>
                                </div>
                                <p className="text-[rgb(var(--text))] text-sm">
                                  {review.review}
                                </p>
                              </motion.div>
                            ))}

                            {currentPage < totalPages && (
                              <div className="text-center pt-4">
                                <button
                                  onClick={handleLoadMore}
                                  disabled={isLoadingReviews}
                                  className="px-4 py-2 bg-[rgb(var(--card))] hover:bg-[rgb(var(--border))] rounded-lg transition-colors flex items-center gap-2 mx-auto"
                                >
                                  {isLoadingReviews ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                      Loading...
                                    </>
                                  ) : (
                                    'Load More Reviews'
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[rgb(var(--border))] bg-[rgb(var(--card-hover))]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[rgb(var(--accent))]">
                      {expert.totalInterview}
                    </div>
                    <div className="text-sm text-[rgb(var(--muted))]">
                      Sessions
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[rgb(var(--accent))]">
                      {expert.averageRating}
                    </div>
                    <div className="text-sm text-[rgb(var(--muted))]">
                      Rating
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    // Open booking modal
                  }}
                  className="px-6 py-2 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg transition-colors"
                >
                  Book Session
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function Experts() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    specialization: 'all',
    priceRange: 'all',
    rating: 'all'
  });
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'experience'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { user } = useAuth();

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const response = await fetch(`${API_URL}/experts`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'ngrok-skip-browser-warning': 'true'
          }
        });

        const data = await response.json();

        if (data.status === 'SUCCESS') {
          setExperts(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch experts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperts();
  }, []);

  const allSpecializations = Array.from(
    new Set(experts.flatMap(expert => expert.specialization))
  );

  const priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under ₹50', value: '0-50' },
    { label: '₹50 - ₹100', value: '50-100' },
    { label: 'Over ₹100', value: '100+' }
  ];

  const ratingOptions = [
    { label: 'All Ratings', value: 'all' },
    { label: '4.5 & above', value: '4.5' },
    { label: '4.0 & above', value: '4.0' },
    { label: '3.5 & above', value: '3.5' }
  ];

  const filteredExperts = experts
    .filter(expert => {
      const matchesSearch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.specialization.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSpecialization = filters.specialization === 'all' ||
        expert.specialization.includes(filters.specialization);

      const matchesPriceRange = filters.priceRange === 'all' || (() => {
        const minPrice = Math.min(...expert.services.map(s => s.price));
        const [min, max] = filters.priceRange.split('-');
        if (max === '+') return minPrice >= parseInt(min);
        if (max) return minPrice >= parseInt(min) && minPrice <= parseInt(max);
        return true;
      })();

      const matchesRating = filters.rating === 'all' ||
        expert.averageRating >= parseFloat(filters.rating);

      return matchesSearch && matchesSpecialization && matchesPriceRange && matchesRating;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'rating':
          comparison = b.averageRating - a.averageRating;
          break;
        case 'price':
          comparison = Math.min(...b.services.map(s => s.price)) -
            Math.min(...a.services.map(s => s.price));
          break;
        case 'experience':
          comparison = b.totalInterview - a.totalInterview;
          break;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[rgb(var(--accent))] border-t-transparent rounded-full animate-spin" />
          <p className="text-[rgb(var(--muted))]">Loading experts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
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
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Expert Interviews</h1>
          <p className="text-[rgb(var(--muted))]">
            Book sessions with experienced professionals for mock interviews and resume reviews
          </p>

          <div className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(var(--muted))] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--card-hover))] rounded-lg border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors"
                />
              </div>

              {/* Sort and Filter */}
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="appearance-none pl-8 pr-8 py-2 bg-[rgb(var(--card-hover))] rounded-lg border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors"
                  >
                    <option value="rating">Rating</option>
                    <option value="price">Price</option>
                    <option value="experience">Experience</option>
                  </select>
                  <ArrowUpDown className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted))]" />
                  <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {sortOrder === 'asc' ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-[rgb(var(--card-hover))] rounded-lg hover:bg-[rgb(var(--border))] transition-colors flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid md:grid-cols-3 gap-6 pt-6 mt-6 border-t border-[rgb(var(--border))]">
                    {/* Specialization Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Specialization</label>
                      <select
                        value={filters.specialization}
                        onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                        className="w-full px-4 py-2 bg-[rgb(var(--card-hover))] rounded-lg border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors"
                      >
                        <option value="all">All Specializations</option>
                        {allSpecializations.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Price Range</label>
                      <select
                        value={filters.priceRange}
                        onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                        className="w-full px-4 py-2 bg-[rgb(var(--card-hover))] rounded-lg border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors"
                      >
                        {priceRanges.map(range => (
                          <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <select
                        value={filters.rating}
                        onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                        className="w-full px-4 py-2 bg-[rgb(var(--card-hover))] rounded-lg border border-[rgb(var(--border))] focus:border-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))] transition-colors"
                      >
                        {ratingOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.map((expert) => (
              <motion.div
                key={expert._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[rgb(var(--card))] backdrop-blur-lg rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={expert.profile}
                    alt={expert.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[rgb(var(--accent))]"
                  />
                  <div>
                    <h3 className="font-semibold">{expert.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted))]">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="ml-1">{expert.averageRating}</span>
                      </div>
                      <span>•</span>
                      <span>{expert.totalReviews} reviews</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex flex-wrap gap-2">
                    {expert.specialization.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] rounded-full text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {expert.specialization.length > 3 && (
                      <span className="px-2 py-1 bg-[rgb(var(--card-hover))] rounded-full text-xs">
                        +{expert.specialization.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <Briefcase className="w-4 h-4 mt-1 text-[rgb(var(--muted))]" />
                    <span className="text-sm line-clamp-2">{expert.experience[0]}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 mt-1 text-[rgb(var(--muted))]" />
                    <span className="text-sm">{expert.education}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedExpert(expert);
                      setShowDetailsModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-[rgb(var(--card-hover))] hover:bg-[rgb(var(--border))] rounded-lg transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setSelectedExpert(expert);
                      setShowBookingModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Book Session
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredExperts.length === 0 && (
            <div className="text-center py-12 bg-[rgb(var(--card))] rounded-xl">
              <Users className="w-12 h-12 mx-auto mb-4 text-[rgb(var(--muted))]" />
              <p className="text-[rgb(var(--muted))]">No experts found matching your criteria</p>
            </div>
          )}
        </div>
      </motion.div>

      {selectedExpert && (
        <>
          <BookingModal
            expert={selectedExpert}
            isOpen={showBookingModal}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedExpert(null);
            }}
          />
          <ExpertDetailsModal
            expert={selectedExpert}
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedExpert(null);
            }}
          />
        </>
      )}
    </div>
  );
}
