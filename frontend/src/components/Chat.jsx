import React, { useRef, useEffect, useState, useMemo } from 'react';
import Message from './Message';
import Notification from './Notification';

function Chat({ 
  room, 
  messages, 
  username, 
  onSendMessage, 
  onLeaveRoom, 
  users, 
  onStartGroupCall, 
  activeCall,
  onToggleSidebar,
  sidebarOpen
}) {
  const [text, setText] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Memoize users to avoid re-calculating on every text input change
  const otherUsersCount = useMemo(() => {
    return users.filter(u => u.username !== username).length;
  }, [users, username]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (text.trim() || previewImage) {
      onSendMessage(room.code, text.trim(), previewImage);
      setText('');
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image is too large. Please select an image under 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setPreviewImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const cancelImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="chat-panel">
      {/* Topbar */}
      <div className="chat-topbar">
        <button className="mobile-toggle-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        {sidebarOpen && <div className="sidebar-backdrop" onClick={onToggleSidebar} />}
        <div className="chat-topbar-info">
          <div className="chat-room-avatar">
            {room.name ? room.name[0].toUpperCase() : '?'}
          </div>
          <div>
            <div className="chat-room-name-wrapper">
              <span className="chat-room-name">{room.name}</span>
              {activeCall && <span className="live-badge">● LIVE</span>}
            </div>
            <div className="chat-room-meta">
              Code: <span className="code-text">{room.code}</span> &middot; {otherUsersCount} others online
            </div>
          </div>
        </div>

        <div className="chat-topbar-actions">
          <button 
            className={`topbar-btn call-btn ${activeCall ? 'active' : ''}`} 
            onClick={() => onStartGroupCall(room.code)}
            title={activeCall ? "Join active call" : "Start group call"}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            {activeCall && <span className="join-text">Join Call</span>}
          </button>
          
          <button className="topbar-btn leave-btn" onClick={() => onLeaveRoom(room.code)} title="Leave room">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Message Area */}
      <div className="chat-messages-area">
        {messages.length === 0 && (
          <div className="empty-chat">
            <p>No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg, index) => (
          msg.type === 'notification' 
            ? <Notification key={index} msg={msg.text} />
            : <Message key={index} msg={msg} isMine={msg.username === username} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview Overlay */}
      {previewImage && (
        <div className="image-preview">
          <img src={previewImage} alt="Preview" draggable="false" />
          <button className="icon-btn cancel-preview" onClick={cancelImage} title="Remove image">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="chat-input-bar">
        <button className="attach-btn" onClick={() => fileInputRef.current?.click()} title="Attach image">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </button>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageSelect}
          accept="image/*" 
          style={{ display: 'none' }} 
        />

        <input 
          type="text" 
          className="message-input" 
          placeholder="Type a message..."
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          onKeyDown={handleKeyDown}
          autoFocus 
        />

        <button 
          className="send-btn" 
          onClick={handleSend}
          disabled={!text.trim() && !previewImage}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Chat;