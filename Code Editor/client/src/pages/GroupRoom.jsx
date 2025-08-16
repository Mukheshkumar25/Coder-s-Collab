import React, { useState, useContext } from "react";
import GroupContext from "../context/GroupContext";
import RoomSidebar from "../components/group/RoomSidebar";
import GroupFileTree from "../components/group/GroupFileTree";
import CodeEditor from "../components/CodeEditor";
import LivePreview from "../components/LivePreview";
import ChatPane from "../components/group/ChatPane";
import Whiteboard from "../components/group/Whiteboard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGroup } from "../context/GroupContext";

export default function GroupRoom() {
  const { files } = useGroup();
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    socket,
    room,
    setRoom,
    setMembers,
    isInRoom,
    setIsInRoom,
    setIsLeader,
    showChat,
    setShowChat,
    showWhiteboard,
    setShowWhiteboard
  } = useContext(GroupContext);

  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);

  /* ────────────────── helpers ────────────────── */
  const handleLeaveRoom = () => {
    if (socket && room && user) {
      socket.emit("leave-room", {
        roomId: room.roomId,
        username: user.username,
      });
    }
    setRoom(null);
    setMembers([]);
    setIsInRoom(false);
    setIsLeader(false);
    localStorage.removeItem("group-room");
    navigate("/group");
  };

  /* Guard if user somehow lost room state */
  if (!isInRoom) {
    return (
      <div className="p-6 text-center text-lg">
        ❌ You are not in a room.
      </div>
    );
  }

  /* ────────────────── render ────────────────── */
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* LEFT sidebar */}
      {showLeft && (
        <div className="w-64 min-w-[16rem] h-full border-r bg-gray-100 overflow-y-auto">
          <RoomSidebar
            onLeave={handleLeaveRoom}
            toggleSidebar={() => setShowLeft(false)}
          />
        </div>
      )}

      {/* CENTER editor / preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toggle buttons row */}
        <div className="flex justify-between items-center px-4 py-2 bg-gray-200 text-sm">
          {/* Leftmost: Room Info toggle */}
          <button onClick={() => setShowLeft((prev) => !prev)}>
            {showLeft ? "⬅ Hide Room Info" : "➡ Show Room Info"}
          </button>

          {/* Rightmost: File Info toggle */}
          <button onClick={() => setShowRight((prev) => !prev)}>
            {showRight ? "Hide Files ➡" : "Show Files ⬅"}
          </button>
        </div>

        {/* Editor + Preview side by side */}
        <div className="flex flex-1 gap-2 mt-2 overflow-hidden">
          <div className="flex-1 border rounded overflow-hidden">
            <CodeEditor />
          </div>
          <div className="w-1/2 border rounded overflow-hidden">
            <LivePreview files={files} />
          </div>
        </div>
      </div>

      {/* RIGHT sidebar */}
      {showRight && (
        <div className="w-64 min-w-[16rem] h-full border-l bg-gray-100 overflow-y-auto">
          <GroupFileTree toggleSidebar={() => setShowRight(false)} />
        </div>
      )}

      {/* 💬 Chat Overlay */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative bg-white w-[400px] max-w-[90%] h-[80vh] rounded-xl shadow-xl p-4 overflow-y-auto">
            <button
              onClick={() => setShowChat(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
            >
              &times;
            </button>
            <ChatPane closeChat={() => setShowChat(false)} />
          </div>
        </div>
      )}

      {/* 🎨 Whiteboard Overlay */}
      {showWhiteboard && (
        <Whiteboard onClose={() => setShowWhiteboard(false)} />
      )}
    </div>
  );
}