import React, { useContext } from "react";
import GroupContext from "../../context/GroupContext";
import { useAuth } from "../../context/AuthContext";
import { Users, DoorOpen, Info, PenTool } from "lucide-react"; // ✏️ Pen icon for whiteboard

export default function RoomSidebar({ onLeave }) {
  const { user } = useAuth();
  const {
    room,
    members,
    showChat,
    setShowChat,
    showWhiteboard,
    setShowWhiteboard,
  } = useContext(GroupContext); // ✅ include whiteboard state

  if (!room) return null;

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col justify-between p-5 bg-gray-100">
      {/* Scrollable content */}
      <div className="overflow-auto">
        {/* Room Info */}
        <div className="flex items-center gap-2 mb-5 text-blue-700">
          <Info className="w-5 h-5" />
          <h2 className="text-xl font-bold">Room Information</h2>
        </div>

        <div className="mb-6 text-sm text-gray-700 space-y-1">
          <p>
            <span className="font-medium text-gray-800">Room Name:</span>{" "}
            {room.roomName}
          </p>
          <p>
            <span className="font-medium text-gray-800">Room ID:</span>{" "}
            {room.roomId}
          </p>
        </div>

        <hr className="my-5 border-gray-300" />

        {/* Members */}
        <div className="flex items-center gap-2 mb-3 text-green-700">
          <Users className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Active Members</h3>
        </div>

        <ul className="text-sm space-y-1 max-h-60 overflow-y-auto pr-1">
          {Array.isArray(members) && members.length > 0 ? (
            members.map((member, idx) => (
              <li
                key={idx}
                className={`px-3 py-1 rounded ${
                  member.username === user?.username
                    ? "bg-blue-50 font-medium"
                    : "bg-gray-50"
                }`}
              >
                <span
                  className={
                    member.isLeader
                      ? "font-semibold text-blue-600"
                      : "text-gray-800"
                  }
                >
                  {member.username}
                </span>
                {member.isLeader && (
                  <span className="ml-1 text-sm text-blue-400">(Leader)</span>
                )}
                {member.username === user?.username && (
                  <span className="ml-1 italic text-gray-500">(you)</span>
                )}
              </li>
            ))
          ) : (
            <li className="italic text-gray-500">No members yet</li>
          )}
        </ul>
      </div>

      {/* Buttons */}
      <div className="mt-4 space-y-3">
        <button
          onClick={() => setShowChat((prev) => !prev)}
          className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
        >
          {showChat ? "Close Chat" : "Open Chat"}
        </button>

        <button
          onClick={() => setShowWhiteboard((prev) => !prev)}
          className="w-full bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 flex items-center justify-center gap-2"
        >
          <PenTool className="w-4 h-4" />
          {showWhiteboard ? "Close Whiteboard" : "Open Whiteboard"}
        </button>
      </div>

      {/* Leave Button - always visible at bottom */}
      <div className="mt-6 pt-4 border-t">
        <button
          onClick={onLeave}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded shadow transition"
        >
          <DoorOpen className="w-4 h-4" />
          Leave Room
        </button>
      </div>
    </div>
  );
}