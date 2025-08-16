import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { defaultWebStructure } from "../../utils/fileUtils";

import  GroupContext  from "../../context/GroupContext";
import { useAuth } from "../../context/AuthContext";

export default function CreateRoomModal({ onClose }) {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const { socket, setRoom, setIsInRoom, setIsLeader, setMembers, setFiles, setActiveFile } =
    useContext(GroupContext);
  const { user } = useAuth();

  const handleCreate = async (e) => {
    e.preventDefault();
    setErr("");

    if (!roomName.trim() || !password.trim()) {
      setErr("Room name and password are required.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/group/create-room",
        { roomName, password },
        { withCredentials: true }
      );

      const { roomId } = res.data;

      // Emit socket event to join the room
      socket.emit("join-room", {
        roomId,
        username: user.username,
        socketId: socket.id,
        isLeader: true,
      });

      // Update state
      const roomData = {
        roomId,
        roomName,
      };

      const memberData = [
        { username: user.username, isLeader: true }
      ];

      setRoom(roomData);
      setMembers(memberData);
      setIsInRoom(true);
      setIsLeader(true);
      setFiles(defaultWebStructure);              // 👈 Add this
      setActiveFile(defaultWebStructure[0]); 

      // ✅ Save to localStorage
      localStorage.setItem("group-room", JSON.stringify({
        room: {
          ...roomData,
          password,
        },
        isInRoom: true,
        isLeader: true,
      }));

      onClose(); // Close modal
      navigate("/group/room"); // Navigate after all updates
    } catch (error) {
      console.error("Create room error:", error);
      setErr(
        error.response?.data?.message || "Failed to create room. Try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <form
        onSubmit={handleCreate}
        className="bg-white p-6 rounded-lg w-96 space-y-4 shadow-lg"
      >
        <h2 className="text-2xl font-semibold text-center">Create Room</h2>

        {err && <p className="text-red-500 text-sm text-center">{err}</p>}

        <div>
          <label className="block text-sm font-medium">Project / Room Name</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="e.g. Portfolio Team"
            className="w-full px-3 py-2 border rounded mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Room Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Set a room password"
            className="w-full px-3 py-2 border rounded mt-1"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Create Room
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full text-sm text-gray-600 hover:underline text-center"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}