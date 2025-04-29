import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Shield, Zap, MessageSquare, ArrowLeft } from 'lucide-react';
import { Logo } from '../App';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "Google",
    avatar: "https://source.unsplash.com/mEZ3PoFGs_k/100x100",
    content: "This platform completely transformed my interview preparation. The AI-powered feedback helped me identify and improve my weak areas.",
    rating: 5
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    role: "Frontend Developer",
    company: "Meta",
    avatar: "https://source.unsplash.com/ZHvM3XIOHoE/100x100",
    content: "The realistic interview simulations gave me the confidence I needed. Landed my dream job at Meta!",
    rating: 5
  },
  {
    id: 3,
    name: "Emily Thompson",
    role: "Product Manager",
    company: "Amazon",
    avatar: "https://source.unsplash.com/7u5mwbu7qLg/100x100",
    content: "The detailed feedback and scoring system helped me track my progress. Highly recommended!",
    rating: 5
  },
  {
    id: 4,
    name: "David Kim",
    role: "Full Stack Developer",
    company: "Microsoft",
    avatar: "https://source.unsplash.com/WNoLnJo7tS8/100x100",
    content: "Best interview preparation platform I've used. The AI interviewer feels incredibly realistic.",
    rating: 5
  },
  {
    id: 5,
    name: "Lisa Patel",
    role: "UX Designer",
    company: "Apple",
    avatar: "https://source.unsplash.com/QXevDflbl8A/100x100",
    content: "The platform's interface is intuitive and the feedback is incredibly detailed. Worth every penny!",
    rating: 5
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Backend Engineer",
    company: "Netflix",
    avatar: "https://source.unsplash.com/rDEOVtE7vOs/100x100",
    content: "The variety of interview scenarios and difficulty levels helped me prepare thoroughly.",
    rating: 5
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials, ...testimonials, ...testimonials];

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="floating-ball" style={{ left: '10%', top: '20%', opacity: 0.15 }} />
        <div className="floating-ball" style={{ right: '10%', top: '60%', opacity: 0.15 }} />
      </div>

      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col">
        <nav className="absolute top-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="scale-125 origin-left"
              >
                <Logo />
              </motion.div>
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-lg hover:bg-[rgb(var(--card))] transition-colors"
                >
                  Sign In
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Master Your Interview Skills with
              <span className="text-[rgb(var(--accent))]"> AI</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-[rgb(var(--muted))] mb-12 max-w-3xl mx-auto"
            >
              Practice interviews with our AI-powered platform. Get real-time feedback, improve your skills, and land your dream job.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white px-8 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-lg font-semibold"
              >
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="bg-[rgb(var(--card))] hover:bg-[rgb(var(--card-hover))] px-8 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-lg font-semibold"
              >
                Learn More
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[rgb(var(--card))] p-6 rounded-xl"
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Interviews</h3>
              <p className="text-[rgb(var(--muted))]">Practice with our advanced AI interviewer that adapts to your responses in real-time.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[rgb(var(--card))] p-6 rounded-xl"
            >
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Detailed Feedback</h3>
              <p className="text-[rgb(var(--muted))]">Get comprehensive feedback on your performance with actionable improvement suggestions.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-[rgb(var(--card))] p-6 rounded-xl"
            >
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Industry Standard</h3>
              <p className="text-[rgb(var(--muted))]">Questions and scenarios based on real interviews from top companies.</p>
            </motion.div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-4"
            >
              What Our Users Say
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[rgb(var(--muted))] text-center max-w-2xl mx-auto"
            >
              Join thousands of professionals who have improved their interview skills with our platform
            </motion.p>
          </div>

          {/* First Row */}
          <div className="mb-8 relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[rgb(var(--background))] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[rgb(var(--background))] to-transparent z-10" />
            <div className="overflow-hidden">
              <motion.div
                animate={{ 
                  x: [0, -50 * duplicatedTestimonials.length],
                }}
                transition={{
                  x: {
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop"
                  }
                }}
                className="flex gap-6 w-fit"
              >
                {duplicatedTestimonials.map((testimonial, index) => (
                  <div
                    key={`${testimonial.id}-${index}`}
                    className="w-[350px] flex-shrink-0 bg-[rgb(var(--card))] p-6 rounded-xl"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-[rgb(var(--muted))]">{testimonial.role} at {testimonial.company}</p>
                      </div>
                    </div>
                    <p className="text-[rgb(var(--text))] mb-4">{testimonial.content}</p>
                    <div className="flex gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Second Row */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[rgb(var(--background))] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[rgb(var(--background))] to-transparent z-10" />
            <div className="overflow-hidden">
              <motion.div
                animate={{ 
                  x: [-50 * duplicatedTestimonials.length, 0],
                }}
                transition={{
                  x: {
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop"
                  }
                }}
                className="flex gap-6 w-fit"
              >
                {duplicatedTestimonials.map((testimonial, index) => (
                  <div
                    key={`${testimonial.id}-${index}`}
                    className="w-[350px] flex-shrink-0 bg-[rgb(var(--card))] p-6 rounded-xl"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-[rgb(var(--muted))]">{testimonial.role} at {testimonial.company}</p>
                      </div>
                    </div>
                    <p className="text-[rgb(var(--text))] mb-4">{testimonial.content}</p>
                    <div className="flex gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-hover))] rounded-2xl p-12 text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Ace Your Next Interview?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have already improved their interview skills with our AI-powered platform.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="bg-white text-[rgb(var(--accent))] hover:bg-white/90 px-8 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors text-lg font-semibold"
            >
              Get Started Now <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}