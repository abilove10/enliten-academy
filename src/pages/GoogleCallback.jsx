import { useEffect, useState } from 'react';

export default function GoogleCallback() {
    const [showManualClose, setShowManualClose] = useState(false);
    const [processingComplete, setProcessingComplete] = useState(false);

    useEffect(() => {
        const handleCallback = () => {
            try {
                // console.log('Processing Google callback...');
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
                    // console.log('Received authorization code');
                    // Send message to parent window
                    window.opener?.postMessage({
                        type: 'GOOGLE_SIGN_IN_SUCCESS',
                        code
                    }, window.location.origin);
                    setProcessingComplete(true);
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
                window.opener?.postMessage({
                    type: 'GOOGLE_SIGN_IN_ERROR',
                    error: err.message
                }, window.location.origin);
                setProcessingComplete(true);
            }
        };

        handleCallback();

        // Show manual close button after 3 seconds
        const timer = setTimeout(() => {
            setShowManualClose(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleManualClose = () => {
        // Try to redirect back to the main app
        try {
            if (window.opener) {
                window.close();
            } else {
                // If we can't close the window, try to navigate back
                window.location.href = '/dashboard';
            }
        } catch (err) {
            // If all else fails, just redirect to home
            window.location.href = '/dashboard';
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h2>{processingComplete ? 'Sign In Complete!' : 'Processing Sign In...'}</h2>
                <p>{processingComplete 
                    ? 'You can now return to the app.' 
                    : 'Please wait while we complete your sign in.'}</p>
                
                {(showManualClose || processingComplete) && (
                    <button
                        onClick={handleManualClose}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#8A2BE2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Return to App
                    </button>
                )}
            </div>
        </div>
    );
} 