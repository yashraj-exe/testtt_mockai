import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, CreditCard, Info, CheckCircle, XCircle, Loader } from 'lucide-react';
import { createPortal } from 'react-dom';

const API_URL = 'https://a0f5-2401-4900-8823-15fc-35bf-4af4-e76d-7961.ngrok-free.app';

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BuyCreditsModal({ isOpen, onClose }: BuyCreditsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cashfree, setCashfree] = useState<any>(null);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const { load } = await import('@cashfreepayments/cashfree-js');
        const cashfreeInstance = await load({
          mode: 'sandbox' // Change to 'production' for live environment
        });
        setCashfree(cashfreeInstance);
      } catch (error) {
        console.error('Failed to initialize Cashfree SDK:', error);
      }
    };

    initializeSDK();
  }, []);

  const handleIncrement = () => {
    if (quantity < 100) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const pricePerCredit = 7;
  const totalPrice = pricePerCredit * quantity;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const createPaymentSession = async () => {
    try {
      const response = await fetch(`${API_URL}/payments/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ credits: quantity })
      });

      const data = await response.json();

      if (data.status === 'SUCCESS') {
        return {
          sessionId: data.data.sessionId,
          orderId: data.data.orderId
        };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const verifyPayment = async (orderId: string) => {
    try {
      const response = await fetch(`${API_URL}/payments/verify?id=${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      const data = await response.json();
      return data.status === 'SUCCESS';
    } catch (error) {
      return false;
    }
  };

  const handlePayment = async () => {
    if (!cashfree) {
      setError('Payment system is not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const sessionData = await createPaymentSession();
      
      const checkoutOptions = {
        paymentSessionId: sessionData.sessionId,
        redirectTarget: '_modal'
      };

      await cashfree.checkout(checkoutOptions);
      
      // Verify payment status
      const isSuccess = await verifyPayment(sessionData.orderId);
      setPaymentStatus(isSuccess ? 'success' : 'failed');
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const PaymentStatusModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
      onClick={() => setPaymentStatus(null)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[rgb(var(--card))] rounded-xl p-6 max-w-md w-full shadow-lg"
      >
        {paymentStatus === 'success' ? (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-[rgb(var(--muted))] mb-6">
              Your credits have been added to your account.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
            <p className="text-[rgb(var(--muted))] mb-6">
              Something went wrong with your payment. Please try again.
            </p>
          </div>
        )}
        <button
          onClick={() => {
            setPaymentStatus(null);
            if (paymentStatus === 'success') {
              onClose();
            }
          }}
          className="w-full bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white py-3 rounded-lg transition-colors"
        >
          {paymentStatus === 'success' ? 'Done' : 'Try Again'}
        </button>
      </motion.div>
    </motion.div>
  );

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
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
                  <h2 className="text-2xl font-bold">Buy Credits</h2>
                  <p className="text-[rgb(var(--muted))] text-sm">Power up your interview practice</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[rgb(var(--card-hover))] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                  {error}
                </div>
              )}

              {/* Credit Package */}
              <div className="bg-[rgb(var(--card-hover))] rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-2xl font-bold">{formatPrice(pricePerCredit)}</div>
                    <div className="text-sm text-[rgb(var(--muted))]">per credit</div>
                  </div>
                  <div className="relative group">
                    <Info className="w-4 h-4 text-[rgb(var(--muted))]" />
                    <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg text-xs text-[rgb(var(--muted))] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      Each credit allows you to take one interview session
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 bg-[rgb(var(--card))] p-2 rounded-lg">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1 || isProcessing}
                    className={`p-2 rounded-lg ${
                      quantity <= 1
                        ? 'bg-[rgb(var(--card-hover))] text-[rgb(var(--muted))] cursor-not-allowed'
                        : 'bg-[rgb(var(--card-hover))] hover:bg-[rgb(var(--border))]'
                    } transition-colors`}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= 100 || isProcessing}
                    className="p-2 rounded-lg bg-[rgb(var(--card-hover))] hover:bg-[rgb(var(--border))] transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-[rgb(var(--card-hover))] rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[rgb(var(--muted))]">Credits</span>
                  <span>{quantity}</span>
                </div>
                <div className="border-t border-[rgb(var(--border))] my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <div className="text-right">
                    <div className="text-xl font-bold">{formatPrice(totalPrice)}</div>
                  </div>
                </div>
              </div>

              {/* Purchase Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-[rgb(var(--accent))] hover:bg-[rgb(var(--accent-hover))] text-white py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Purchase Credits
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {paymentStatus && <PaymentStatusModal />}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}