import React, { useState, useEffect, useRef } from "react";
import { useGroup } from "../../context/GroupContext";
import { useAuth }  from "../../context/AuthContext";   // ✅ new
import { X } from "lucide-react";                      // red close icon

const ChatPane = ({ closeChat }) => {
const { chatMessages, sendChatMessage } = useGroup();
const { user } = useAuth();       
const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const handleSend = () => {
    if (input.trim()) {
      sendChatMessage(input.trim());
      setInput("");
    }
  };

  /* auto‑scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <div className="fixed top-1/2 left-1/2 z-50 w-[90%] max-w-md h-[80%] -translate-x-1/2 -translate-y-1/2
                    bg-white border border-gray-300 rounded-xl shadow-2xl flex flex-col">
      {/* ❌ close */}
      <button
        onClick={closeChat}
        className="absolute top-3 right-3 text-red-600 hover:text-red-800 text-2xl font-bold"
        title="Close Chat"
      >
        <X size={28} strokeWidth={3}/>
      </button>

      {/* 💬 messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white custom-scrollbar">
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`w-fit max-w-[75%] px-4 py-2 rounded-lg shadow-sm text-sm break-words
              ${msg.author === user?.username ? "bg-blue-600 text-white ml-auto" 
                                              : "bg-gray-100 text-gray-800 mr-auto"}`}
          >
            <div className="font-semibold text-xs opacity-90 mb-1">
              {msg.author}
            </div>
            <div>{msg.message}</div>
            <div className="text-[10px] opacity-60 mt-1 text-right">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}

        {chatMessages.length === 0 && (
          <p className="text-gray-400 text-center mt-20 text-sm">
            No messages yet.
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ➡️ input */}
      <div className="p-3 border-t flex gap-2 bg-gray-50">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message…"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPane;