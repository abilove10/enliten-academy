import { useEffect } from 'react';

export default function GoogleCallback() {
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
                    window.close();
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
                    window.close();
                } else {
                    console.error('No authorization code received');
                    window.opener?.postMessage({
                        type: 'GOOGLE_SIGN_IN_ERROR',
                        error: 'No authorization code received'
                    }, window.location.origin);
                }
            } catch (err) {
                console.error('Callback error:', err);
                window.opener?.postMessage({
                    type: 'GOOGLE_SIGN_IN_ERROR',
                    error: err.message
                }, window.location.origin);
            } finally {
                // Close the popup after a short delay
                setTimeout(() => window.close(), 1000);
            }
        };

        handleCallback();
    }, []);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h2>Processing Sign In...</h2>
                <p>Please wait while we complete your sign in.</p>
            </div>
        </div>
    );
} 