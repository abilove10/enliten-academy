import React, { useState, useEffect } from 'react';
import { Calendar,Search } from 'react-feather';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { api } from '../utils/api';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../context/SidebarContext';
// import 'ldrs/hourglass';
import { hourglass } from 'ldrs'
hourglass.register()
import './News.css'
import axios from 'axios';
import { Mic,Slack,Coffee } from 'react-feather';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import send from "../assets/icons/send.png"
import icon from "../assets/images/ai.png"
import '../layouts/Ai.css'
import ai from "../assets/images/ai.png"
import user from '../assets/user.png';
import quiz from "../assets/icons/ai/quiz.png"
import MCQQuiz from '../components/MCQQuiz';


const News = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [Layout,setLayout]=useState(1);
  const [chatHistory, setChatHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const token = localStorage.getItem('token');
  const [query, setquery] = useState([]);
  const [layout1,setlayout1]=useState("block");
  const [layout2,setlayout2]=useState("none");
  const [layout3,setlayout3]=useState("none");
  const [quizmode,setquizmode]=useState(false);


  const getHeaders = (token = null) => {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
};
  // function newsAi(date){
  //   var query=document.getElementById('search').value;
  //   // axios.post(`http://localhost:5000/api/news/ai/${date}`,
  //   axios.post(`https://api.enliten.org.in/api/news/ai/${date}`,

  //     { 
  //         query: query
  //     },
  //     {
  //         method: 'POST',
  //         headers: getHeaders(token),
  //               credentials: 'include'
  //     })
  //     .then(response => {
  //         console.log(response.data);
  //         // setNewsData(response.data)
  //     }).catch(error => {
  //       console.error('Error:', error);
  //     })
  // }

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


const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // Add this useEffect to scroll to bottom whenever chatHistory changes
    useEffect(() => {
        const chatHistoryDiv = document.querySelector('.chatHistory');
        if (chatHistoryDiv) {
            chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
        }
    }, [chatHistory]);

    // Update input when transcript changes
    useEffect(() => {
        if (transcript) {
            document.getElementById('text_input').value = transcript;
        }
    }, [transcript]);
    const handleSpeechRecognition = () => {
      if (!browserSupportsSpeechRecognition) {
          alert('Browser does not support speech recognition.');
          return;
      }





      if (!listening) {
          setIsListening(true);
          SpeechRecognition.startListening();
      } else {
          setIsListening(false);
          SpeechRecognition.stopListening();
      }
  };




  async function send_query() {
    // var date="15042025"
    var date= selectedDate.format('DDMMYYYY');
    const token = localStorage.getItem('token');
    setlayout1("none");
    setlayout3("none");
    var q = document.getElementById("text_input").value;
    document.getElementById("text_input").value = "";
    setlayout2("block");

    // Add user message to chat history
    setChatHistory(prev => [...prev, { type: 'user', text: q }]);

    // axios.post(`http://localhost:5000/api/news/ai/${date}`,
      axios.post(`https://api.enliten.org.in/api/news/ai/${date}`,

      { 
          query: q,
          isQuizMode: quizmode, // Make sure this is being sent
      },
        {
            method: 'POST',
            headers: getHeaders(token),
            credentials: 'include'
        })
        .then(response => {
            setlayout3("flex");
            setquery(response.data);
            console.log('Response data:', response.data); // Debug log

            // Handle quiz response
            if (response.data.type === 'quiz' && response.data.questions) {
              setChatHistory(prev => [...prev, { 
                  type: 'ai', 
                  text: <MCQQuiz questions={response.data.questions} />,
                  isQuiz: true 
              }]);
          }else{

            // Handle normal chat response
            setChatHistory(prev => [...prev, { 
              type: 'ai', 
              text: response.data.data || response.data.message || "No response received",
              label: 'normal chat' 
            }]);
          }
            setlayout2("none");
        })
        .catch(error => {
            console.error('Error:', error);
            setlayout2("none");
            setlayout3("flex");
            // Handle error in chat

            if (error.response && error.response.status === 429) {
                // Handle rate limit exceeded
                setChatHistory(prev => [...prev, { 
                    type: 'ai', 
                    text: "You have reached the daily Chat limit 5 chats per day. Please upgrade your account for unlimited access.",
                    label: 'normal chat'
                }]);
            }else{

            setChatHistory(prev => [...prev, { 
                type: 'ai', 
                text: "Sorry, I encountered an error. Please try again.",
                label: 'normal chat' 
                }]);
            }
        });
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

   // Function to handle inline formatting (bold, italic, etc.)
   const formatInlineText = (text) => {
    if (!text) return '';
    
    // Find all bold text (**text**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(formatItalic(text.substring(lastIndex, match.index)));
      }
      parts.push(<strong key={`bold-${match.index}`}>{formatItalic(match[1])}</strong>);
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      parts.push(formatItalic(text.substring(lastIndex)));
    }
    
    return parts.length > 0 ? parts : text;
  };
  
    // Function to handle italic formatting (*text*)
    const formatItalic = (text) => {
      if (!text) return '';
      if (typeof text !== 'string') return text;
      
      const italicRegex = /\*(.*?)\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = italicRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        parts.push(<em key={`italic-${match.index}`}>{match[1]}</em>);
        lastIndex = match.index + match[0].length;
      }
      
      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }
      
      return parts.length > 0 ? parts : text;
    };

  const formatText = (text) => {
    if (!text) return [];
    
    // Ensure text is a string
    const textString = String(text);
    
    // Replace escaped newlines with actual newlines
    const processedText = textString.replace(/\\n/g, '\n');
    
    // Split the text into lines
    const lines = processedText.split('\n');
    const formattedLines = [];
    
    let inCodeBlock = false;
    let codeContent = '';
    let codeLanguage = '';
    
    lines.forEach((line, index) => {
      // Handle code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          formattedLines.push(
            <pre key={`code-${index}`} className="bg-gray-100 p-4 rounded my-4 overflow-x-auto font-mono text-sm">
              <div className="mb-2 text-xs text-gray-500">{codeLanguage}</div>
              <code className="whitespace-pre-wrap">{codeContent}</code>
            </pre>
          );
          codeContent = '';
          codeLanguage = '';
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          // Extract language if specified (e.g., ```python)
          codeLanguage = line.trim().slice(3);
        }
        return;
      }
      
      if (inCodeBlock) {
        codeContent += line + '\n';
        return;
      }
      
      // Format line based on markdown-like syntax
      let formattedLine;
      
      if (line.trim().startsWith('## ')) {
        // Main heading
        formattedLine = (
          <h2 key={index} className="text-2xl font-bold mt-6 mb-4 text-gray-800 border-b pb-2">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.trim().startsWith('### ')) {
        // Subheading
        formattedLine = (
          <h3 key={index} className="text-xl font-semibold mt-5 mb-3 text-gray-700">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.trim().startsWith('#### ')) {
        // Small heading
        formattedLine = (
          <h4 key={index} className="text-lg font-semibold mt-4 mb-2 text-gray-700">
            {line.replace('#### ', '')}
          </h4>
        );
      } else if (line.trim().startsWith('* ')) {
        // Bullet point
        const indentLevel = line.indexOf('* ') / 2;
        formattedLine = (
          <div key={index} className="flex mb-1" style={{ paddingLeft: `${indentLevel * 1.5}rem` }}>
            <span className="mr-2">•</span>
            <span>{formatInlineText(line.replace('* ', ''))}</span>
          </div>
        );
      } else if (line.trim().match(/^\d+\. /)) {
        // Numbered list
        const content = line.replace(/^\d+\. /, '');
        const match = line.match(/^(\d+)\. /);
        const number = match ? match[1] : '1';
        formattedLine = (
          <div key={index} className="flex mb-1">
            <span className="mr-2 font-medium">{number}.</span>
            <span>{formatInlineText(content)}</span>
          </div>
        );
      } else if (line.trim().startsWith('> ')) {
        // Blockquote
        formattedLine = (
          <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600">
            {formatInlineText(line.replace('> ', ''))}
          </blockquote>
        );
      } else if (line.trim() === '---') {
        // Horizontal rule
        formattedLine = <hr key={index} className="my-4 border-t border-gray-300" />;
      } else if (line.trim() === '') {
        // Empty line
        formattedLine = <div key={index} className="h-4"></div>;
      } else {
        // Regular paragraph
        formattedLine = (
          <p key={index} className="mb-4">
            {formatInlineText(line)}
          </p>
        );
      }
      
      formattedLines.push(formattedLine);
    });
    
    return formattedLines;
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
        <div style={{marginTop:mobile?'15%':'1%',display:'flex',justifyContent:'space-between'}} className="header bg-[#1a237e] text-white p-5 rounded-lg mb-5 text-center">
          
          <div>

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

          {/* <div style={{width:'320px',display:'flex',marginRight:'30px',backgroundColor:'white',height:'40px',justifyContent:'space-between',paddingRight:'20px',alignItems:'center',borderRadius:'8px'}}>
             <input type="text" style={{width:'80%',height:'40px',outline:'none',border:'none',paddingLeft:'20px',borderRadius:'8px'}} placeholder='Search or Ask AI to summarize !!' id='search'/>
            <Search style={{color:'#8A2BE2',fontWeight:'bolder'}} onClick={()=>{setLayout(2)}}/> 
          </div> 
          <div style={{backgroundColor:'white',borderRadius:'100%',maxHeight:'fit-content', padding:'10px'}}>
          <img src={icon} width={50}alt="" />

          </div>
          */}

        </div>

        {Layout==1?(
<>
        {newsData? (
          <>
          <div className="space-y-5" style={{backgroundColor: 'white',width: '100%',marginTop:'3vh',borderRadius:'15px',padding:'30px',paddingTop:'5px',paddingBottom:'100PX'}}>
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
                <div className="layout2" style={{  display: layout2 ,marginTop:mobile?"10vh":"5%"}}>
                    <div class="load" id="load">
                        <div class="load_bar"></div>
                        <div class="load_bar"></div>
                        <div class="load_bar" style={{ width: "98%" }}></div>
                        <div class="load_bar" style={{ width: "70%" }}></div>
                    </div>
                </div>


<div className="chatHistory" style={{display:layout3,paddingBottom: "60px",
                        maskImage: "linear-gradient(to bottom, black calc(100% - 40px), transparent 100%)",
                        WebkitMaskImage: "linear-gradient(to bottom, black calc(100% - 40px), transparent 100%)",width:'100%'}}>

{chatHistory.map((chat, index) => {
                            return (
                                <div key={index} className={`chatBubble ${chat.type}1 ${isMobile() ? 'mobile' : ''}`} style={{maxWidth:isMobile() || chat.type=='ai'?"100%":"60%"} }>
                                    {chat.type !== 'user' && <img src={ai} style={{display:mobile?"none":"block"}} alt="" className="chatAvatar" />}
                                    
                                    {chat.type === "ai" ? (
                                        <div>
                                          {chat.isQuiz ? (
                                                <div className="quiz-container" style={{
                                                    width: '100%',
                                                    padding: '0 10px'
                                                }}>
                                                    {chat.text}
                                                </div>
                                            ) :(
                                              <div>
                                              {formatText(chat.text)}
                                              </div>
                                            )
                                          }
                                        </div>
                                    ) : (
                                        // User message
                                        <p style={{ marginLeft:isMobile?"5px": "10px", marginRight: isMobile()?"5px":"10px", textAlign: 'left' }}>
                                            {chat.text}
                                        </p>
                                    )}
                                    
                                    {chat.type === 'user' && <img src={user} alt="" className="chatAvatar" />}
                                </div>
                            );
                        })}
</div>

            <div style={{display:layout1}}>
            {Object.entries(newsData.categories).map(([category, data]) =>
              // renderNewsSection(category, data.news_items)
              <>
              <div style={{display:'flex',borderBottom:'2px solid rgb(220,220,220)',paddingBottom:'10px',marginBottom:'40px',marginTop:'40px'}}><h2>{category.replace(/_/g,' ')}</h2></div>
              {data.news_items.slice(1).map((news) => {
              const content = news.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/^\* /, '').replace(/â‚¹/g,"&#8377;");
                return (
                  <div key={news.content} style={{paddingLeft:'5%',width:'90%',marginBottom:'15px'}}>
                  <li key={news.content} dangerouslySetInnerHTML={{__html: content}} style={{fontFamily:'Inter',lineHeight:'2.0'}}/>
                  </div>
                )
              })}
              </>
            )}
            </div>
          
          </div>
          <div className="space" style={{marginLeft:'-8%',backgroundImage: 'linear-gradient(to top ,rgba(252, 246, 255,1),rgba(252, 246, 255,0.95),rgba(252, 246, 255,0))',width: '100%',display:'flex',justifyContent:'center',marginTop:'10px',position:'fixed',bottom:'0px',paddingBottom:'40px',paddingTop:'120px'}}>
          <div style={{ justifyContent: "center", display: "flex" ,width:mobile? "80%": "50%"}}>
                                <div className='chatBox' style={{
                                    backgroundColor: "white",  
                                    display: "flex", 
                                    width: "100%", 
                                    alignItems: "center", 
                                    boxShadow: "rgba(0,0,0, 0.1) 0px 0px 8px", 
                                    borderRadius: "15px", 
                                    height: "60px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                      <div onClick={()=>setquizmode(!quizmode)} style={{
                                          border: quizmode?"2px solid #9500FF":"none",
                                          backgroundColor: quizmode?"#E8CBFB":"#F8ECFF",
                                          transition: "none",
                                          cursor: "pointer",
                                          borderRadius: "8px",
                                          padding: "11px",
                                          fontSize: "11px",
                                          height: "30px",
                                          position: "absolute",
                                          left: "0px",
                                          top: "-40px",
                                          color: "#9500FF",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          zIndex: "3"
                                      }}> <img src={quiz} width={14} style={{marginRight:"8px"}} alt="" /> <p style={{color:quizmode?"#9500FF":"rgb(181, 126, 220)",transition:"none"}}><b>Quiz</b></p></div>
                                    
                                    <div className={`mic-container ${listening ? 'listening' : ''}`}>
                                        <Mic
                                            color={listening ? '#B57EDC' : '#B57EDC'}
            
                                            onClick={handleSpeechRecognition}
                                        />
                                    </div>
                                    <div style={{ height: "40px", backgroundColor: "#F4F4F4", width: "2px" }}></div>
                                    <input 
                                        type="text" 
                                        placeholder='Do a smart search or Ask to summarize....' 
                                        onKeyDown={(e)=>{if(e.key==="Enter"){send_query()}}} 
                                        style={{ 
                                            width: mobile ? "48%" : "72%", 
                                            height: "60px", 
                                            border: "none", 
                                            outline: "none", 
                                            marginLeft: "30px" 
                                        }} 
                                        id='text_input' 
                                    />
                                    <div style={{ backgroundColor: "#B57EDC",width:"50px",height:"50px", borderRadius: "100%", alignItems: "center", justifyContent: "center", display: "flex",position:"absolute",right:"14px" }} onClick={() => send_query()}>
                                        <img src={send} alt="" width={22} />
                                    </div>
                                </div>
              </div>
              </div>
</>
          
        ) : (
          <div className="text-center text-gray-600 p-8 bg-white rounded-lg shadow">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-xl">No news available for this date</p>
            <p className="mt-2">Please select a different date</p>
          </div>
        )}
        </>
):<>
          <div className="space-y-5" style={{backgroundColor: 'white',width: '100%',marginTop:'3vh',borderRadius:'15px',padding:'30px',paddingTop:'5px',height:'50%',display:'flex',justifyContent:'center'}}>
            <h1>{Layout}</h1>

            <div style={{ justifyContent: "center", display: "flex" ,position: "absolute", bottom: "20px",width:mobile? "80%": "50%"}}>
                                <div className='chatBox' style={{
                                    backgroundColor: "white",  
                                    display: "flex", 
                                    width: "100%", 
                                    alignItems: "center", 
                                    boxShadow: "rgba(0,0,0, 0.1) 0px 0px 8px", 
                                    borderRadius: "15px", 
                                    height: "60px",
                                    position: "relative",
                                    zIndex: "2"
                                }}>
                                    
                                    
                                    <div className={`mic-container ${listening ? 'listening' : ''}`}>
                                        <Mic
                                            color={listening ? '#B57EDC' : '#B57EDC'}
            
                                            onClick={handleSpeechRecognition}
                                        />
                                    </div>
                                    <div style={{ height: "40px", backgroundColor: "#F4F4F4", width: "2px" }}></div>
                                    <input 
                                        type="text" 
                                        placeholder='Ask something....' 
                                        onKeyDown={(e)=>{if(e.key==="Enter"){alert()}}} 
                                        style={{ 
                                            width: mobile ? "48%" : "72%", 
                                            height: "60px", 
                                            border: "none", 
                                            outline: "none", 
                                            marginLeft: "30px" 
                                        }} 
                                        id='text_input' 
                                    />
                                    <div style={{ backgroundColor: "#B57EDC",width:"50px",height:"50px", borderRadius: "100%", alignItems: "center", justifyContent: "center", display: "flex",position:"absolute",right:"14px" }} onClick={() => send_query()}>
                                        <img src={send} alt="" width={22} />
                                    </div>
                                </div>
              </div>
          </div>

</>}
      </div>
    </div>
  );
};

export default News; 