import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GoogleCallback() {
    const [showManualClose, setShowManualClose] = useState(false);
    const [processingComplete, setProcessingComplete] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const code = params.get('code');
                const error = params.get('error');
                
                if (error) {
                    console.error('Google OAuth error:', error);
                    window.opener?.postMessage({
                        type: 'GOOGLE_SIGN_IN_ERROR',
                        error: error
                    }, window.location.origin);
                    setProcessingComplete(true);
                    return;
                }
                
                if (code) {
                    alert("success 3");
                    // Send message to parent window
                    window.opener?.postMessage({
                        type: 'GOOGLE_SIGN_IN_SUCCESS',
                        code
                    }, window.location.origin);
                    setProcessingComplete(true);

                    // Wait a moment before redirecting
                    setTimeout(() => {
                        // Try different navigation methods
                        try {
                            // Try to close if it's a popup
                            if (window.opener) {
                                window.close();
                            } else {
                                // If not a popup, navigate
                                navigate('/dashboard', { replace: true });
                            }
                        } catch (e) {
                            console.log('Navigation error:', e);
                            // Force reload to dashboard as last resort
                            window.location.replace('/dashboard');
                        }
                    }, 1500);
                } else {
                    console.error('No authorization code received');
                    window.opener?.postMessage({
                        type: 'GOOGLE_SIGN_IN_ERROR',
                        error: 'No authorization code received'
                    }, window.location.origin);
                    setProcessingComplete(true);
                }
            } catch (err) {
                console.error('Callback error:', err);
                setProcessingComplete(true);
            }
        };

        handleCallback();

        // Show manual close button after 2 seconds
        const timer = setTimeout(() => {
            setShowManualClose(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigate]);

    const handleManualClose = () => {
        try {
            // Try to navigate using React Router first
            navigate('/dashboard', { replace: true });
        } catch (err) {
            // Fallback to window.location
            window.location.replace('/dashboard');
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#fff'
        }}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <h2 style={{ marginBottom: '15px' }}>
                    {processingComplete ? 'Sign In Complete!' : 'Processing Sign In...'}
                </h2>
                <p style={{ marginBottom: '20px', color: '#666' }}>
                    {processingComplete 
                        ? 'Redirecting to dashboard...' 
                        : 'Please wait while we complete your sign in.'}
                </p>
                
                {(showManualClose || processingComplete) && (
                    <button
                        onClick={handleManualClose}
                        style={{
                            marginTop: '20px',
                            padding: '12px 24px',
                            backgroundColor: '#8A2BE2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        Go to Dashboard
                    </button>
                )}
            </div>
        </div>
    );
} 