import 'regenerator-runtime/runtime';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

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
import { Mic } from 'react-feather';
import send from "../assets/icons/send.png"
import a1 from "../assets/icons/ai/a1.png"
import a2 from "../assets/icons/ai/a2.png"
import i1 from "../assets/icons/ai/i1.png"
import i2 from "../assets/icons/ai/i2.png"

//Style
import './Ai.css'

// Import Sidebar and useSidebar
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../context/SidebarContext';

function Ai(props) {
    const [query, setquery] = useState([]);
    const [layout1,setlayout1]=useState("flex");
    const [layout2,setlayout2]=useState("none");
    const [layout3,setlayout3]=useState("none");
    const [chatHistory, setChatHistory] = useState([]);
    const [isListening, setIsListening] = useState(false);

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
    

    async function send_query() {
        const token = localStorage.getItem('token');
        setlayout1("none");
        setlayout3("none");
        var q=document.getElementById("text_input").value;
        document.getElementById("text_input").value="";
        setlayout2("block");

        // Add user message to chat history
        setChatHistory(prev => [...prev, { type: 'user', text: q }]);

        // axios.get('http://127.0.0.1:5000/api/query/'+q)
        // .then(response => {
        //     setlayout3("flex");
        //   setquery(response.data);

        //   // Add AI response to chat history
        //   setChatHistory(prev => [...prev, { type: 'ai', text: response.data.response ,label:response.data.label}]);
        //     setlayout2("none");
        // })
        // .catch(error => {
        //   console.error(error);
        // });

        axios.post("http://127.0.0.1:5000/chat",
            { message: q },
            {
            method: 'POST',
            headers: getHeaders(token),
            credentials: 'include'
        })
        .then(response => {
            setlayout3("flex");
          setquery(response.data);

          // Add AI response to chat history
          setChatHistory(prev => [...prev, { type: 'ai', text: response.data.response ,label:response.data.label}]);
            setlayout2("none");
        })
        .catch(error => {
          console.error(error);
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
                        <div style={{backgroundColor:"#DBFFE5",borderRadius:"15px",padding:"20px"}}>
                            <div className="b1" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"15px"}}>
                                <img src={i1} alt="" width={18} />
                                <img src={a1} width={8} height={12} alt="" />
                            </div>
                            <p >Explain about uranium</p>
                        </div>

                        <div style={{backgroundColor:"#FFF4DB",borderRadius:"15px",padding:"20px"}}>
                            <div className="b1" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"15px"}}>
                                <img src={i2} alt="" width={18} />
                                <img src={a2} width={8} height={12} alt="" />
                            </div>
                            <p >Evaluate my Mains answer</p>
                        </div>
{!mobile?(
<>
                        <div style={{backgroundColor:"#DBFFE5",borderRadius:"15px",padding:"20px"}}>
                            <div className="b1" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"15px"}}>
                                <img src={i1} alt="" width={18} />
                                <img src={a1} width={8} height={12} alt="" />
                            </div>
                            <p >Explain about uranium</p>
                        </div>

                        <div style={{backgroundColor:"#DBFFE5",borderRadius:"15px",padding:"20px"}}>
                            <div className="b1" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"15px"}}>
                                <img src={i1} alt="" width={18} />
                                <img src={a1} width={8} height={12} alt="" />
                            </div>
                            <p >Explain about uranium</p>
                        </div>

                        <div style={{backgroundColor:"#DBFFE5",borderRadius:"15px",padding:"20px"}}>
                            <div className="b1" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"15px"}}>
                                <img src={i1} alt="" width={18} />
                                <img src={a1} width={8} height={12} alt="" />
                            </div>
                            <p >Explain about uranium</p>
                        </div>

                        <div style={{backgroundColor:"#DBFFE5",borderRadius:"15px",padding:"20px"}}>
                            <div className="b1" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"15px"}}>
                                <img src={i1} alt="" width={18} />
                                <img src={a1} width={8} height={12} alt="" />
                            </div>
                            <p >Explain about uranium</p>
                        </div>
                        </>

):(<></>)}
                    </div>
                </div>


                <div style={{ justifyContent: "center", display: "flex" ,position: "absolute", bottom: "9%",width:mobile? "80%": "50%"}}>
                    <div className='chatBox' style={{backgroundColor:"white",  display: "flex", width: "100%", alignItems: "center", boxShadow: "rgba(0,0,0, 0.1) 0px 0px 8px", borderRadius: "15px", height: "60px" }}>
                        <div className={`mic-container ${listening ? 'listening' : ''}`}>
                            <Mic
                                color={listening ? '#B57EDC' : '#B57EDC'}

                                onClick={handleSpeechRecognition}
                            />
                        </div>
                        <div style={{ height: "40px", backgroundColor: "#F4F4F4", width: "2px" }}></div>
                        <input type="text" placeholder='Ask something....' style={{ width:mobile?"48%" :"72%", height: "60px", border: "none", outline: "none", marginLeft: "30px" }} id='text_input' />
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

                <div className="layout3" style={{ display: layout3 }}>
                    <div className="chatHistory">
                        {chatHistory.map((chat, index) => {
                            // Handle NaN conversion before rendering
                            if (chat.type === "ai" && chat.label !== "normal chat") {
                                chat.text = chat.text.replace(/:\s*NaN/g, ': null');
                            }

                            return (
                                <>
                                    {chat.type === "ai" ? (
                                        <>
                                            {chat.label === "normal chat" ? (<>
                                                <div key={index} className={`chatBubble ${chat.type}`}>
                                                    {chat.type !== 'user' && <img src={ai} alt="" className="chatAvatar" />}
                                                    <div style={{ marginLeft: "10px", marginRight: "10px", textAlign: 'left' }}>
                                                        {chat.text.split('*').map((point, i) => {
                                                            // Skip empty strings and first split result if it's empty
                                                            if (point.trim() === '') return null;
                                                            return (
                                                                <p key={i} style={{ marginBottom: '8px' }}>
                                                                    {i > 0 ? '• ' : ''}{point.trim()}
                                                                </p>
                                                            );
                                                        })}
                                                    </div>
                                                    {chat.type === 'user' && <img src={user} alt="" className="chatAvatar" />}
                                                </div>
                                            </>) : (
                                                <>
                                                    <div key={index} className={`chatBubble ${chat.type}`}>
                                                        {chat.type !== 'user' && <img src={ai} alt="" className="chatAvatar" />}
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'flex-start', marginTop: '20px' }}>
                                                            {/* {console.log(chat.text)} */}
                                                            {JSON.parse(chat.text).map((book) => (
                                                                <div key={book["Book Name"]} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '130px' }}>
                                                                    <img
                                                                        src={book['Image url'] ? book['Image url'] : not_found}
                                                                        style={{ width: "130px", height: "180px", borderRadius: "10px" }}
                                                                        alt={book["Book Name"]}
                                                                    />
                                                                    <p style={{
                                                                        marginTop: '8px',
                                                                        fontSize: '10px',
                                                                        textAlign: 'left',
                                                                        width: '100%'
                                                                    }}>
                                                                        {book["Book Name"]}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {chat.type === 'user' && <img src={user} alt="" className="chatAvatar" />}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div key={index} className={`chatBubble ${chat.type}`}>
                                            {chat.type !== 'user' && <img src={ai} alt="" className="chatAvatar" />}
                                            <p style={{ marginLeft: "10px", marginRight: "10px", textAlign: 'left' }}>{chat.text}</p>
                                            {chat.type === 'user' && <img src={user} alt="" className="chatAvatar" />}
                                        </div>
                                    )}
                                </>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Ai;