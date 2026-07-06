import React, { useState, memo } from 'react';

// Move formatting outside to keep the component clean
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Message = memo(({ msg, isMine }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const toggleZoom = (e) => {
    e.stopPropagation();
    if (msg.image) setIsZoomed(!isZoomed);
  };

  const preventSave = (e) => e.preventDefault();

  return (
    <>
      <div className={`msg-row ${isMine ? 'mine' : 'other'}`}>
        <div className="msg-bubble" onContextMenu={preventSave}>
          
          {/* Show author name only for messages from others */}
          {!isMine && <div className="msg-author">{msg.username}</div>}

          {/* Image Content */}
          {msg.image && (
            <div 
              className={`msg-image-wrap ${isZoomed ? 'zoomed' : ''}`} 
              onClick={toggleZoom}
              onContextMenu={preventSave}
            >
              <img 
                src={msg.image} 
                alt="Shared content" 
                draggable="false"
                className="chat-img"
              />
              {!isZoomed && <div className="msg-image-overlay"></div>}
            </div>
          )}

          {/* Text Content */}
          {msg.content && (
            <div className="msg-text">
              {msg.content}
            </div>
          )}

          {/* Footer: Time + Ticks */}
          <div className="msg-footer">
            <span className="msg-time">{formatTime(msg.timestamp)}</span>
            {isMine && (
              <span className="msg-tick-icon" title="Sent">
                <svg viewBox="0 0 16 11" width="14" height="10">
                  <path 
                    d="M1.5 5.5L5.5 9.5L14.5 1.5" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom Overlay */}
      {isZoomed && (
        <div className="image-lightbox" onClick={toggleZoom}>
          <div className="lightbox-content">
            <img src={msg.image} alt="Full size" onContextMenu={preventSave} />
            <button className="close-lightbox">Click anywhere to close</button>
          </div>
        </div>
      )}
    </>
  );
});

export default Message;