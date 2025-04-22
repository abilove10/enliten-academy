import React ,{useEffect,useState} from 'react';
import { api } from '../utils/api';
import {Link, useNavigate } from 'react-router-dom';
export default function Chats({setShowChats}) {
    const navigate = useNavigate();
    const [Conversations,setConversations]=useState(null);
    const [loading,setLoading]=useState(true);
        useEffect(() => {
            async function loadConversations() {
                setLoading(true);
                try {
                    const temp = await api.getConversations();
                    console.log(temp)
                    setConversations(temp);
                } catch (error) {
                    console.error("Failed to load conversations:", error);
                } finally {
                    setLoading(false);
                }
            }
            loadConversations();
        }, []);

    if (loading) {
        return (
            <>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    backgroundColor: 'white' ,
                    width:'100%'
                }}>Loading your chats...
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
    
    function formatDate(iso){

        const date = new Date(iso); // Parse ISO string into a Date object
    
        // Format to "Month Day, Year" (e.g., "April 21, 2025")
        const formattedDate = date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric' 
        });
        return formattedDate;
    }
    return (
        <>
            <div style={{marginTop:'15vh',transitionDuration:'0s',display:'flex',flexDirection:'column',alignItems:'center',width:'100%'}}>
                <h1 style={{marginBottom:'50px'}}>Your chat history</h1>
                <div style={{overflowY:"scroll",height:'75vh',display:'flex',flexDirection:'column',alignItems:'center',width:'100%'}}>
                    {Conversations && Conversations.map((chats,index)=>(
                        <div onClick={()=>{
                            setShowChats(false);
                        }} key={index} style={{border:'1px solid rgba(138, 43, 226,0.1)',borderRadius:'15px',padding:'10px',marginBottom:'10px',paddingTop:'0px',width:'70%',boxShadow: "rgba(138, 43, 226,0.05) 0px 0px 14px",paddingLeft:"20PX"}}>
                            <Link to={`/chat/${chats.id}`} key={chats.id} style={{textDecoration:'none'}}>
                        <h3>{chats.title}</h3>
                        <p style={{color:'grey'}}>Last message on {formatDate(chats.updated_at)}</p>
                                </Link>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
}
