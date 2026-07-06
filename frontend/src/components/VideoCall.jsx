import React, { useEffect, useRef, useState } from "react";
import { createAgoraClient, joinChannel, leaveChannel, getRTC } from "../services/agora";

function VideoCall({ channelName, onEndCall, isCaller }) {
  const localRef = useRef(null);
  const [remoteIds, setRemoteIds] = useState([]);
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const tracksRef = useRef({});

  useEffect(() => {
    let client;
    let mounted = true;

    async function init() {
      try {
        client = await createAgoraClient();

        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (!mounted) return;
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
          if (mediaType === "video" && user.videoTrack) {
            tracksRef.current[user.uid] = user.videoTrack;
            setRemoteIds(prev => prev.includes(user.uid) ? prev : [...prev, user.uid]);
          }
        });

        client.on("user-unpublished", (user) => {
          if (user.videoTrack && tracksRef.current[user.uid]) {
            delete tracksRef.current[user.uid];
            setRemoteIds(prev => [...prev]);
          }
        });

        client.on("user-left", (user) => {
          delete tracksRef.current[user.uid];
          if (mounted) setRemoteIds(prev => prev.filter(id => id !== user.uid));
        });

        await joinChannel(channelName);
        if (mounted && localRef.current) {
          const rtc = getRTC();
          if (rtc.localVideoTrack) rtc.localVideoTrack.play(localRef.current);
        }
      } catch (err) {
        console.error("Agora error:", err);
      }
    }

    init();
    return () => {
      mounted = false;
      tracksRef.current = {};
      if (client) client.removeAllListeners();
      leaveChannel();
    };
  }, [channelName]);

  useEffect(() => {
    remoteIds.forEach(id => {
      const track = tracksRef.current[id];
      const el = document.getElementById(`rv-${id}`);
      if (track && el && el.childNodes.length === 0) {
        track.play(el);
      }
    });
  }, [remoteIds]);

  const toggleAudio = async () => {
    const rtc = getRTC();
    if (rtc.localAudioTrack) {
      await rtc.localAudioTrack.setEnabled(!audioOn);
      setAudioOn(!audioOn);
    }
  };

  const toggleVideo = async () => {
    const rtc = getRTC();
    if (rtc.localVideoTrack) {
      await rtc.localVideoTrack.setEnabled(!videoOn);
      setVideoOn(!videoOn);
    }
  };

  return (
    <div className="video-call-overlay">
      <div className="video-header">
        <div className="header-left">
          <span className="live-indicator">REC</span>
          <span className="channel-name">Group Call</span>
        </div>
        <div className="participant-count">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          {remoteIds.length + 1}
        </div>
      </div>

      <div className="video-grid">
        {remoteIds.map(id => (
          <div key={id} className="remote-video-item">
            <div id={`rv-${id}`} className="video-player"></div>
            <div className="video-label">
              <span className="status-dot"></span>
              User {String(id).slice(0, 4)}
            </div>
          </div>
        ))}
        {remoteIds.length === 0 && (
          <div className="waiting-text">Waiting for others to join...</div>
        )}
      </div>

      <div className="local-video-container" ref={localRef}>
        {!videoOn && <div className="video-placeholder"><p>Camera off</p></div>}
      </div>

      <div className="call-controls">
        <button className={`ctrl-btn ${!audioOn ? 'off' : ''}`} onClick={toggleAudio}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            {audioOn ? (
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4 M8 23h8" />
            ) : (
              <line x1="1" y1="1" x2="23" y2="23" />
            )}
          </svg>
          <span>{audioOn ? 'Mute' : 'Unmute'}</span>
        </button>

        <button className={`ctrl-btn ${!videoOn ? 'off' : ''}`} onClick={toggleVideo}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            {videoOn ? (
              <path d="M23 7l-7 5 7 5V7z M1 5h15v14H1z" />
            ) : (
              <line x1="1" y1="1" x2="23" y2="23" />
            )}
          </svg>
          <span>{videoOn ? 'Stop' : 'Start'}</span>
        </button>

        <button className="ctrl-btn end" onClick={onEndCall}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" transform="rotate(135 12 12)" />
          </svg>
          <span>{isCaller ? 'End' : 'Leave'}</span>
        </button>
      </div>
    </div>
  );
}

export default VideoCall;
