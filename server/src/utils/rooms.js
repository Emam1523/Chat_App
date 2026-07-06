const rooms = {};

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms[code]);
  return code;
}

function createRoom(name, createdBy) {
  const code = generateRoomCode();
  rooms[code] = {
    name,
    code,
    createdBy,
    createdAt: new Date().toISOString(),
  };
  return rooms[code];
}

function getRoom(code) {
  return rooms[code] || null;
}

function roomExists(code) {
  return !!rooms[code];
}

function getUserRooms(userRoomCodes) {
  return userRoomCodes
    .filter(code => rooms[code])
    .map(code => ({
      code: rooms[code].code,
      name: rooms[code].name,
      createdBy: rooms[code].createdBy,
    }));
}

module.exports = { createRoom, getRoom, roomExists, getUserRooms };
