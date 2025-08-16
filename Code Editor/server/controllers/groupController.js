// controllers/groupController.js
const jwt  = require("jsonwebtoken");
const Room = require("../models/Room");
const User = require("../models/User");

// 👇 import starter structure for new rooms
const { defaultWebStructure } = require("../../client/src/utils/fileUtils");

/* ────────── JOIN ROOM ────────── */
exports.joinRoom = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { roomId, password } = req.body;

    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.password !== password)
      return res.status(401).json({ message: "Invalid password" });

    // ensure user exists
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // add member if not already present
    if (!room.members.some((m) => m.username === user.username)) {
      room.members.push({ username: user.username, isLeader: false });
      await room.save();
    }

    /* ✅ return persisted files to the client */
    res.status(200).json({
      roomName: room.roomName,
      members:  room.members,
      files:    room.files,
      chat     : room.chat,         
    });
  } catch (err) {
    console.error("Join Room Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ────────── CREATE ROOM ────────── */
exports.createRoom = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { roomName, password } = req.body;

    if (!roomName || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // generate unique 6‑digit room ID
    const roomId = Math.floor(100000 + Math.random() * 900000).toString();

    // ➡ seed room.files with starter structure
    const room = new Room({
      roomName,
      roomId,
      password,
      createdBy: decoded.id,
      members: [{ username: user.username, isLeader: true }],
      files: defaultWebStructure,           // <–– persist starter files
      chat : [], 
    });

    await room.save();

    res.status(201).json({ message: "Room created", roomId });
  } catch (err) {
    console.error("Create Room Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ────────── GET MEMBERS ONLY ────────── */
exports.getMembers = async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ members: room.members });
  } catch (err) {
    res.status(500).json({ message: "Failed to get members", error: err });
  }
};

exports.updateFile = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { roomId, fileId, content } = req.body;

    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const file = room.files.find((f) => f.id === fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    file.content = content;
    await room.save();

    res.status(200).json({ message: "File updated successfully" });
  } catch (err) {
    console.error("❌ Update file error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
