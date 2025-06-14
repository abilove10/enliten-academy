import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Settings, BookOpen, MessageSquare, Globe, HelpCircle, LogOut, Menu, X, Bell } from 'react-feather';
import { config } from '../utils/config';
import Logo from '../assets/logo/logo.png';
import { useSidebar } from '../context/SidebarContext';
import defaultAvatar from '../assets/images/default-avatar.png'; // Make sure to add this image
import { api } from '../utils/api';
import './Sidebar.css';

const API_URL = config.API_URL;

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
    const [isScrolled, setIsScrolled] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState(defaultAvatar);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    
    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = async () => {
        try {
            await api.logout();
            localStorage.removeItem('token');
            window.location.href = '/';
            // navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('token');
            navigate('/', { replace: true });
        }
    };

    const menuItems = [
        { title: 'Dashboard', icon: <Home size={20} />, path: '/dashboard' },
        { title: 'AI consultant', icon: <MessageSquare size={20} />, path: '/ai-consultant' },
        { title: 'News', icon: <Globe size={20} />, path: '/news' },
        { title: 'Explore', icon: <BookOpen size={20} />, path: '/explore' },
        { title: 'Quiz', icon: <HelpCircle size={20} />, path: '/quiz' },
        { title: 'Features', icon: <Settings size={20} />, path: '/features' },
        { title: 'About', icon: <HelpCircle size={20} />, path: '/about' },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        // Call handleScroll once to set initial state
        handleScroll();

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Memoize the fetch function
    const fetchUserProfile = useCallback(async () => {
        try {
            // Only fetch if we don't have user data and are in loading state
            if (!isLoading) return;

            const userData = await api.fetchUserData();
            // console.log('Fetched user data:', userData);

            setUserProfile({
                name: userData.name || 'Student',
                email: userData.email || '',
                photoURL: userData.photo_url
            });
            setProfilePhoto(userData.photo_url);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setUserProfile({
                name: 'Student',
                email: '',
                photoURL: defaultAvatar
            });
        } finally {
            setIsLoading(false);
        }
    }, [isLoading]); // Only depend on isLoading state

    // Use the memoized fetch function once
    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    // Memoize notifications fetch
    const fetchNotifications = useCallback(async () => {
        // try {
        //     const response = await api.fetchData('/api/notifications');
        //     setNotifications(response);
        // } catch (error) {
        //     if (error.status === 429) {
        //         console.log('Rate limited, will retry later');
        //         return;
        //     }
        //     console.error('Error fetching notifications:', error);
        // }
        return '';
    }, []);

    // Notifications polling with rate limit consideration
    useEffect(() => {
        fetchNotifications();
        // Poll less frequently - every 60 seconds instead of 30
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showNotifications && !event.target.closest('.notifications-container')) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    useEffect(() => {
        fetchSubscriptionStatus();
    }, []);

    const fetchSubscriptionStatus = async () => {
        try {
            const status = await api.fetchSubscriptionStatus();
            // console.log("Subscription status:", status); // Debug log
            setSubscriptionStatus(status);
        } catch (err) {
            console.error('Error fetching subscription status:', err);
        }
    };

    const getSubscriptionBadge = () => {
        if (!subscriptionStatus) return null;

        const isActive = subscriptionStatus.status === 'active';
        const endDate = subscriptionStatus.end_date ? new Date(subscriptionStatus.end_date) : null;
        const daysLeft = endDate ? Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;

        return (
            <div 
                className={`subscription-badge1 ${isActive ? 'premium1' : 'free1'}`}
                onClick={() => navigate('/subscription')}
            >
                <div className="badge-content1">
                    <div className={`subscription-status1 ${isActive ? 'active' : 'inactive'}`}>
                        <div className="status-dot"></div>
                        <span>{isActive ? 'Premium' : ''}</span>
                    </div>
                    <div className="subscription-info">
                        {isActive ? (
                            <span>{daysLeft} days left</span>
                        ) : (
                            <span className="upgrade-text">Upgrade now</span>
                        )}
                    </div>
                </div>
                {/* <div className="badge-icon">
                    {isActive ? '👑' : '⭐'}
                </div> */}
            </div>
        );
    };

    // Add this effect to refresh subscription status periodically
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const status = await api.fetchSubscriptionStatus();
                setSubscriptionStatus(status);
            } catch (err) {
                console.error('Error fetching subscription status:', err);
            }
        };

        // Check immediately and then every 30 seconds
        checkStatus();
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const ProfileSection = () => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '15px',
            borderBottom: '1px solid #eee',
            marginBottom: '20px'
        }}>
            <img
            referrerpolicy="no-referrer"
                src={profilePhoto}
                alt="Profile"
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    marginRight: '12px',
                    objectFit: 'cover'
                }}
                // onError={(e) => {
                //     // Prevent infinite loop by checking if already using default avatar
                //     if (e.target.src !== defaultAvatar) {
                //         console.log('Image load error, falling back to default avatar');
                //         e.target.src = defaultAvatar;
                //     }
                // }}
            />
            <div style={{ flex: 1 }}>
                <h3 style={{ 
                    margin: 0, 
                    fontSize: '16px',
                    fontWeight: '600'
                }}>
                    {userProfile?.name || 'Student'}
                </h3>
                <p style={{ 
                    margin: 0,
                    fontSize: '12px',
                    color: '#666'
                }}>
                    {userProfile?.email || ''}
                </p>
            </div>
            <div style={{ position: 'relative' }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowNotifications(!showNotifications);
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '8px',
                        cursor: 'pointer',
                        position: 'relative'
                    }}
                >
                    <Bell size={20} color="#666" />
                    {notifications.length > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            background: '#ff4444',
                            color: 'white',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {notifications.length}
                        </span>
                    )}
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: '0',
                        width: '280px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}>
                        {notifications.length > 0 ? (
                            notifications.map((notification, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '12px',
                                        borderBottom: '1px solid #eee',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: '14px' }}>{notification.message}</p>
                                    <small style={{ color: '#666' }}>{notification.time}</small>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                No notifications
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    const isMobile = () => { 
        return /Mobi|Android/i.test(navigator.userAgent); 
      }; 
       
      // Usage in a React component 
        const mobile = isMobile(); 
    return (
        <>
            {/* Overlay */}
            {isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 998,
                        transition: 'opacity 0.3s ease',
                        opacity: isSidebarOpen ? mobile ? 1 : 0 : 0,
                        pointerEvents: isSidebarOpen ? mobile?'auto':"none" : 'none',
                    }}
                />
            )}

            {/* Menu Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    zIndex: 100,
                    padding: '8px 12px',
                    paddingRight:"30px",
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isScrolled ? '#fff' : (isSidebarOpen ? 'transparent' : '#8A2BE2'),
                    color: isScrolled ? '#000' : (isSidebarOpen ? '#000' : '#fff'),
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isScrolled ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.3s ease'
                }}
            >
                <div style={{ 
                    position: 'relative', 
                    width: '24px', 
                    height: '24px'
                }}>
                    <span style={{
                        position: 'absolute',
                        width: '24px',
                        height: '2px',
                        backgroundColor: isScrolled ? '#000' : (isSidebarOpen ? '#000' : '#fff'),
                        transition: 'all 0.3s ease',
                        top: isSidebarOpen ? '11px' : '5px',
                        transform: isSidebarOpen ? 'rotate(45deg)' : 'none'
                    }} />
                    <span style={{
                        position: 'absolute',
                        width: '24px',
                        height: '2px',
                        backgroundColor: isScrolled ? '#000' : (isSidebarOpen ? '#000' : '#fff'),
                        transition: 'all 0.3s ease',
                        top: '11px',
                        opacity: isSidebarOpen ? 0 : 1
                    }} />
                    <span style={{
                        position: 'absolute',
                        width: '24px',
                        height: '2px',
                        backgroundColor: isScrolled ? '#000' : (isSidebarOpen ? '#000' : '#fff'),
                        transition: 'all 0.3s ease',
                        top: isSidebarOpen ? '11px' : '17px',
                        transform: isSidebarOpen ? 'rotate(-45deg)' : 'none'
                    }} />
                </div>
                {/* {!isSidebarOpen && (
                    <span style={{ 
                        backgroundColor: '#8A2BE2', 
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '20px',
                        whiteSpace: 'nowrap',
                        fontSize: '14px'
                    }}>
                        Get Yearly subscription @ ₹1 per day
                    </span>
                )} */}
            </button>

            {/* Sidebar */}
            <div style={{
                width: '85%',
                maxWidth: '300px',
                height: '100%',
                backgroundColor: 'white',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: isSidebarOpen ? 0 : '-100%',
                top: 0,
                bottom: 0,
                transition: 'all 0.3s ease',
                boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                zIndex: 999,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                willChange: 'transform'
            }}>
                <div style={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'white',
                    zIndex: 2
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <img 
                            src={Logo} 
                            alt="Enliten Academy" 
                            style={{ width: '150px' }} 
                        />
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            style={{
                                padding: '8px',
                                borderRadius: '50%',
                                border: 'none',
                                backgroundColor: '#f5f5f5',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <ProfileSection />
                    
                    {/* Add Subscription Badge here */}
                    {getSubscriptionBadge()}
                </div>
                
                <div style={{ flex: 1 }}>
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 15px',
                                marginBottom: '5px',
                                textDecoration: 'none',
                                color: isActive(item.path) ? '#8A2BE2' : '#666',
                                backgroundColor: isActive(item.path) ? '#f8f0ff' : 'transparent',
                                borderRadius: '10px',
                                fontSize: '14px'
                            }}
                        >
                            <span style={{ marginRight: '10px' }}>{item.icon}</span>
                            {item.title}
                        </Link>
                    ))}
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <p style={{ color: '#666', fontSize: '12px', marginBottom: '10px' }}>SETTINGS</p>
                    <Link
                        to="/settings"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 15px',
                            textDecoration: 'none',
                            color: '#666',
                            borderRadius: '10px',
                            fontSize: '14px'
                        }}
                    >
                        <Settings size={20} style={{ marginRight: '10px' }} />
                        Setting
                    </Link>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 15px',
                            width: '100%',
                            border: 'none',
                            background: 'none',
                            color: '#ff4444',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        <LogOut size={20} style={{ marginRight: '10px' }} />
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
} 