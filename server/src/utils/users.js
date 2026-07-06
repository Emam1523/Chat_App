const users = [];

function addUser(id, username) {
  let user = users.find((u) => u.id === id);
  if (user) {
    user.username = username;
    return user;
  }
  user = { id, username, rooms: [] };
  users.push(user);
  return user;
}

function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

function addUserToRoom(id, roomCode) {
  const user = getCurrentUser(id);
  if (user && !user.rooms.includes(roomCode)) {
    user.rooms.push(roomCode);
  }
  return user;
}

function removeUserFromRoom(id, roomCode) {
  const user = getCurrentUser(id);
  if (user) {
    user.rooms = user.rooms.filter(r => r !== roomCode);
  }
  return user;
}

function getRoomUsers(roomCode) {
  return users.filter((user) => user.rooms.includes(roomCode));
}

module.exports = {
  addUser,
  getCurrentUser,
  userLeave,
  addUserToRoom,
  removeUserFromRoom,
  getRoomUsers,
};
