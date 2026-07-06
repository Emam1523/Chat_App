import React from 'react';

function Home({ onCreateRoom, onJoinRoom }) {
  return (
    <div className="home-container">
      {/* Background decorative elements */}
      <div className="home-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="home-card">
        {/* Fixed Logo Ring: Img should be a standalone element */}
        <div className="home-logo-ring">
          <div className="logo-inner">
            <img 
              src="/chatapp.png" 
              alt="Chat App Logo" 
              className="main-logo"
            />
          </div>
        </div>

        <h1 className="home-title">Chat App</h1>
        <p className="home-subtitle">Secure, real-time, room-based messaging</p>

        <div className="home-buttons">
          <button className="home-btn primary" onClick={onCreateRoom}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span>Create Room</span>
          </button>

          <button className="home-btn secondary" onClick={onJoinRoom}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            <span>Join Room</span>
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="home-features">
          <div className="feature-item">
            <span className="feature-icon">🛡️</span>
            <span>Private</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎥</span>
            <span>Video Calls</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>Fast</span>
          </div>
        </div>
      </div>
      
      <footer className="home-footer">
        Built with Agora & Socket.io
      </footer>
    </div>
  );
}

export default Home;