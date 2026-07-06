import React, { useState, useEffect, useRef } from 'react';

function CreateRoom({ username: initialUsername, onBack, onRoomCreated }) {
  const [username, setUsername] = useState(initialUsername || '');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for auto-focusing
  const usernameRef = useRef(null);
  const roomNameRef = useRef(null);

  useEffect(() => {
    // If username is already set, focus the room name input
    if (initialUsername) {
      roomNameRef.current?.focus();
    } else {
      usernameRef.current?.focus();
    }
  }, [initialUsername]);

  const handleCreate = async () => {
    const trimmedUser = username.trim();
    const trimmedRoom = roomName.trim();

    if (!trimmedUser) {
      setError('Please enter your name');
      usernameRef.current?.focus();
      return;
    }
    if (!trimmedRoom) {
      setError('Please enter a room name');
      roomNameRef.current?.focus();
      return;
    }

    setError('');
    setIsSubmitting(true);
    
    // Pass the cleaned data upward
    onRoomCreated({ 
      username: trimmedUser, 
      roomName: trimmedRoom 
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

  return (
    <div className="form-page">
      {/* Visual Background Elements */}
      <div className="form-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <div className="form-card">
        {/* Back Button */}
        <button 
          className="icon-btn back-btn" 
          onClick={onBack} 
          aria-label="Go back"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

        {/* Branding Icon */}
        <div className="form-icon-ring">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#6c63ff" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </div>

        <h2 className="form-heading">Create Room</h2>
        <p className="form-desc">Start a new secure conversation</p>

        {/* Error Feedback */}
        {error && (
          <div className="form-error" role="alert">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Input Fields */}
        <div className="form-field">
          <label htmlFor="username">Your name</label>
          <input
            id="username"
            ref={usernameRef}
            type="text"
            placeholder="e.g. Alex"
            value={username}
            maxLength={20}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="form-field">
          <label htmlFor="roomName">Room name</label>
          <input
            id="roomName"
            ref={roomNameRef}
            type="text"
            placeholder="e.g. Design Team"
            value={roomName}
            maxLength={30}
            onChange={(e) => setRoomName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Submit Button */}
        <button 
          className={`form-submit ${isSubmitting ? 'loading' : ''}`} 
          onClick={handleCreate}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Creating..."
          ) : (
            <>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              Create Room
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default CreateRoom;