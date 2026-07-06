import React, { useState, useEffect, useCallback, useRef } from "react";
import socket from "./services/socket";
import Home from "./components/Home";
import CreateRoom from "./components/CreateRoom";
import JoinRoom from "./components/JoinRoom";
import RoomList from "./components/RoomList";
import Chat from "./components/Chat";
import VideoCall from "./components/VideoCall";
import "./styles/chat.css";
import "./styles/videoCall.css";

function App() {
  const [view, setView] = useState("home");
  const [username, setUsername] = useState("");
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState({});
  const [roomUsers, setRoomUsers] = useState({});
  const [incomingGroupCall, setIncomingGroupCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [roomError, setRoomError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pendingAction = useRef(null);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on("connect", () => {});
    socket.on("disconnect", () => {});

    socket.on("usernameSet", ({ username: uname }) => {
      setUsername(uname);
      if (pendingAction.current) {
        const action = pendingAction.current;
        pendingAction.current = null;
        if (action.type === "create") {
          socket.emit("createRoom", { username: uname, roomName: action.roomName });
        } else if (action.type === "join") {
          socket.emit("joinRoom", { username: uname, roomCode: action.roomCode });
        }
      }
    });

    socket.on("roomCreated", (room) => {
      setRooms(prev => {
        if (prev.find(r => r.code === room.code)) return prev;
        return [...prev, room];
      });
      setActiveRoom(room);
      setMessages(prev => ({ ...prev, [room.code]: [] }));
      setView("chat");
    });

    socket.on("roomJoined", (room) => {
      setRooms(prev => {
        if (prev.find(r => r.code === room.code)) return prev;
        return [...prev, room];
      });
      setActiveRoom(room);
      setMessages(prev => ({ ...prev, [room.code]: [] }));
      setView("chat");
    });

    socket.on("roomError", ({ message }) => setRoomError(message));

    socket.on("newMessage", (data) => {
      setMessages(prev => {
        const roomMsgs = prev[data.roomCode] || [];
        return {
          ...prev,
          [data.roomCode]: [...roomMsgs, {
            username: data.username,
            content: data.text,
            image: data.image,
            timestamp: data.timestamp,
          }]
        };
      });
    });

    socket.on("roomNotification", ({ roomCode, text }) => {
      setMessages(prev => {
        const roomMsgs = prev[roomCode] || [];
        return { ...prev, [roomCode]: [...roomMsgs, { type: 'notification', text }] };
      });
    });

    socket.on("roomUsers", ({ roomCode, users }) => {
      setRoomUsers(prev => ({ ...prev, [roomCode]: users }));
    });

    socket.on("myRooms", (myRooms) => {
      if (myRooms.length > 0) {
        setRooms(myRooms);
        setMessages(prev => {
          const updated = { ...prev };
          myRooms.forEach(r => { if (!updated[r.code]) updated[r.code] = []; });
          return updated;
        });
      }
    });

    socket.on("incomingGroupCall", ({ callerName, roomCode, channelName }) => {
      if (!activeCall) {
        setIncomingGroupCall({ callerName, roomCode, channelName });
      }
    });

    socket.on("activeGroupCall", ({ callerName, roomCode, channelName }) => {
      if (!activeCall) {
        setIncomingGroupCall({ callerName, roomCode, channelName });
      }
    });

    socket.on("callStarted", ({ channelName, roomCode }) => {
      setActiveCall({ channelName, roomCode, isCaller: true });
      setIncomingGroupCall(null);
    });

    socket.on("callJoined", ({ channelName, roomCode }) => {
      setActiveCall({ channelName, roomCode, isCaller: false });
      setIncomingGroupCall(null);
    });

    socket.on("callDisconnected", () => {
      setActiveCall(null);
    });

    socket.on("callEnded", () => {
      setActiveCall(null);
      setIncomingGroupCall(null);
    });

    return () => { socket.off(); };
  }, []);

  const clearRoomError = useCallback(() => setRoomError(null), []);
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  const ensureConnected = useCallback(() => {
    if (!socket.connected) socket.connect();
  }, []);

  const handleCreateRoom = useCallback(({ username: uname, roomName }) => {
    ensureConnected();
    if (socket.connected) socket.emit("setUsername", uname);
    pendingAction.current = { type: "create", roomName };
  }, [ensureConnected]);

  const handleJoinRoom = useCallback(({ username: uname, roomCode }) => {
    ensureConnected();
    if (socket.connected) socket.emit("setUsername", uname);
    pendingAction.current = { type: "join", roomCode };
  }, [ensureConnected]);

  const handleSendMessage = useCallback((roomCode, text, image) => {
    socket.emit("sendMessage", { roomCode, text, image });
  }, []);

  const handleLeaveRoom = useCallback((roomCode) => {
    socket.emit("leaveRoom", { roomCode });
    setRooms(prev => {
      const filtered = prev.filter(r => r.code !== roomCode);
      setActiveRoom(prevActive => {
        if (prevActive?.code === roomCode) {
          return filtered.length > 0 ? filtered[0] : null;
        }
        return prevActive;
      });
      return filtered;
    });
  }, []);

  const handleNewRoom = useCallback(() => setView("home"), []);

  const startGroupCall = useCallback((roomCode) => {
    socket.emit("startGroupCall", { roomCode });
  }, []);

  const joinGroupCall = useCallback(() => {
    if (!incomingGroupCall) return;
    socket.emit("joinGroupCall", {
      roomCode: incomingGroupCall.roomCode,
      channelName: incomingGroupCall.channelName,
    });
  }, [incomingGroupCall]);

  const endGroupCall = useCallback(() => {
    if (activeCall) {
      if (activeCall.isCaller) {
        socket.emit("endGroupCall", { roomCode: activeCall.roomCode });
      } else {
        socket.emit("leaveGroupCall", { roomCode: activeCall.roomCode });
      }
      setActiveCall(null);
    }
  }, [activeCall]);

  if (activeCall) {
    return (
      <VideoCall
        channelName={activeCall.channelName}
        onEndCall={endGroupCall}
        isCaller={activeCall.isCaller}
      />
    );
  }

  if (view === "createRoom") {
    return (
      <CreateRoom
        username={username}
        onBack={() => { setView("home"); clearRoomError(); }}
        onRoomCreated={handleCreateRoom}
      />
    );
  }

  if (view === "joinRoom") {
    return (
      <JoinRoom
        username={username}
        onBack={() => { setView("home"); clearRoomError(); }}
        onRoomJoined={handleJoinRoom}
        serverError={roomError}
        onClearError={clearRoomError}
      />
    );
  }

  if (view === "chat" && rooms.length > 0) {
    const currentRoom = activeRoom || rooms[0];
    const roomMsg = messages[currentRoom.code] || [];
    const users = roomUsers[currentRoom.code] || [];

    return (
      <div className="app-layout">
        {incomingGroupCall && (
          <div className="incoming-call-bar">
            <div className="incoming-call-info">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span><strong>{incomingGroupCall.callerName}</strong> is calling in group call</span>
            </div>
            <div className="incoming-call-actions">
              <button className="call-action-btn ignore" onClick={() => setIncomingGroupCall(null)}>Ignore</button>
              <button className="call-action-btn join" onClick={joinGroupCall}>Join</button>
            </div>
          </div>
        )}
        <RoomList
          rooms={rooms}
          activeRoom={currentRoom}
          onSelectRoom={(room) => { setActiveRoom(room); setSidebarOpen(false); }}
          onNewRoom={handleNewRoom}
          username={username}
          sidebarOpen={sidebarOpen}
        />
        <Chat
          key={currentRoom.code}
          room={currentRoom}
          messages={roomMsg}
          username={username}
          onSendMessage={handleSendMessage}
          onLeaveRoom={handleLeaveRoom}
          users={users}
          onStartGroupCall={startGroupCall}
          activeCall={activeCall}
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
      </div>
    );
  }

  return (
    <Home
      onCreateRoom={() => setView("createRoom")}
      onJoinRoom={() => setView("joinRoom")}
    />
  );
}

export default App;
