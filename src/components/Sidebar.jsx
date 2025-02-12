import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Settings, BookOpen, MessageSquare, Globe, HelpCircle, LogOut, Menu, X } from 'react-feather';
import { auth } from '../firebase/config';
import Logo from '../assets/logo/logo.png';
import { useSidebar } from '../context/SidebarContext';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
    const [isScrolled, setIsScrolled] = useState(false);
    
    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/signup');
        } catch (error) {
            console.error("Error signing out:", error);
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

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    zIndex: 1000,
                    padding: '8px 12px',
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
                {!isSidebarOpen && (
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
                )}
            </button>

            <div style={{
                width: '250px',
                height: '100vh',
                backgroundColor: 'white',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: isSidebarOpen ? 0 : '-250px',
                top: 0,
                transition: 'left 0.3s ease',
                boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                zIndex: 999,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch' // For smooth scrolling on iOS
            }}>
                <div style={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'white',
                    paddingBottom: '20px',
                    zIndex: 2
                }}>
                    <img 
                        src={Logo} 
                        alt="Enliten Academy" 
                        style={{ 
                            width: '150px',
                            marginBottom: '20px' 
                        }} 
                    />
                    <p style={{ 
                        color: '#666', 
                        fontSize: '12px', 
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>overview</p>
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