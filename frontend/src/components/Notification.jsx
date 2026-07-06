import React, { memo } from 'react';

// Memoize because notifications never change once they are rendered
const Notification = memo(({ msg }) => {
  return (
    <div className="notification-row">
      <div className="notification-pill">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="notif-icon">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <span>{msg}</span>
      </div>
    </div>
  );
});

export default Notification;