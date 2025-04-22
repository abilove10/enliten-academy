import React , {useState,useEffect} from 'react';
import Sidebar from './Sidebar';
import { useSidebar } from '../context/SidebarContext';
import { Explore as ExploreIcon } from '@mui/icons-material';
import BookCover from '../assets/cover';
import './explore.css'
export default function Explore() {
    const { isSidebarOpen } = useSidebar();
    const [contentWidth, setContentWidth] = useState('100%');
      // Update contentWidth based on sidebar state
      useEffect(() => {
        const updateContentWidth = () => {
          const sidebarWidth = 300; // Width of sidebar
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
      <div style={{ 
        backgroundColor: "rgb(252, 246, 255)",
        height: "100vh" ,
        width: contentWidth,
        marginLeft: isSidebarOpen && window.innerWidth > 768 ? '300px' : '0',
        padding: '30px',
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginLeft:'20px'}}>
            <h1>Explore</h1>
             <ExploreIcon style={{color:'rgb(138, 43, 226)',fontSize:'30px'}}/>

          </div>

          <div className='main-container'>
            <h4 style={{marginLeft:'20px',marginTop:'10px'}}>E-BOOKS (Reading page and Audio Book)</h4>
            <div className="cat">
              <div className="container">
                <img src={BookCover.English} alt="" className='cover'/>
                <p>General English</p>
              </div>
              <div className="container">
                <img src={BookCover.Tamil} alt="" className='cover'/>
                <p>General Tamil</p>

              </div>
              <div className="container">
                <img src={BookCover.Science} alt="" className='cover'/>
                <p>General Science</p>

              </div>
              <div className="container">
                <img src={BookCover.Geography} alt="" className='cover'/>
                <p>Indian Geography</p>

              </div>
              <div className="container">
                <img src={BookCover.History} alt="" className='cover'/>
                <p>Indian History</p>

              </div>
              <div className="container">
                <img src={BookCover.Polity} alt="" className='cover'/>
                <p>Indian Polity</p>

              </div>
              <div className="container">
                <img src={BookCover.Economy} alt="" className='cover'/>
                <p>Indian Economy</p>

              </div>
              <div className="container">
                <img src={BookCover.H2} alt="" className='cover'/>
                <p>History of TamilNadu</p>

              </div>
              <div className="container">
                <img src={BookCover.Aptitude} alt="" className='cover'/>
                <p>Aptitude and Mental Ability</p>

              </div>
            </div>
          </div>
      </div>
    </>
  );
}
