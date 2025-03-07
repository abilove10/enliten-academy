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
      
      const options = {
        key: response.key_id,
        subscription_id: response.subscription_id,
        name: "Enliten Academy",
        description: "Premium Yearly Subscription",
        image: "https://enliten.org.in/logo.png", // Replace with your actual logo URL
        currency: response.currency,
        prefill: {
          name: response.name,
          email: response.email,
          contact: response.phone
        },
        handler: async function(response) {
          try {
            console.log("Payment response:", response);
            
            const verifyResponse = await api.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResponse.status === 'success') {
              await checkSubscriptionStatus();
              navigate('/dashboard');
            } else {
              throw new Error(verifyResponse.message || 'Verification failed');
            }
          } catch (err) {
            console.error("Payment verification failed:", err);
            setError('Payment verification failed: ' + (err.message || 'Please contact support'));
            setLoading(false);
          }
        },
        notes: {
          user_id: response.user_id
        },
        theme: {
          color: "#8A2BE2"
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          },
          escape: false,
          backdropclose: false
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function(response) {
        console.error("Payment failed:", response.error);
        setError(response.error.description || 'Payment failed');
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Subscription error:", err);
      setError(err.message || 'Failed to initiate subscription');
      setLoading(false);
    }
  };

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