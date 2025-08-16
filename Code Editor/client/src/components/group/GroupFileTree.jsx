import React, { useContext } from "react";
import GroupContext from "../../context/GroupContext";
import { FileText } from "lucide-react"; // optional icon

export default function GroupFileTree() {
  const { files, activeFile, setActiveFile } = useContext(GroupContext);

  if (!files || files.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        No files yet...
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full p-5 bg-gray-100 flex flex-col">
      <div className="flex items-center gap-2 mb-4 text-purple-700">
        <FileText className="w-5 h-5" />
        <h2 className="text-lg font-bold">Project Files</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <ul className="space-y-1 text-sm">
          {files.map((file) => (
            <li
              key={file.id}
              onClick={() => setActiveFile(file)}
              className={`cursor-pointer rounded px-3 py-1 transition
                ${
                  activeFile?.id === file.id
                    ? "bg-purple-200 font-semibold text-gray-900"
                    : "bg-white hover:bg-purple-50 text-gray-800"
                }`}
            >
              {file.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
