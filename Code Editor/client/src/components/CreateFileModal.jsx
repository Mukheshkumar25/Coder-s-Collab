// components/CreateFileModal.jsx
import React, { useState } from "react";

export default function CreateFileModal({ onClose, onCreate }) {
  const [fileName, setFileName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fileName.includes(".")) {
      alert("Please enter a valid filename with extension (e.g., file.cpp)");
      return;
    }
    onCreate(fileName);
    onClose(); // close modal after creation
  };
  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Create New File</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter filename (e.g., main.cpp)"
            className="border border-gray-300 rounded p-2"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}