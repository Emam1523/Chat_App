import React, { memo } from 'react';

// Sub-component for individual Room items to optimize performance
const RoomItem = memo(({ room, isActive, onSelect }) => {
  return (
    <div
      className={`room-item ${isActive ? 'active' : ''} ${room.hasActiveCall ? 'has-call' : ''}`}
      onClick={() => onSelect(room)}
    >
      <div className="room-avatar-sm">
        {room.name ? room.name[0].toUpperCase() : '#'}
        {room.hasActiveCall && <div className="live-pulse" />}
      </div>
      
      <div className="room-details">
        <div className="room-title-row">
          <span className="room-title">{room.name}</span>
          {room.hasActiveCall && <span className="live-tag">LIVE</span>}
        </div>
        <div className="room-subtitle">#{room.code}</div>
      </div>
      
      {isActive && <div className="active-indicator" />}
    </div>
  );
});

function RoomList({ rooms, activeRoom, onSelectRoom, onNewRoom, username, sidebarOpen }) {
  return (
    <div className={`sidebar${sidebarOpen ? ' open' : ''}`}>
      {/* Header: User Profile */}
      <div className="sidebar-header">
        <div className="user-badge">
          <div className="user-avatar">
            {username ? username[0].toUpperCase() : '?'}
          </div>
          <div className="user-info">
            <span className="user-name">{username || 'User'}</span>
            <span className="user-status">Online</span>
          </div>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="sidebar-label">
          <span>Rooms</span>
          <span className="count-badge">{rooms.length}</span>
        </div>

        <div className="sidebar-rooms">
          {rooms.length === 0 ? (
            <div className="sidebar-empty">
              <p>No rooms joined yet.</p>
            </div>
          ) : (
            rooms.map(room => (
              <RoomItem
                key={room.code}
                room={room}
                isActive={activeRoom?.code === room.code}
                onSelect={onSelectRoom}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer: Action Button */}
      <div className="sidebar-footer">
        <button className="new-room-btn" onClick={onNewRoom}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Join or Create
        </button>
      </div>
    </div>
  );
}

export default RoomList;