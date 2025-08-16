import React, { useContext } from "react";
import { useAuth } from "../context/AuthContext";
import GroupContext from "../context/GroupContext";
import { useNavigate } from "react-router-dom";

export default function Navbar({goTOHome}) {
  
  const navigate = useNavigate();
  const {
    isLoggedIn,
    openLoginModal,
    openSignupModal,
    logout,
    user
  } = useAuth();
  const { socket, room, setRoom, setMembers, setIsInRoom, setIsLeader} = useContext(GroupContext);
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

    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 shadow-md bg-[#EAEAEA]">
      <div onClick={() => {handleLeaveRoom(); goTOHome();}} className="text-2xl font-bold text-[#252A34] cursor-pointer">
        Coders Collab
      </div>
      <div className="flex gap-4 items-center">
        {isLoggedIn ? (
          <button
            onClick={() => {handleLeaveRoom(); logout();}}
            className="bg-[#FF2E63] text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        ) : (
          <>
            <button
              onClick={openLoginModal}
              className="text-[#252A34] hover:underline font-medium"
            >
              Log In
            </button>
            <button
              onClick={openSignupModal}
              className="bg-[#08D9D6] text-white px-4 py-2 rounded hover:bg-[#07c6c3] transition"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}