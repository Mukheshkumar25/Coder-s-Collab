import React, { useState } from "react";
import CreateRoomModal from "../components/group/CreateRoomModal";
import JoinRoomModal from "../components/group/JoinRoomModal";

export default function GroupLanding() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#08D9D6] to-[#EAEAEA] flex items-start justify-center pt-20 md:pt-32 px-6 pb-10">
      <div className="bg-white shadow-2xl rounded-xl max-w-xl w-full p-8 text-center space-y-6 border border-[#08D9D6]">
        <h1 className="text-4xl font-extrabold text-[#252A34]">👥 Group Mode</h1>
        <p className="text-[#252A34] text-base leading-relaxed">
          Collaborate with your team in real-time. Create a room or join an existing one using the room ID and password.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#FF2E63] hover:bg-[#e02658] text-white text-sm font-medium px-6 py-3 rounded transition duration-200 shadow-md hover:shadow-lg"
          >
            ➕ Create Room
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-[#252A34] hover:bg-[#1f222a] text-white text-sm font-medium px-6 py-3 rounded transition duration-200 shadow-md hover:shadow-lg"
          >
            🔑 Join Room
          </button>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateRoomModal onClose={() => setShowCreateModal(false)} />
      )}
      {showJoinModal && (
        <JoinRoomModal onClose={() => setShowJoinModal(false)} />
      )}
    </div>
  );
}