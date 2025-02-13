import { useState, React } from "react";
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
//images
import avatar from '../assets/avatar.png'
import Logo from '../assets/logo/logo.png'

//icons
import {Phone} from 'react-feather'

const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000'
    : 'https://api.enliten-academy.com';

export default function Signup() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [activeTab, setActiveTab] = useState('signup'); // 'signup' or 'signin'
    const [verificationCode, setVerificationCode] = useState('');
    const [showOTPInput, setShowOTPInput] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const isMobile = () => { 
        return /Mobi|Android/i.test(navigator.userAgent); 
      }; 
       
      // Usage in a React component 
        const mobile = isMobile(); 

    // Phone number validation function
    const validatePhoneNumber = (number) => {
        // Remove any non-digit characters
        const cleanNumber = number.replace(/\D/g, '');
        
        // Check if it's a valid Indian phone number
        const phoneRegex = /^(?:(?:\+|0{0,2})91(\s*[-]\s*)?|[0]?)?[6789]\d{9}$/;
        return phoneRegex.test(cleanNumber);
    };

    // Format phone number as user types
    const handlePhoneNumberChange = (e) => {
        let number = e.target.value.replace(/\D/g, '');
        
        // Format as Indian number
        if (number.length > 0) {
            if (!number.startsWith('91') && number.length === 10) {
                number = '91' + number;
            }
            if (number.length > 12) {
                number = number.slice(0, 12);
            }
        }
        
        setPhoneNumber(number);
        setError(''); // Clear any existing errors
    };

    const handlePhoneSignIn = async () => {
        try {
            setError('');
            
            // Validate phone number before proceeding
            if (!validatePhoneNumber(phoneNumber)) {
                setError('Please enter a valid Indian phone number');
                return;
            }

            setIsLoading(true);
            const formattedNumber = `+${phoneNumber}`; // Ensure proper format with country code
            
            const response = await api.requestOTP({ phoneNumber: formattedNumber });
            if (response.success) {
                setShowOTPInput(true);
            }
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    // Validate OTP input
    const handleOTPChange = (e) => {
        const otp = e.target.value.replace(/\D/g, '').slice(0, 6);
        setVerificationCode(otp);
    };

    const verifyOTP = async () => {
        try {
            if (verificationCode.length !== 6) {
                setError('Please enter a valid 6-digit OTP');
                return;
            }

            setIsLoading(true);
            setError('');
            const response = await api.verifyOTP({
                phoneNumber: `+${phoneNumber}`,
                otp: verificationCode
            });
            
            if (response.token) {
                localStorage.setItem('token', response.token);
                window.location.href = '/dashboard';
            }
        } catch (err) {
            setError(err.message || 'Failed to verify OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            setIsLoading(true);
            
            const response = await fetch(`${API_URL}/api/auth/google-signin-url`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get Google sign-in URL');
            }

            const { url } = await response.json();
            console.log("Got sign-in URL:", url);
            
            const popup = window.open(
                url, 
                'Google Sign In',
                'width=500,height=600,menubar=no,toolbar=no,location=no'
            );

            if (!popup) {
                throw new Error('Popup was blocked. Please allow popups for this site.');
            }

            let isProcessing = false; // Add flag to prevent double processing

            const messageHandler = async (event) => {
                try {
                    if (event.origin !== window.location.origin) return;
                    
                    console.log("Received message:", event.data);
                    
                    if (event.data.type === 'GOOGLE_SIGN_IN_SUCCESS' && !isProcessing) {
                        isProcessing = true; // Set flag
                        const { code } = event.data;
                        console.log("Got auth code:", code);
                        
                        try {
                            const tokenResponse = await fetch(`${API_URL}/api/auth/google-signin-callback`, {
                                method: 'POST',
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json'
                                },
                                body: JSON.stringify({ code })
                            });

                            console.log("Token response status:", tokenResponse.status);
                            
                            if (!tokenResponse.ok) {
                                const errorData = await tokenResponse.json();
                                throw new Error(errorData.error || 'Failed to exchange code for token');
                            }

                            const data = await tokenResponse.json();
                            console.log("Token response data:", data);
                            
                            if (data.token) {
                                localStorage.setItem('token', data.token);
                                window.location.href = '/dashboard';
                            } else {
                                throw new Error('No token received');
                            }
                        } catch (err) {
                            console.error('Token exchange error:', err);
                            throw err;
                        }
                    }
                    
                    if (event.data.type === 'GOOGLE_SIGN_IN_ERROR') {
                        throw new Error(event.data.error || 'Failed to sign in with Google');
                    }
                } catch (err) {
                    console.error('Google Sign-In Error:', err);
                    setError(err.message || 'Failed to complete Google sign-in');
                    window.removeEventListener('message', messageHandler);
                    popup?.close();
                }
            };

            window.addEventListener('message', messageHandler);
            
        } catch (err) {
            console.error('Google Sign-In Init Error:', err);
            setError(err.message || 'Failed to initiate Google sign-in');
        } finally {
            setIsLoading(false);
        }
    };

    const renderOTPInput = () => {
        if (!showOTPInput) return null;

        return (
            <div style={{ marginTop: '20px' }}>
                <input
                    type="text"
                    value={verificationCode}
                    onChange={handleOTPChange}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        marginBottom: '10px'
                    }}
                />
                <button
                    onClick={verifyOTP}
                    disabled={isLoading || verificationCode.length !== 6}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#8A2BE2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: verificationCode.length === 6 ? 'pointer' : 'not-allowed',
                        opacity: verificationCode.length === 6 ? 1 : 0.7
                    }}
                >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
            </div>
        );
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            height: '100vh',
            width: '100%'
        }}>
            <div className="left-block" style={{
                display:mobile ? 'none' : 'flex',
                alignItems: 'center',
                backgroundColor: '#AFAFAF',
                width: '45%',
            }}>
                <img src={avatar} alt="avatar" width={'80%'}/>
            </div>
            <div className="right-block" style={{
                width: mobile ? '100%' : '55%',
                padding: '40px',
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflowY: 'auto'  // Add scroll if content overflows
            }}>
                <img src={Logo} alt="logo" style={{width: mobile ? '80%' : '40%', marginBottom: '60px'}}/>
                <h1 style={{fontSize: '28px', marginBottom: '10px'}}>Welcome Back</h1>
                <p style={{color: '#666', marginBottom: '30px'}}>Welcome back please enter your details</p>
                
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '30px',
                    width: '100%',
                    maxWidth: '400px',
                    background: '#f5f5f5',
                    padding: '5px',
                    borderRadius: '10px'
                }}>
                    <div style={{
                        position: 'absolute',
                        width: '49%',
                        height: '85%',
                        background: 'white',
                        borderRadius: '8px',
                        transition: 'transform 0.3s ease',
                        transform: `translateX(${activeTab === 'signup' ? '0%' : '100%'})`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        top: '7.5%'
                    }}/>
                    <button 
                        onClick={() => setActiveTab('signup')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: '8px',
                            background: 'transparent',
                            cursor: 'pointer',
                            position: 'relative',
                            zIndex: 1,
                            transition: 'color 0.3s ease',
                            color: activeTab === 'signup' ? '#000' : '#666',
                            fontWeight: activeTab === 'signup' ? '600' : '400'
                        }}
                    >
                        Sign Up
                    </button>
                    <button 
                        onClick={() => setActiveTab('signin')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: '8px',
                            background: 'transparent',
                            cursor: 'pointer',
                            position: 'relative',
                            zIndex: 1,
                            transition: 'color 0.3s ease',
                            color: activeTab === 'signin' ? '#000' : '#666',
                            fontWeight: activeTab === 'signin' ? '600' : '400'
                        }}
                    >
                        Sign In
                    </button>
                </div>

                <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '15px',
                    border: '3px solid #F4F4F4',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <span style={{marginRight: '20px'}}><Phone size={20}/></span>
                    <div style={{width:'3px',height:'130%',backgroundColor:'#F4F4F4',marginRight:'10px'}}></div>
                    <input 
                        type="tel"
                        placeholder="Phone number"
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                        style={{
                            border: 'none',
                            outline: 'none',
                            width: '100%',
                            fontSize: '16px',
                            paddingLeft: '10px'
                        }}
                    />
                    {phoneNumber.length === 10 && <span style={{color: 'green'}}>✓</span>}
                </div>

                <button 
                    onClick={handlePhoneSignIn}
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '15px',
                        border: 'none',
                        borderRadius: '8px',
                        background: '#8A2BE2',
                        color: 'white',
                        fontSize: '16px',
                        cursor: 'pointer',
                        marginBottom: '20px'
                    }}
                >
                    Continue
                </button>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px',
                    color: '#666'
                }}>
                    <div style={{flex: 1, height: '1px', background: '#ddd'}}></div>
                    <span>Or continue with</span>
                    <div style={{flex: 1, height: '1px', background: '#ddd'}}></div>
                </div>

                <button 
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        marginBottom: '20px',
                        opacity: isLoading ? 0.7 : 1,
                    }}
                >
                    {isLoading ? (
                        'Signing in...'
                    ) : (
                        <>
                            <img 
                                src="https://www.google.com/favicon.ico" 
                                alt="Google" 
                                style={{width: '20px'}}
                            />
                            Sign in with Google
                        </>
                    )}
                </button>

                {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
                {renderOTPInput()}
            </div>
        </div>
    );
}

