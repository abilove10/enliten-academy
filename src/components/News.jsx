import React, { useState, useEffect } from 'react';
import { Calendar } from 'react-feather';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { api } from '../utils/api';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../context/SidebarContext';
import 'ldrs/hourglass';

const News = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isMobile = () => { 
    return /Mobi|Android/i.test(navigator.userAgent); 
  }; 
   
  // Usage in a React component 
    const mobile = isMobile(); 

    function convertTimestamp(timestampString) {
      const date = new Date(timestampString);
    
      if (isNaN(date)) {
        return "Invalid timestamp"; // Handle invalid input
      }
    
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const milliseconds = String(date.getMilliseconds()).padStart(3, '0'); //if you want milliseconds.
    
      // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`; //add milliseconds if you want them
      //or
      // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; //if you do not want milliseconds.
      return `${hours}:${minutes}`; //if you do not want milliseconds.
      
    }

  // Get sidebar state
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

  useEffect(() => {
    fetchNews(selectedDate);
  }, [selectedDate]);

  const fetchNews = async (date) => {
    try {
      setLoading(true);
      setError(null);
      const formattedDate = date.format('DDMMYYYY');
      const response = await api.fetchNews(formattedDate);
      
      if (!response || !response.categories) {
        throw new Error('Invalid news data format');
      }
      
      setNewsData(response);
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('No news available for this date');
      setNewsData(null);
    } finally {
      setLoading(false);
    }
  };

  const normalizeCategory = (category) => {
    const categoryMap = {
      'Science_Technology': 'Science & Technology',
      'International_Relations': 'International Relations'
    };
    return categoryMap[category] || category.replace('_', ' ');
  };

  const formatContent = (content) => {
    return content
      .replace(/^\* /, '') // Remove leading asterisk
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  const renderNewsSection = (category, items) => (
    <div className="category bg-white p-5 mb-5 rounded-lg shadow-md">
      <h2 className="text-[#1a237e] text-2xl font-bold pb-3 mb-4 border-b-2 border-[#1a237e]">
        {normalizeCategory(category)}
      </h2>
      <div className="news-items space-y-4">
        {items.map((item, index) => (
          !item.content.startsWith("Here's") && (
            <div key={index} className="news-item relative pl-5">
              <div 
                className="content"
                dangerouslySetInnerHTML={{
                  __html: formatContent(item.content)
                }}
              />
              <div className="timestamp text-gray-600 text-sm mt-1">
                {item.date}
              </div>
            </div>
          )
        ))}
      </div>
      <div className="total-items text-gray-600 italic text-right mt-3">
        Total items: {items.length}
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Sidebar />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: 'white',
          paddingLeft: '300px'
        }}>
          Initializing...
          <l-hourglass
            size="40"
            bg-opacity="0.1"
            speed="1.75"
            color="rgb(181,126,220)" 
          ></l-hourglass>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
      <Sidebar />
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        padding: '20px',
        backgroundColor: 'white',
        paddingLeft: '400px',
        width: '100%'
      }}>
        <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>
        <button 
          onClick={() => fetchNews(selectedDate)}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: '#8A2BE2',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
      </>
    );
  }

  return (
    <div style={{ 
      display: 'flex',
      '*': {
        transitionDuration: '0s !important'
      }
    }}>
      <Sidebar />
      <div style={{
        width: contentWidth,
        marginLeft: isSidebarOpen && window.innerWidth > 768 ? '300px' : '0',
        padding: '30px',
        backgroundColor: 'rgb(252, 246, 255)',
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh'
      }}>
        <div style={{marginTop:mobile?'15%':'1%'}} className="header bg-[#1a237e] text-white p-5 rounded-lg mb-5 text-center">
          <h2 className="text-3xl font-bold" >Tamil Nadu Current Affairs - Enliten Academy</h2>
          <div className="mt-2 flex items-center justify-center" style={{display: 'flex',alignItems: 'center',alignmentBaseline:'central',position:'relative',left:'0px',marginTop:'10px'}}>
            <p className="mr-2" style={{marginRight:'10px'}}>Last Updated {convertTimestamp(newsData.timestamp)}</p>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={selectedDate}
                onChange={(newDate) => {
                  if (newDate && newDate.isValid()) {
                    setSelectedDate(newDate);
                    fetchNews(newDate);
                  }
                }}
                maxDate={dayjs()}
                sx={{
                  backgroundColor: 'transparent',
                  borderRadius: '8px',
                  width: '150px',
                  '& .MuiInputBase-root': {
                    color: 'rgb(181, 126, 220)',
                    backgroundColor: '#E1CBF3',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: '#E1CBF3',
                    },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'rgb(181, 126, 220)',
                  },
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    placeholder: "Select Date",
                    inputProps: {
                      readOnly: true,
                    }
                  },
                  openPickerButton: {
                    color: 'inherit',
                  },
                  popper: {
                    sx: {
                      "& .MuiPickersDay-root": {
                        "&.Mui-selected": {
                          backgroundColor: 'rgb(181, 126, 220)',
                          color: 'white',
                          "&:hover": {
                            backgroundColor: 'rgb(181, 126, 220)',
                          },
                        },
                        "&:hover": {
                          backgroundColor: 'rgba(181, 126, 220, 0.1)',
                        },
                      },
                      "& .MuiPickersCalendarHeader-root": {
                        color: 'rgb(181, 126, 220)',
                      },
                      "& .MuiPickersDay-today": {
                        border: '1px solid rgb(181, 126, 220)',
                      },
                      "& .MuiIconButton-root": {
                        color: 'rgb(181, 126, 220)',
                      },
                      "& .MuiPickersPopper-paper": {
                        transform: 'none !important'
                      }
                    }
                  }
                }}
              />
            </LocalizationProvider>
          </div>
        </div>

        {newsData ? (
          <div className="space-y-5" style={{backgroundColor: 'white',width: '100%',marginTop:'3vh',borderRadius:'15px',padding:'30px',paddingTop:'5px'}}>
            {/* <div style={{display:'flex',borderBottom:'2px solid rgb(220,220,220)',paddingBottom:'10px',marginBottom:'40px'}}><h2>Politics</h2></div> */}
            {//{newsData.categories.Politics.news_items.slice(1).map((news) => {
              //const content = news.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^\* /, '').replace(/â‚¹/g,"&#8377;");
              //return (
                //<div style={{paddingLeft:'5%',width:'90%',marginBottom:'15px'}}>
                // <li key={news.content} dangerouslySetInnerHTML={{__html: content}} style={{fontFamily:'Inter',lineHeight:'2.0'}}/>
                //</div>
              //);
            //})}
            }
            

            {/* <div style={{display:'flex',borderBottom:'2px solid rgb(220,220,220)',paddingBottom:'10px',marginBottom:'40px',marginTop:'40px'}}><h2>Economy</h2></div> */}
            {//{newsData.categories.Economy.news_items.slice(1).map((news) => {
              //const content = news.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^\* /, '').replace(/â‚¹/g,"&#8377;");
              //return (
                //<div style={{paddingLeft:'5%',width:'90%',marginBottom:'15px'}}>
                //<li key={news.content} dangerouslySetInnerHTML={{__html: content}} style={{fontFamily:'Inter',lineHeight:'2.0'}}/>
                //</div>
              //);
            //})}
            }

            {Object.entries(newsData.categories).map(([category, data]) =>
              // renderNewsSection(category, data.news_items)
              <>
              <div style={{display:'flex',borderBottom:'2px solid rgb(220,220,220)',paddingBottom:'10px',marginBottom:'40px',marginTop:'40px'}}><h2>{category.replace(/_/g,' ')}</h2></div>
              {data.news_items.slice(1).map((news) => {
              const content = news.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^\* /, '').replace(/â‚¹/g,"&#8377;");
                return (
                  <div style={{paddingLeft:'5%',width:'90%',marginBottom:'15px'}}>
                  <li key={news.content} dangerouslySetInnerHTML={{__html: content}} style={{fontFamily:'Inter',lineHeight:'2.0'}}/>
                  </div>
                )
              })}
              </>
            )}

          </div>
        ) : (
          <div className="text-center text-gray-600 p-8 bg-white rounded-lg shadow">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-xl">No news available for this date</p>
            <p className="mt-2">Please select a different date</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default News; 