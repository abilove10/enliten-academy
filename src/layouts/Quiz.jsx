import React, { useState,useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../context/SidebarContext';
import CollapsibleTable from "../components/CollapsibleTable";


export default function Quiz(props) {
    const [Active, setActive] = useState(1);
    const [contentWidth, setContentWidth] = useState('100%');
    const { isSidebarOpen } = useSidebar();

    const isMobile = () => { 
        return /Mobi|Android/i.test(navigator.userAgent); 
      }; 
       
      // Usage in a React component 
        const mobile = isMobile(); 
        useEffect(() => {
            const updateContentWidth = () => {
                const sidebarWidth = 300; // Width of sidebar, adjust as needed
                const windowWidth = window.innerWidth;
    
                if (windowWidth <= 768) {
                    setContentWidth('100%');
                } else {
                    setContentWidth(isSidebarOpen ? `calc(100% - ${sidebarWidth}px)` : '100%');
                }
            };
    
            updateContentWidth();
            window.addEventListener('resize', updateContentWidth);
            return () => window.removeEventListener('resize', updateContentWidth);
        }, [isSidebarOpen]);
    return (
        <>
            <Sidebar />
            <div style={{ marginLeft: isSidebarOpen && window.innerWidth > 768 ? '300px' : '0', backgroundColor: "#FCF6FF", width: contentWidth, height: '100vh', paddingTop: '100px', overflowY: "scroll" }}>
                    <h2 style={{textAlign:'center'}}>TNPSC Quiz Categories</h2>
                    <p style={{textAlign:'center',color:'#404040',marginBottom:'40px'}}>Select a category and topic to start practicing</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: mobile?'80%':'40%', display: 'flex',fontSize:mobile?'70%':'100%', justifyContent: 'space-between', marginLeft: '0%', backgroundColor: 'white', padding: '10px', borderRadius: '10px' }}>
                        {["Group 1", "Group 2", "Group 3", "Group 4"].map((group, index) => (
                            <p
                                key={index}
                                onClick={() => setActive(index + 1)}
                                style={{
                                    padding: '15px',
                                    backgroundColor: Active === index + 1 ? '#FCF6FF' : 'white',
                                    borderRadius: '10px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition:'ease-in-out 0.1s'
                                }}
                            >
                                {group}
                            </p>
                        ))}
                    </div>
                </div>

                <div style={{marginTop:'50px'}}>
                    <CollapsibleTable group={Active}/>
                </div>
            </div>
        </>
    );
}
