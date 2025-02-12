import { useState, React } from "react";
//images
import avatar from '../assets/avatar.png'
import Logo from '../assets/logo/logo.png'

//icons
import {Phone} from 'react-feather'


export default function Signup() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [activeTab, setActiveTab] = useState('signup'); // 'signup' or 'signin'

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            height: '100vh',
            width: '100%'
        }}>
            <div className="left-block" style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#AFAFAF',
                width: '45%'  // Add explicit width
            }}>
                <img src={avatar} alt="avatar" width={'80%'}/>
            </div>
            <div className="right-block" style={{
                width: '55%',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflowY: 'auto'  // Add scroll if content overflows
            }}>
                <img src={Logo} alt="logo" style={{width: '40%', marginBottom: '60px'}}/>
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
                        onChange={(e) => setPhoneNumber(e.target.value)}
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

                <button style={{
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
                }}>Continue</button>

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

                <button style={{
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
                    cursor: 'pointer'
                }}>
                    <img src="https://www.google.com/favicon.ico" alt="Google" style={{width: '20px'}}/>
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}

