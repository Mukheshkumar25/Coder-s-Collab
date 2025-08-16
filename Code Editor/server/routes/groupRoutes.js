const express = require("express");
const router = express.Router();
const { createRoom, joinRoom, getMembers, updateFile } = require("../controllers/groupController");

// POST /api/group/create-room
router.post("/create-room", createRoom);
router.post("/join-room", joinRoom);
router.get("/get-members/:roomId", getMembers); 
router.post("/update-file", updateFile);

module.exports = router;