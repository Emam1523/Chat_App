const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
require("dotenv").config();

const chatHandler = require("./socket/chatHandler");

const app = express();
app.use(cors());
app.use(express.json());

const frontendDist = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendDist));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
  maxHttpBufferSize: 10 * 1024 * 1024,
});

app.get("/api/agora/token", (req, res) => {
  const { channelName } = req.query;
  if (!channelName) {
    return res.status(400).json({ error: "channelName is required" });
  }

  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  const useToken = process.env.AGORA_USE_TOKEN === "true";

  if (!useToken || !appCertificate) {
    return res.json({ appId, token: null, uid: 0 });
  }

  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    0,
    RtcRole.PUBLISHER,
    privilegeExpiredTs
  );

  return res.json({ appId, token, uid: 0 });
});

app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) return next();
  res.sendFile(path.join(frontendDist, "index.html"));
});

io.on("connection", (socket) => {
  chatHandler(io, socket);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
