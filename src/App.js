import React, { useRef, useState, Component } from 'react';
import './App.css';
import SpeakerPhoneIcon from '@material-ui/icons/SpeakerPhone';
import SendIcon from '@material-ui/icons/Send';
import CloseIcon from '@material-ui/icons/Close';

import firebase from 'firebase/app';
import 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';


///initialize firebase from config
import { firebaseConfig } from './config';
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


const firestore = firebase.firestore();

class App extends Component {
  
  state = {
    uid: 1,
    showChatBox: false
  }

  constructor(props) {
    super(props);
  }

  onSelectUserHandler = (user) => {
    this.setState({
      uid: user
    },()=> {
      //console.log(this.state.uid)
    })
  }

  showChatBox = () => {
    const show = this.state.showChatBox
    if(!show){
      this.setState({showChatBox: !show});
    }
  }

  hideChatBox = () => {
    const show = this.state.showChatBox
    if(show){
      this.setState({showChatBox: !show});
    }
  }

  render() {
    return (
      <div className="App">
        <div id="center-text">
          <h2>ChatBox UI</h2>
          <p>Message send and scrool to bottom enabled </p>
      <p>Current user: {this.state.uid}</p>
          <button className="sign-in" onClick={() => this.onSelectUserHandler(1)}>User 1</button>
          <button className="sign-in" onClick={() => this.onSelectUserHandler(2)}>User 2</button>
        </div>
  
        <div id="body">
          <div id="chat-circle" className={`btn btn-raised ${this.state.showChatBox ? 'hidden':'show'}`} onClick={this.showChatBox}>
            <div id="chat-overlay"></div>
            <SpeakerPhoneIcon />
          </div>
          <ChatRoom uid = {this.state.uid} close = {this.hideChatBox} showChatBox = {this.state.showChatBox}/>
        </div>
      </div>
    );
  }
}

function ChatRoom(props) {
  const ref = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');


  const sendMessage = async (e) => {
    e.preventDefault();
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: props.uid
    })

    setFormValue('');
    ref.current.scrollIntoView({ behavior: 'smooth' });
  }

  const onClose = () => {
    props.close()
  }

  return (<>
    <div className={`chat-box ${props.showChatBox ? 'show':'hide'}`}>
      <div className="chat-box-header">
        ChatBot
        <span className="chat-box-toggle" onClick={onClose}><CloseIcon/></span>
      </div>
      <div className="chat-box-body">
        <div className="chat-logs">
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} uid={props.uid}/>)}
          <span ref={ref}></span>
        </div>
      </div>
      <div className="chat-input">    
        <form onSubmit={sendMessage}>
          <input type="text" id="chat-input" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Send a message..." />
          <button type="submit" className="chat-submit" id="chat-submit" disabled={!formValue}><SendIcon/></button>
        </form>   
      </div>
    </div>
  </>)
}


function ChatMessage(props) {
  const { text, uid } = props.message;
  const messageClass = uid === props.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
        <img src={'https://www.pngitem.com/pimgs/m/421-4213053_default-avatar-icon-hd-png-download.png'} />
        <p>{text}</p>
    </div>
  </>)
}

export default App;
