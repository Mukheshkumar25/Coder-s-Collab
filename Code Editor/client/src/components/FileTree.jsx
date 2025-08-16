import React from "react";
import { FaDownload } from "react-icons/fa";

export default function FileTree({ files, setActiveFile, activeFile }) {
  const handleDownload = (file) => {
    const blob = new Blob([file.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();

    URL.revokeObjectURL(url); // Cleanup
  };

  return (
    <div className="p-2 text-sm overflow-y-auto h-full bg-gray-100 border-r">
      {files.length === 0 ? (
        <div className="text-gray-500 italic px-2">No files available</div>
      ) : (
        files.map((file) => (
          <div
            key={file.id}
            onClick={() => setActiveFile({ ...file })}
            className={`flex justify-between items-center cursor-pointer px-2 py-1 rounded hover:bg-gray-300 ${
              activeFile?.id === file.id ? "bg-gray-300 font-semibold" : ""
            }`}
          >
            <span>{file.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent click on parent
                handleDownload(file);
              }}
              className="text-gray-500 hover:text-black ml-2"
              title="Download File"
            >
              <FaDownload />
            </button>
          </div>
        ))
      )}
    </div>
  );
}