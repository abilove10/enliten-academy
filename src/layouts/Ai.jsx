import 'regenerator-runtime/runtime';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { api } from '../utils/api';
import 'ldrs/hourglass'

//Assets
import user from '../assets/user.png';
import downArrow from '../assets/icons/shape.png';
import notification_ico from '../assets/icons/notification.png';
import bot from '../assets/bot.png';

//Images
import option1 from "../assets/stock/options1.png"
import option2 from "../assets/stock/options2.png"
import option3 from "../assets/stock/options3.png"
import not_found from "../assets/not_found.png"
import ai from "../assets/images/ai.png"
//Icons
import { Mic,Slack,Coffee } from 'react-feather';
import { Check, X, ChevronDown, ChevronUp } from 'react-feather';

import send from "../assets/icons/send.png"
import a1 from "../assets/icons/ai/a1.png"
import a2 from "../assets/icons/ai/a2.png"
import i1 from "../assets/icons/ai/i1.png"
import i2 from "../assets/icons/ai/i2.png"
import i3 from "../assets/icons/ai/i3.png"
import i4 from "../assets/icons/ai/i4.png"
import i5 from "../assets/icons/ai/i5.png"
import i6 from "../assets/icons/ai/i6.png"
import a3 from "../assets/icons/ai/a3.png"
import a4 from "../assets/icons/ai/a4.png"
import a5 from "../assets/icons/ai/a5.png"
import a6 from "../assets/icons/ai/a6.png"
import quiz from "../assets/icons/ai/quiz.png"
//Style
import './Ai.css'

// Import Sidebar and useSidebar
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../context/SidebarContext';

// Add MCQQuiz import at the top
import MCQQuiz from '../components/MCQQuiz';
import HeuristicThink from '../components/HeuristicThink';

function Ai(props) {
    const [query, setquery] = useState([]);
    const [layout1,setlayout1]=useState("flex");
    const [layout2,setlayout2]=useState("none");
    const [layout3,setlayout3]=useState("none");
    const [chatHistory, setChatHistory] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [quizmode,setquizmode]=useState(false);
    const [heuristicmode,setheuristicmode]=useState(false);

    const [loading, setLoading] = useState(true);
    const [showHeuristic,setshowHeuristic]=useState({});
    var heuristic_index=0;
    const isMobile = () => { 
        return /Mobi|Android/i.test(navigator.userAgent); 
      }; 
       
      // Usage in a React component 
        const mobile = isMobile(); 

    // Get sidebar state
    const { isSidebarOpen } = useSidebar();
    const [contentWidth, setContentWidth] = useState('100%');

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

//Fromatting Function [START]
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
//Fromatting Function [END]

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
    

    async function auth_check(){
        // setLoading(true);
    try{
        const token = localStorage.getItem('token');
        if(!token){
            window.location.href = '/';
            return false;
        }
        const response = await api.fetchUserData();
        if(!response){
            localStorage.removeItem('token');
            window.location.href = '/';
            return false;
        }
        return true;
    }finally{
        setLoading(false);
        setTimeout(auth_check, 300000); // 5 minutes Gap
    }
    }

    useEffect(()=>{
        auth_check();
    },[]);

    useEffect(()=>{
        if(quizmode){
            setheuristicmode(false);
        }
    },[quizmode]);
    
    useEffect(()=>{
        if(heuristicmode){
            setquizmode(false);
        }
    },[heuristicmode]);
    

    async function send_query() {
        const token = localStorage.getItem('token');
        setlayout1("none");
        setlayout3("none");
        var q = document.getElementById("text_input").value;
        document.getElementById("text_input").value = "";
        setlayout2("block");

        // Add user message to chat history
        setChatHistory(prev => [...prev, { type: 'user', text: q }]);

        // axios.post("http://localhost:5000/chat",
        axios.post("https://api.enliten.org.in/chat",
            { 
                message: q,
                isQuizMode: quizmode, // Make sure this is being sent
                isHeuristicMode: heuristicmode
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
                }
                else if(response.data.type === 'heuristic' && response.data.thinking){
                    setChatHistory(prev => [...prev, { 
                        type: 'ai', 
                        thinking: response.data.thinking,
                        text: response.data.response,
                        isHeuristic: true 
                    }]);
                }
                else {
                    // Handle normal chat response
                    setChatHistory(prev => [...prev, { 
                        type: 'ai', 
                        text: response.data.response || response.data.message || "No response received",
                        label: 'normal chat' 
                    }]);
                }
                setlayout2("none");
            })
            .catch(error => {
                console.error('Error:', error);
                setlayout2("none");
                // Handle error in chat
                setChatHistory(prev => [...prev, { 
                    type: 'ai', 
                    text: "Sorry, I encountered an error. Please try again.",
                    label: 'normal chat' 
                }]);
            });
    }

    // useEffect to update contentWidth
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

    // Add this useEffect to set new heuristic entries to visible by default
    useEffect(() => {
        if (chatHistory.length > 0) {
            const lastIndex = chatHistory.length - 1;
            const lastMessage = chatHistory[lastIndex];
            
            if (lastMessage.type === 'ai' && lastMessage.isHeuristic) {
                setshowHeuristic(prev => ({
                    ...prev,
                    [lastIndex]: true // Set new heuristic messages to visible by default
                }));
            }
        }
    }, [chatHistory]);

    if (loading) {
        return (
            <>
            <Sidebar />
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                backgroundColor: 'white' ,
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
    }else{

    return (
        < div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{
                width: contentWidth,
                marginLeft: isSidebarOpen && window.innerWidth > 768 ? '300px' : '0',
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: 1,
                backgroundColor:"#FCF6FF",
                height:"100vh",
                display:"flex",
                flexDirection:"column",
                alignItems:"center"
            }}>
                {/* <div className="block1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: "75px" }}>
                    <div style={{ display: "flex", alignItems: "center", width: "220px", justifyContent: "space-around", marginTop: "15px" }}>
                        <img src={user} width={50} height={50} />
                        <p>Libo account</p>
                        <img src={downArrow} width={10} />
                        <img src={notification_ico} width={10} />
                    </div>
                </div> */}

                <div className="layout1" style={{ display: layout1 ,flexDirection:"column",alignItems:"center",marginTop:mobile?"20vh":"5%",...(mobile?{fontSize:"80%"}:{})}}>
                    <img src={ai} width={"8%"} alt="" style={{minWidth:"80px"}}/>

                    <h1 style={{ marginTop: "20px" }}>Where knowledge begins</h1>
                    <p style={{ color: "#B1ADAD" }}>Get start to explore the different topics with AI !!</p>

                    <div className="cards" style={{ display: "flex", justifyContent: "center", marginTop:mobile?"15%": "8%",...(mobile?{flexWrap:"nowrap"}:{flexWrap:"wrap"}),gap:"50px",width:"80%",overflowY:mobile?"hidden":""}}>
                        {/* <div onClick={() => { document.getElementById("text_input").value = "Give the summary of Block Chain" }} className="card1" style={{ boxShadow: "rgba(0, 0, 0, 0.08) 0px 4px 12px", padding: "20px", borderRadius: "10px" }}> */}
                        <div onClick={() => { document.getElementById("text_input").value = "Explain about uranium" }} style={{cursor:"pointer",backgroundColor:"#DBFFE5",borderRadius:"15px",padding:"20px"}}>
                            <div className="b1" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"15px"}}>
                                <img src={i1} alt="" width={18} />
                                <img src={a1} width={8} height={12} alt="" />
                            </div>
                            <p >Explain about uranium</p>
                        </div>

                        <div onClick={() => { document.getElementById("text_input").value = "Evaluate my Mains answer" }} style={{cursor:"pointer",backgroundColor:"#FFF4DB",borderRadius:"15px",padding:"20px"}}>
                            <div className="b1" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"15px"}}>
                                <img src={i2} alt="" width={18} />
                                <img src={a2} width={8} height={12} alt="" />
                            </div>
                            <p >Evaluate my Mains answer</p>
                        </div>
{!mobile?(
<>
                        <div onClick={() => { document.getElementById("text_input").value = "Summary of the News" }} style={{cursor:"pointer",backgroundColor:"#DBF9FF",borderRadius:"15px",padding:"20px"}}>
                            <div className="b1" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"15px"}}>
                                <img src={i3} alt="" width={18} />
                                <img src={a3} width={8} height={12} alt="" />
                            </div>
                            <p >Summary of the News</p>
                        </div>

                        <div onClick={() => { document.getElementById("text_input").value = "Give 5 MCQ / PYQ on Physics" }} style={{cursor:"pointer",backgroundColor:"#FFDBFA",borderRadius:"15px",padding:"20px"}}>
                            <div className="b1" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"15px"}}>
                                <img src={i4} alt="" width={18} />
                                <img src={a4} width={8} height={12} alt="" />
                            </div>
                            <p >Give 5 MCQ / PYQ on Physics</p>
                        </div>

                        <div onClick={() => { document.getElementById("text_input").value = "Give me the important Questions on Maths" }} style={{cursor:"pointer",backgroundColor:"#FFDCDB",borderRadius:"15px",padding:"20px"}}>
                            <div className="b1" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"15px"}}>
                                <img src={i5} alt="" width={18} />
                                <img src={a5} width={8} height={12} alt="" />
                            </div>
                            <p >Give me the important <br/> Questions on Maths</p>
                        </div>

                        <div onClick={() => { document.getElementById("text_input").value = "Help me to prepare for my Interview" }} style={{cursor:"pointer",backgroundColor:"#F8FFDB",borderRadius:"15px",padding:"20px"}}>
                            <div className="b1" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"15px"}}>
                                <img src={i6} alt="" width={18} />
                                <img src={a6} width={8} height={12} alt="" />
                            </div>
                            <p >Help me to prepare for <br />my Interview</p>
                        </div>
                        </>

):(<></>)}
                    </div>
                </div>


                <div style={{ justifyContent: "center", display: "flex" ,position: "absolute", bottom: "9%",width:mobile? "80%": "50%"}}>
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
                        <div onClick={()=>setheuristicmode(!heuristicmode)} style={{
                            border: heuristicmode?"2px solid #9500FF":"none",
                            backgroundColor: heuristicmode?"#E8CBFB":"#F8ECFF",
                            transition: "none",
                            cursor: "pointer",
                            borderRadius: "8px",
                            padding: "11px",
                            fontSize: "11px",
                            height: "30px",
                            position: "absolute",
                            left: "80px",
                            top: "-40px",
                            color: "#9500FF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: "3"
                        }}> <Slack size={14} style={{marginRight:"8px"}} alt="" /> <p style={{color:heuristicmode?"#9500FF":"rgb(181, 126, 220)",transition:"none"}}><b>Heuristic Thinking</b></p></div>
                        
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
                <div className="layout2" style={{  display: layout2 ,marginTop:mobile?"15vh":"10%"}}>
                    <div class="load" id="load">
                        <div class="load_bar"></div>
                        <div class="load_bar"></div>
                        <div class="load_bar" style={{ width: "98%" }}></div>
                        <div class="load_bar" style={{ width: "70%" }}></div>
                    </div>
                </div>

                <div className="layout3" style={{ 
                    display: layout3, 
                    paddingTop: mobile ? "10vh" : "50px",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div className="chatHistory" style={{
                        position: "relative",
                        zIndex: "1",
                        height: "115%",
                        overflowY: "auto",
                        paddingBottom: "40px",
                        maskImage: "linear-gradient(to bottom, black calc(100% - 40px), transparent 100%)",
                        WebkitMaskImage: "linear-gradient(to bottom, black calc(100% - 40px), transparent 100%)"
                    }}>
                        {chatHistory.map((chat, index) => {
                            return (
                                <div key={index} className={`chatBubble ${chat.type} ${isMobile() ? 'mobile' : ''}`} style={{maxWidth:isMobile()?"100%":"90%"} }>
                                    {chat.type !== 'user' && <img src={ai} style={{display:mobile?"none":"block"}} alt="" className="chatAvatar" />}
                                    
                                    {chat.type === "ai" ? (
                                        <>
                                            {chat.isQuiz ? (
                                                <div className="quiz-container" style={{
                                                    width: '100%',
                                                    padding: '0 10px'
                                                }}>
                                                    {chat.text}
                                                </div>
                                            ) : (
                                                <div style={{ marginLeft: isMobile?"0px":"10px", marginRight:isMobile?"0px": "10px", textAlign: 'left' ,fontSize:isMobile?"14px":"16px",letterSpacing:"0.02em",lineHeight:"30px",fontFamily:"Inter"}}>
                                                    
                                                    {chat.isHeuristic? 
                                                    <>
                                                    <span 
                                                        className="heuristic-button"
                                                        onClick={() => setshowHeuristic(prev => ({
                                                            ...prev,
                                                            [index]: !prev[index]
                                                        }))}
                                                    >
                                                        Heuristic Thinking
                                                        <span className={`chevron-icon ${showHeuristic[index] ? 'up' : ''}`}>
                                                            <ChevronDown size={16} />
                                                        </span>
                                                    </span>
                                                    
                                                    <div 
                                                        className="heuristic-container"
                                                        style={{ 
                                                            maxHeight: showHeuristic[index] ? '2000px' : '0',
                                                            opacity: showHeuristic[index] ? 1 : 0,
                                                            marginTop: showHeuristic[index] ? '8px' : '0',
                                                            transition: `max-height ${showHeuristic[index] ? '0.5s' : '0.3s'} ease-in-out, 
                                                                        opacity 0.3s ${showHeuristic[index] ? '0.1s' : ''} ease-in-out,
                                                                        margin 0.3s ease-in-out`,
                                                            zIndex:"-100"
                                                                    }}
                                                    >
                                                        {/* {alert(chat.thinking)} */}
                                                        <HeuristicThink response={chat.thinking} />
                                                    </div>
                                                    </>
                                                    :<></>
                                                    }
                                                    {/* {typeof chat.text === 'string' && chat.text.split('*').map((point, i) => {
                                                        if (point.trim() === '') return null;
                                                        return (
                                                            <p key={i} style={{ marginBottom: '8px' }}>
                                                                {i > 0 ? '• ' : ''}{point.trim()}
                                                            </p>
                                                        );
                                                    })} */}
                                                    {formatText(chat.text)}
                                                </div>
                                            )}
                                        </>
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
                </div>
            </div>
        </div>
    );
}
}

export default Ai;