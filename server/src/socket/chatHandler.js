const { addUser, getCurrentUser, userLeave, addUserToRoom, removeUserFromRoom, getRoomUsers } = require("../utils/users");
const { createRoom, getRoom, roomExists, getUserRooms } = require("../utils/rooms");

const groupCalls = {};

module.exports = (io, socket) => {
  socket.on("setUsername", (username) => {
    addUser(socket.id, username);
    socket.emit("usernameSet", { username });
  });

  socket.on("createRoom", ({ username, roomName }) => {
    const user = addUser(socket.id, username);
    const room = createRoom(roomName, username);
    addUserToRoom(socket.id, room.code);
    socket.join(room.code);

    socket.emit("roomCreated", {
      code: room.code,
      name: room.name,
      createdBy: room.createdBy,
    });

    io.to(room.code).emit("roomNotification", {
      roomCode: room.code,
      text: `${username} created the room`,
    });

    io.to(room.code).emit("roomUsers", {
      roomCode: room.code,
      users: getRoomUsers(room.code),
    });
  });

  socket.on("joinRoom", ({ username, roomCode }) => {
    if (!roomExists(roomCode)) {
      socket.emit("roomError", { message: "Room not found. Check the room code." });
      return;
    }

    const user = addUser(socket.id, username);
    const room = getRoom(roomCode);
    addUserToRoom(socket.id, roomCode);
    socket.join(roomCode);

    if (groupCalls[roomCode] && groupCalls[roomCode].active) {
      socket.emit("activeGroupCall", {
        channelName: groupCalls[roomCode].channelName,
        callerName: groupCalls[roomCode].callerName,
        roomCode,
      });
    }

    socket.emit("roomJoined", {
      code: room.code,
      name: room.name,
      createdBy: room.createdBy,
    });

    io.to(roomCode).emit("roomNotification", {
      roomCode,
      text: `${username} joined the room`,
    });

    io.to(roomCode).emit("roomUsers", {
      roomCode,
      users: getRoomUsers(roomCode),
    });
  });

  socket.on("leaveRoom", ({ roomCode }) => {
    const user = getCurrentUser(socket.id);
    if (!user) return;

    if (groupCalls[roomCode] && groupCalls[roomCode].active) {
      groupCalls[roomCode].participants = groupCalls[roomCode].participants.filter(p => p !== socket.id);
      if (groupCalls[roomCode].participants.length <= 1) {
        io.to(roomCode).emit("callEnded");
        delete groupCalls[roomCode];
      }
    }

    removeUserFromRoom(socket.id, roomCode);
    socket.leave(roomCode);

    io.to(roomCode).emit("roomNotification", {
      roomCode,
      text: `${user.username} left the room`,
    });

    io.to(roomCode).emit("roomUsers", {
      roomCode,
      users: getRoomUsers(roomCode),
    });
  });

  socket.on("getMyRooms", () => {
    const user = getCurrentUser(socket.id);
    if (!user) {
      socket.emit("myRooms", []);
      return;
    }
    const rooms = getUserRooms(user.rooms);
    socket.emit("myRooms", rooms);
  });

  socket.on("sendMessage", ({ roomCode, text, image }) => {
    const user = getCurrentUser(socket.id);
    if (!user) return;
    if (!user.rooms.includes(roomCode)) return;

    const messageData = {
      username: user.username,
      text,
      image: image || null,
      timestamp: new Date().toISOString(),
      roomCode,
    };

    io.to(roomCode).emit("newMessage", messageData);
  });

  socket.on("startGroupCall", ({ roomCode }) => {
    const user = getCurrentUser(socket.id);
    if (!user) return;
    if (!user.rooms.includes(roomCode)) return;

    if (groupCalls[roomCode] && groupCalls[roomCode].active) {
      socket.emit("roomError", { message: "A call is already active in this room." });
      return;
    }

    const channelName = `groupcall-${roomCode}-${Date.now()}`;
    groupCalls[roomCode] = {
      channelName,
      caller: socket.id,
      callerName: user.username,
      participants: [socket.id],
      active: true,
    };

    socket.emit("callStarted", { channelName, roomCode });
    socket.to(roomCode).emit("incomingGroupCall", {
      callerName: user.username,
      roomCode,
      channelName,
    });
  });

  socket.on("joinGroupCall", ({ roomCode, channelName }) => {
    const user = getCurrentUser(socket.id);
    if (!user) return;
    if (!user.rooms.includes(roomCode)) return;

    if (groupCalls[roomCode] && groupCalls[roomCode].active) {
      if (!groupCalls[roomCode].participants.includes(socket.id)) {
        groupCalls[roomCode].participants.push(socket.id);
      }
      socket.emit("callJoined", { channelName, roomCode });
    }
  });

  socket.on("leaveGroupCall", ({ roomCode }) => {
    if (groupCalls[roomCode]) {
      groupCalls[roomCode].participants = groupCalls[roomCode].participants.filter(p => p !== socket.id);
      socket.emit("callDisconnected");
      if (groupCalls[roomCode].participants.length <= 1) {
        io.to(roomCode).emit("callEnded");
        delete groupCalls[roomCode];
      } else {
        socket.emit("activeGroupCall", {
          callerName: groupCalls[roomCode].callerName,
          roomCode,
          channelName: groupCalls[roomCode].channelName,
        });
      }
    }
  });

  socket.on("endGroupCall", ({ roomCode }) => {
    if (groupCalls[roomCode]) {
      if (groupCalls[roomCode].caller === socket.id) {
        io.to(roomCode).emit("callEnded");
        delete groupCalls[roomCode];
      } else {
        groupCalls[roomCode].participants = groupCalls[roomCode].participants.filter(p => p !== socket.id);
        socket.emit("callDisconnected");
        if (groupCalls[roomCode].participants.length <= 1) {
          io.to(roomCode).emit("callEnded");
          delete groupCalls[roomCode];
        } else {
          socket.emit("activeGroupCall", {
            callerName: groupCalls[roomCode].callerName,
            roomCode,
            channelName: groupCalls[roomCode].channelName,
          });
        }
      }
    }
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      user.rooms.forEach(roomCode => {
        if (groupCalls[roomCode]) {
          groupCalls[roomCode].participants = groupCalls[roomCode].participants.filter(p => p !== socket.id);
          if (groupCalls[roomCode].participants.length <= 1) {
            io.to(roomCode).emit("callEnded");
            delete groupCalls[roomCode];
          }
        }

        io.to(roomCode).emit("roomNotification", {
          roomCode,
          text: `${user.username} left the room`,
        });
        io.to(roomCode).emit("roomUsers", {
          roomCode,
          users: getRoomUsers(roomCode),
        });
      });
    }
  });
};
