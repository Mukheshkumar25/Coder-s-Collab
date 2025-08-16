import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { defaultWebStructure } from "../utils/fileUtils";

const GroupContext = createContext();
export const useGroup = () => useContext(GroupContext);

export const GroupProvider = ({ children }) => {
  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isInRoom, setIsInRoom] = useState(false);
  const [isLeader, setIsLeader] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  const { user } = useAuth();

  const ensureStarterFiles = () => {
    setFiles((prev) => {
      if (prev.length === 0) {
        setActiveFile(defaultWebStructure[0]);
        return defaultWebStructure;
      }
      return prev;
    });
  };

  const sendChatMessage = (text) => {
    if (!room || !user || !socket) return;

    const chatData = {
      roomId   : room.roomId,
      author   : user.username,
      message  : text,
      timestamp: new Date().toISOString(),
    };

    // realtime + persistence
    socket.emit("chat-message", chatData);
  };


  const updateCode = async (fileId, newContent) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, content: newContent } : f))
    );
    setActiveFile((prev) =>
      prev && prev.id === fileId ? { ...prev, content: newContent } : prev
    );

    if (socket && room) {
      socket.emit("code-change", { roomId: room.roomId, fileId, content: newContent });
    }

    try {
      await axios.post(
        "http://localhost:5000/api/group/update-file",
        { roomId: room.roomId, fileId, content: newContent },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("❌ Failed to persist code to DB:", err);
    }
  };

  useEffect(() => {
    const s = io("http://localhost:5000", { withCredentials: true });
    setSocket(s);

    s.on("connect", () => {
      console.log("✅ socket connected:", s.id);
    });
    s.on("disconnect", () => console.log("❌ socket disconnected"));

    return () => s.disconnect();
  }, []);

  // 🧠 Persisted Rejoin with DB Files
  useEffect(() => {
    if (!socket || !user?.username) return;

    const saved = localStorage.getItem("group-room");
    if (!saved) return;

    const parsed = JSON.parse(saved);
    if (!parsed?.room?.roomId || !parsed.isInRoom) return;

    (async () => {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/group/join-room",
          { roomId: parsed.room.roomId, password: parsed.room.password || "" },
          { withCredentials: true }
        );

        setRoom({ roomId: parsed.room.roomId, roomName: res.data.roomName });
        setMembers(res.data.members);
        setIsInRoom(true);
        setIsLeader(parsed.isLeader);

        if (res.data.files?.length > 0) {
          setFiles(res.data.files);
          setActiveFile(res.data.files[0]);
        } else {
          ensureStarterFiles();
        }

        setChatMessages(Array.isArray(res.data.chat) ? res.data.chat : []);

        const emitJoin = () =>
          socket.emit("join-room", {
            roomId: parsed.room.roomId,
            username: user.username,
            isLeader: parsed.isLeader,
            socketId: socket.id,
          });

        socket.connected ? emitJoin() : socket.once("connect", emitJoin);
      } catch (err) {
        console.error("❌ Rejoin failed:", err);
        localStorage.removeItem("group-room");
      }
    })();
  }, [socket, user]);

  // 🧑‍🤝‍🧑 Member List Sync
  useEffect(() => {
    if (!socket) return;
    const handler = async ({ roomId }) => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/group/get-members/${roomId}`
        );
        setMembers(
          Array.from(new Map(res.data.members.map((m) => [m.username, m])).values())
        );
      } catch (err) {
        console.error("❌ members fetch error:", err);
      }
    };
    socket.on("members-updated", handler);
    return () => socket.off("members-updated", handler);
  }, [socket]);

  // 🔄 Request file sync from peers (fallback)
  useEffect(() => {
    if (!socket || !room?.roomId) return;

    socket.emit("request-files", { roomId: room.roomId });

    socket.on("send-files", ({ files: remoteFiles, activeFileId }) => {
      setFiles(remoteFiles);
      const found = remoteFiles.find((f) => f.id === activeFileId);
      setActiveFile(found ?? remoteFiles[0]);
    });

    return () => {
      socket.off("send-files");
    };
  }, [socket, room?.roomId]);

  // 📤 Respond to file sync request
  useEffect(() => {
    if (!socket || !room?.roomId) return;

    socket.on("get-files", ({ socketId: toSocketId }) => {
      if (files.length > 0) {
        socket.emit("send-files", {
          toSocketId,
          files,
          activeFileId: activeFile?.id ?? null,
        });
      }
    });

    return () => socket.off("get-files");
  }, [socket, room?.roomId, files, activeFile]);

  // 🆕 Listen for code updates from other users
  useEffect(() => {
    if (!socket || !room?.roomId) return;

    const handleCodeChange = ({ fileId, content }) => {
      console.log("🟡 Received live code update from another user");

      setFiles((prev) =>
        prev.map((f) => f.id === fileId ? { ...f, content } : f)
      );

      setActiveFile((prev) =>
        prev && prev.id === fileId ? { ...prev, content } : prev
      );
    };

    socket.on("code-change", handleCodeChange);
    return () => socket.off("code-change", handleCodeChange);
  }, [socket, room?.roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (chatData) => {
      setChatMessages((prev) => [...prev, chatData]);
    };

    socket.on("chat-message", handleChatMessage);
    return () => socket.off("chat-message", handleChatMessage);
  }, [socket]);

    // 🆕  listen for "room‑closed" from server  ────────────────────────────
  useEffect(() => {
    if (!socket) return;                      // wait until socket exists

    const handleRoomClosed = () => {
      alert("🚫  The room has been closed by the leader.");

      // 1) clear everything that marks you ‘in the room’
      localStorage.removeItem("group-room");
      setRoom(null);
      setFiles([]);
      setActiveFile(null);
      setMembers([]);
      setIsInRoom(false);
      setIsLeader(false);

      // 2) optional: hard‑redirect (or use navigate("/group"))
      window.location.href = "/group";
    };

    socket.on("room-closed", handleRoomClosed);
    return () => socket.off("room-closed", handleRoomClosed);
  }, [socket]);


  return (
    <GroupContext.Provider
      value={{
        room, setRoom,
        members, setMembers,
        files, setFiles,
        activeFile, setActiveFile,
        updateCode,
        socket,
        isInRoom, setIsInRoom,
        isLeader, setIsLeader,
        chatMessages, sendChatMessage,
        showChat, setShowChat,
        showWhiteboard, setShowWhiteboard
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export default GroupContext;