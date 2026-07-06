# Chat App

A real-time chat application built with React (Vite) on the frontend and Socket.IO on a Node.js server.

## Features

- Join chat with a username
- Real-time messaging using Socket.IO
- Join/leave notifications
- Leave room button for client-side disconnect and reset
- Auto-scroll to latest messages
- Messages aligned for current user vs others

## Tech Stack

- Frontend: React, Vite, socket.io-client
- Backend: Node.js, Socket.IO, Express (dependency present), Axios (dependency present)

## Project Structure

```text
Chat App/
  frontend/
    src/
      components/
      services/
      styles/
  server/
    src/
      socket/
      utils/
```

## Prerequisites

- Node.js 18+ recommended
- npm

## Installation

Install dependencies for both frontend and server.

```bash
cd frontend
npm install

cd ../server
npm install
```

## Running the Project

Open two terminals.

1. Start the Socket.IO server:

```bash
cd server
npm start
```

Server runs on: `http://localhost:5000`

2. Start the frontend (Vite dev server):

```bash
cd frontend
npm run dev
```

Frontend runs on the URL shown by Vite (typically `http://localhost:5173`).

## How It Works

- Frontend socket client connects to: `http://<current-hostname>:5000`
- On join, frontend emits `joinUser` with the username
- On send, frontend emits `chatMessage` with text
- Server broadcasts:
  - `chatMessage` (user + text)
  - `userJoined` notifications
  - `userLeft` notifications

## Socket Events

Client to server:

- `joinUser` -> payload: username
- `chatMessage` -> payload: message text

Server to clients:

- `chatMessage` -> payload: `{ user, text }`
- `userJoined` -> payload: notification string
- `userLeft` -> payload: notification string

## Special Behavior

On the server, if a user sends exactly `@`, the server disconnects other sockets in the same room.

## Available Scripts

### Frontend

- `npm run dev` - start Vite dev server
- `npm run build` - create production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

### Server

- `npm start` - run server (`node src/index.js`)

## Notes

- CORS is currently open to all origins on the Socket.IO server.
- Current implementation uses a single room named `general`.
