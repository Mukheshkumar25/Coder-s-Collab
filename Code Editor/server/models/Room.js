// models/Room.js
const mongoose = require("mongoose");

/* ────────── sub‑schemas ────────── */

// 1) Files / folders kept in the editor tree
const fileSchema = new mongoose.Schema(
  {
    id:        { type: String, required: true },  // frontend‑generated ID
    name:      { type: String, required: true },
    extension: { type: String },                 // “.js”, “.html”, …
    content:   { type: String, default: "" },
    isFolder:  { type: Boolean, default: false },
    parentId:  { type: String, default: null },  // allow nested trees later
  },
  { _id: false }
);

// 2) Active members in the room
const memberSchema = new mongoose.Schema(
  {
    username: String,
    isLeader: Boolean,
  },
  { _id: false }
);

// 3) Persisted chat history
const chatMessageSchema = new mongoose.Schema(
  {
    author:    { type: String, required: true },
    message:   { type: String, required: true },
    timestamp: { type: Date,   default: Date.now },
  },
  { _id: false }
);

// 4) Whiteboard strokes
//    Each stroke = continuous drag with the same colour / size
const whiteboardStrokeSchema = new mongoose.Schema(
  {
    color:  { type: String, required: true },
    size:   { type: Number, required: true },
    points: {
      type: [[Number]],               // [[x,y], [x,y], …]
      validate: v => Array.isArray(v) && v.length > 0
    },
  },
  { _id: false }
);

/* ────────── main Room schema ────────── */

const roomSchema = new mongoose.Schema(
  {
    roomName: { type: String, required: true },

    roomId:   { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    members:    [memberSchema],          // people currently in / saved to DB
    files:      [fileSchema],            // persisted project files
    chat:       [chatMessageSchema],     // chat log
    whiteboard: [whiteboardStrokeSchema] // every stroke ever drawn
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);