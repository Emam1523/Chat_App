import React, { useState, useEffect, useRef } from 'react';

function JoinRoom({ username: initialUsername, onBack, onRoomJoined, serverError, onClearError }) {
  const [username, setUsername] = useState(initialUsername || '');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for focusing
  const usernameRef = useRef(null);
  const codeRef = useRef(null);

  useEffect(() => {
    if (serverError) {
      setError(serverError);
      setIsSubmitting(false);
      onClearError();
    }
  }, [serverError, onClearError]);

  useEffect(() => {
    // Focus the appropriate field on mount
    if (initialUsername) {
      codeRef.current?.focus();
    } else {
      usernameRef.current?.focus();
    }
  }, [initialUsername]);

  const handleJoin = () => {
    const trimmedUser = username.trim();
    const trimmedCode = roomCode.trim().toUpperCase();

    if (!trimmedUser) {
      setError('Please enter your name');
      usernameRef.current?.focus();
      return;
    }
    if (!trimmedCode) {
      setError('Please enter a room code');
      codeRef.current?.focus();
      return;
    }
    if (trimmedCode.length < 3) {
      setError('Room code is too short');
      codeRef.current?.focus();
      return;
    }

    setError('');
    setIsSubmitting(true);
    onRoomJoined({ username: trimmedUser, roomCode: trimmedCode });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  return (
    <div className="form-page">
      {/* Background Shapes */}
      <div className="form-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <div className="form-card">
        {/* Back Button */}
        <button 
          className="icon-btn back-btn" 
          onClick={onBack} 
          aria-label="Go back to home"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

        {/* Branding Icon (Join/Enter icon) */}
        <div className="form-icon-ring">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#6c63ff" strokeWidth="1.5">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        </div>

        <h2 className="form-heading">Join Room</h2>
        <p className="form-desc">Enter a code to join a private chat</p>

        {/* Error Feedback */}
        {error && (
          <div className="form-error" role="alert">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Input: Username */}
        <div className="form-field">
          <label htmlFor="join-username">Your name</label>
          <input
            id="join-username"
            ref={usernameRef}
            type="text"
            placeholder="Alex Smith"
            value={username}
            maxLength={20}
            onChange={(e) => { setError(''); setUsername(e.target.value); }}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Input: Room Code */}
        <div className="form-field">
          <label htmlFor="join-code">Room code</label>
          <input
            id="join-code"
            ref={codeRef}
            type="text"
            placeholder="ABC123"
            value={roomCode}
            maxLength={10}
            className="room-code-input" // Specific class for monospace styling
            onChange={(e) => { setError(''); setRoomCode(e.target.value.toUpperCase()); }}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Submit Button */}
        <button 
          className={`form-submit ${isSubmitting ? 'loading' : ''}`} 
          onClick={handleJoin}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Joining..."
          ) : (
            <>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Join Room
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default JoinRoom;