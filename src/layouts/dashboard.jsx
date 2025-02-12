import React, { useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, User, LogOut } from 'react-feather';
import Logo from '../assets/logo/logo.png';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is authenticated
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            } else {
                // Redirect to signup if not authenticated
                navigate('/signup');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            navigate('/signup');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '30px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '40px'
                }}>
                    <img src={Logo} alt="logo" style={{ height: '40px' }} />
                    <button
                        onClick={handleSignOut}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            border: '1px solid #ff4444',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: '#ff4444',
                            cursor: 'pointer'
                        }}
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>

                <h1 style={{ marginBottom: '30px' }}>Welcome, {user.displayName || 'User'}!</h1>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px',
                    marginBottom: '40px'
                }}>
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <User size={24} color="#8A2BE2" />
                        <div>
                            <h3 style={{ margin: '0', color: '#666' }}>Display Name</h3>
                            <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>{user.displayName || 'Not set'}</p>
                        </div>
                    </div>

                    <div style={{
                        padding: '20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <Mail size={24} color="#8A2BE2" />
                        <div>
                            <h3 style={{ margin: '0', color: '#666' }}>Email</h3>
                            <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>{user.email || 'Not set'}</p>
                        </div>
                    </div>

                    <div style={{
                        padding: '20px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <Phone size={24} color="#8A2BE2" />
                        <div>
                            <h3 style={{ margin: '0', color: '#666' }}>Phone Number</h3>
                            <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>{user.phoneNumber || 'Not set'}</p>
                        </div>
                    </div>
                </div>

                <div style={{
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '10px',
                    marginBottom: '20px'
                }}>
                    <h2 style={{ marginTop: '0' }}>Account Details</h2>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        <p style={{ margin: '5px 0' }}><strong>User ID:</strong> {user.uid}</p>
                        <p style={{ margin: '5px 0' }}><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
                        <p style={{ margin: '5px 0' }}><strong>Account Created:</strong> {user.metadata.creationTime}</p>
                        <p style={{ margin: '5px 0' }}><strong>Last Sign In:</strong> {user.metadata.lastSignInTime}</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 