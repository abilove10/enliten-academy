import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import './Subscription.css';

const Subscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkSubscriptionStatus();
    // Ensure Razorpay is loaded
    loadRazorpay();
  }, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const checkSubscriptionStatus = async () => {
    try {
      const status = await api.fetchSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (err) {
      console.error('Error checking subscription:', err);
    }
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.createSubscription();
      
      if (response.short_url) {
        // Store payment link ID in localStorage for verification
        localStorage.setItem('pending_payment_id', response.payment_link_id);
        
        // Open payment link in same window
        window.location.href = response.short_url;
      } else {
        throw new Error('Invalid payment link');
      }
    } catch (err) {
      console.error("Subscription error:", err);
      setError(err.message || 'Failed to initiate subscription');
      setLoading(false);
    }
  };

  // Add this to handle payment verification after redirect
  useEffect(() => {
    const verifyPayment = async () => {
      const pendingPaymentId = localStorage.getItem('pending_payment_id');
      if (pendingPaymentId) {
        try {
          const response = await api.checkPaymentStatus(pendingPaymentId);
          if (response.status === 'success') {
            await checkSubscriptionStatus();
            localStorage.removeItem('pending_payment_id');
            // Redirect to homepage on success
            localStorage.removeItem("cached_subscription_status");
            navigate('/dashboard');
          }
        } catch (err) {
          console.error("Payment verification failed:", err);
          setError('Payment verification failed. Please contact support.');
        }
      }
    };

    // Check payment status every 2 seconds until success
    const interval = setInterval(verifyPayment, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="subscription-container">
      <div className="subscription-card">
        <div className="subscription-content">
          <h1 className="subscription-title">
            Enliten Premium Subscription
          </h1>
          
          {error && (
            <div className="error-alert">
              {error}
            </div>
          )}

          <div className="pricing-card">
            <div className="pricing-header">
              <h2 className="plan-title">Yearly Plan</h2>
              <span className="price">₹365</span>
            </div>
            
            <div className="features-list">
              <div className="feature-item">
                <span className="checkmark">✓</span>
                <span>Full access to all premium content</span>
              </div>
              <div className="feature-item">
                <span className="checkmark">✓</span>
                <span>Personalized learning experience</span>
              </div>
              <div className="feature-item">
                <span className="checkmark">✓</span>
                <span>Advanced analytics and tracking</span>
              </div>
              <div className="feature-item">
                <span className="checkmark">✓</span>
                <span>Priority customer support</span>
              </div>
            </div>

            <div className="subscription-action">
              <p className="price-subtitle">
                Just ₹1 per day for unlimited access
              </p>
              <button
                className="subscribe-button"
                onClick={handleSubscribe}
                disabled={loading}
              >
                Subscribe Now
              </button>
            </div>
          </div>

          <p className="terms-text">
            By subscribing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription; 