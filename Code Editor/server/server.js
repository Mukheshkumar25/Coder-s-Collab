const express       = require("express");
const cookieParser  = require("cookie-parser");
const cors          = require("cors");
require("dotenv").config();
const http          = require("http");
const { Server }    = require("socket.io");
const Room          = require("./models/Room");
const connectDB     = require("./config/db");

const authRoutes  = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 5000;

/* ────────── Socket.IO setup ────────── */
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* ────────── Express middleware ────────── */
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

/* ────────── Routes ────────── */
app.use("/api/auth",  authRoutes);
app.use("/api/group", groupRoutes);

/* ────────── Start server after DB ────────── */
connectDB().then(() =>
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
);

/* ────────── In‑memory room map ────────── */
const rooms = {}; // { roomId: { members: [ { username, socketId } ] } }

/* ────────── Socket.IO events ────────── */
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  /* ---- join-room ---- */
  socket.on("join-room", ({ roomId, username, isLeader }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = { members: [] };

    if (!rooms[roomId].members.find((m) => m.socketId === socket.id)) {
      rooms[roomId].members.push({ username, socketId: socket.id, isLeader });
    }
    io.to(roomId).emit("members-updated", { roomId });
  });

  /* ---- leave-room ---- */
socket.on("leave-room", async ({ roomId, username }) => {
  socket.leave(roomId);
  if (rooms[roomId]) {
    rooms[roomId].members = rooms[roomId].members.filter(
      (m) => m.socketId !== socket.id
    );
  }

  try {
    const room = await Room.findOne({ roomId });
    if (!room) return;

    const isLeaderLeaving = room.members.find(
      (m) => m.username === username && m.isLeader
    );

    if (isLeaderLeaving) {
      // 🔥 Leader is leaving: delete room and notify all
      io.to(roomId).emit("room-closed");
      await Room.deleteOne({ roomId });
      delete rooms[roomId]; // clean up in-memory map
    } else {
      // 🧍 Regular member leaving
      room.members = room.members.filter((m) => m.username !== username);
      await room.save();
      io.to(roomId).emit("members-updated", { roomId });
    }
  } catch (err) {
    console.error("Error removing member from DB on leave:", err);
  }
});

  /* ───── 🔥 NEW: real‑time code sync + persistence ───── */
  socket.on("code-change", async ({ roomId, fileId, content }) => {
    // 1) broadcast to everyone else
    socket.to(roomId).emit("code-change", { fileId, content });

    // 2) 🔥 persist change to MongoDB
    try {
      const room = await Room.findOne({ roomId });
      if (!room) return;

      const idx = room.files.findIndex((f) => f.id === fileId);
      if (idx !== -1) {
        room.files[idx].content = content;
      } else {
        console.warn(`[code-change] fileId ${fileId} not found in DB`);
      }
      await room.save();
    } catch (err) {
      console.error("Error saving code to DB:", err);
    }
  });

  /* 🆕 Request / send full file state */
  socket.on("request-files", ({ roomId }) => {
    socket.to(roomId).emit("get-files", { socketId: socket.id });
  });

  socket.on("send-files", ({ toSocketId, files, activeFileId }) => {
    io.to(toSocketId).emit("send-files", { files, activeFileId });
  });

  /* 🔸 Chat: persist & broadcast */
  socket.on("chat-message", async ({ roomId, author, message, timestamp }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (!room) return;

      const chatEntry = { author, message, timestamp: timestamp ?? new Date() };

      room.chat.push(chatEntry);   // 1️⃣ persist
      await room.save();

      io.to(roomId).emit("chat-message", chatEntry); // 2️⃣ broadcast
    } catch (err) {
      console.error("💥 chat-message error:", err);
    }
  });

  /* Optional: allow newcomers to pull full history on demand */
  socket.on("request-chat-history", async ({ roomId }) => {
    try {
      const room = await Room.findOne({ roomId });
      if (room) socket.emit("chat-history", room.chat);
    } catch (err) {
      console.error("💥 chat-history error:", err);
    }
  });

  /* ── WHITEBOARD ────────────────────────────────────────── */
  // a) user draws → broadcast + push to DB
  socket.on("wb-draw", async ({ roomId, stroke }) => {
    socket.to(roomId).emit("wb-draw", stroke);      // realtime

    try {
      await Room.updateOne(
        { roomId },
        { $push: { whiteboard: stroke } }           // persist
      );
    } catch (e) {
      console.error("wb-draw DB error:", e);
    }
  });

  // b) newcomer asks for history
  socket.on("wb-request-history", async ({ roomId }) => {
    const room = await Room.findOne({ roomId }, { whiteboard: 1 });
    if (room) socket.emit("wb-history", room.whiteboard);
  });

  // c) GLOBAL CLEAR ‑ wipe DB and broadcast 
  socket.on("wb-clear", async ({ roomId }) => {
    // 1️⃣ delete strokes in MongoDB
    try {
      await Room.updateOne({ roomId }, { $set: { whiteboard: [] } });
    } catch (err) {
      console.error("wb-clear DB error:", err);
    }

    // 2️⃣ broadcast to every other client in the room
    socket.to(roomId).emit("wb-clear");
  });


  /* ---- disconnect ---- */
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);

    // Iterate over every room this socket might belong to
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const member = room.members.find((m) => m.socketId === socket.id);
      if (!member) continue; // not in this room

      // Grace‑period: give user 5 s to refresh / reconnect
      setTimeout(async () => {
        const rejoined = rooms[roomId].members.find(
          (m) => m.username === member.username && m.socketId !== socket.id
        );
        if (rejoined) return; // user came back, abort cleanup

        // Remove from in‑memory list
        rooms[roomId].members = room.members.filter(
          (m) => m.socketId !== socket.id
        );

        try {
          const dbRoom = await Room.findOne({ roomId });
          if (!dbRoom) return; // room already deleted

          const wasLeader = dbRoom.members.find(
            (m) => m.username === member.username && m.isLeader
          );

          if (wasLeader) {
            /* ─── Leader timed‑out: close the room ─── */
            io.to(roomId).emit("room-closed");   // notify everyone first
            await Room.deleteOne({ roomId });    // delete from MongoDB
            delete rooms[roomId];                // clear cache
            io.socketsLeave(roomId);             // force all sockets out
          } else {
            /* ─── Regular member timed‑out ─── */
            dbRoom.members = dbRoom.members.filter(
              (m) => m.username !== member.username
            );
            await dbRoom.save();
            io.to(roomId).emit("members-updated", { roomId });
          }
        } catch (err) {
          console.error("Error during disconnect cleanup:", err);
        }
      }, 5000); // ⇦ grace period
    }
  });
});