import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import  { AuthContext }  from "../../context/AuthContext";
import  GroupContext  from "../../context/GroupContext";

export default function JoinRoomModal({ onClose }) {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const { socket, setRoom, setIsInRoom, setIsLeader } = useContext(GroupContext);
  const { user } = useContext(AuthContext);

  const handleJoin = async (e) => {
    e.preventDefault();
    setErr("");

    if (!roomId || !password) {
      setErr("Please fill in both fields");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/group/join-room",
        { roomId, password },
        { withCredentials: true }
      );

      const { roomName, members } = res.data;

      // Emit socket event
      socket.emit("join-room", {
        roomId,
        username: user.username,
        socketId: socket.id,
        isLeader: false,
      });

      // Update frontend state
      setRoom({ roomId, roomName, members });
      setIsInRoom(true);
      setIsLeader(false);

      localStorage.setItem("group-room", JSON.stringify({
        room: {
          roomId,
          roomName,
          password, // ✅ add password
        },
        isLeader: false,
        isInRoom: true,
      }));

      onClose();
      navigate("/group/room");
    } catch (err) {
      console.error(err);
      setErr(err.response?.data?.message || "Failed to join room");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <form
        onSubmit={handleJoin}
        className="bg-white p-6 rounded-lg w-96 space-y-4 shadow-md"
      >
        <h2 className="text-xl font-bold text-center">Join Room</h2>
        {err && <p className="text-red-500 text-sm">{err}</p>}

        <input
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="Room Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Join Room
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full text-sm text-gray-600 hover:underline"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}