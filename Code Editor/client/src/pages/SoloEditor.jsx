import React, { useEffect, useState } from "react";
import Split from "react-split";
import { FaBars } from "react-icons/fa";
import {
  defaultWebStructure,
  defaultGeneralStructure,
  boilerplateByExtension
} from "../utils/fileUtils";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  saveEditorMode,
  loadEditorMode,
  saveActiveFile,
  loadActiveFile,
} from "../utils/localStorageUtils";

import CodeEditor from "../components/CodeEditor";
import Terminal from "../components/Terminal";
import LivePreview from "../components/LivePreview";
import FileTree from "../components/FileTree";
import CreateFileModal from "../components/CreateFileModal";

export default function SoloEditor() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [languageMode, setLanguageMode] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [output,setOutput] = useState("");

  // Load everything on mount
  useEffect(() => {
    const savedMode = loadEditorMode() || "general";
    const storedFiles = loadFromLocalStorage(savedMode);
    const storedActiveId = loadActiveFile();

    const fallbackFiles =
      savedMode === "web"
        ? JSON.parse(JSON.stringify(defaultWebStructure))
        : JSON.parse(JSON.stringify(defaultGeneralStructure));

    const finalFiles =
      Array.isArray(storedFiles) && storedFiles.length > 0
        ? storedFiles
        : fallbackFiles;

    const active =
      finalFiles.find((f) => f.id === storedActiveId) ||
      finalFiles.find((f) => f.type === "file") ||
      null;

    setLanguageMode(savedMode);
    setFiles(finalFiles);
    setActiveFile(active);
  }, []);

  // Save mode
  useEffect(() => {
    if (languageMode) {
      saveEditorMode(languageMode);
    }
  }, [languageMode]);

  // Save files
  useEffect(() => {
    if (languageMode && files.length > 0) {
      saveToLocalStorage(languageMode, files);
    }
  }, [files, languageMode]);

  // Save active file
  useEffect(() => {
    if (activeFile?.id) {
      saveActiveFile(activeFile.id);
    }
  }, [activeFile]);

  // Handle mode switch
  const switchMode = (mode) => {
    if (mode === languageMode) return;

    const stored = loadFromLocalStorage(mode);
    const fallback =
      mode === "web"
        ? JSON.parse(JSON.stringify(defaultWebStructure))
        : JSON.parse(JSON.stringify(defaultGeneralStructure));

    const nextFiles = stored?.length > 0 ? stored : fallback;
    const nextActive = nextFiles.find((f) => f.type === "file") || null;

    setLanguageMode(mode);
    setFiles(nextFiles);
    setActiveFile(nextActive);
  };

  const handleCreateFile = (name) => {
    const id = Date.now().toString();
    const extension = name.substring(name.lastIndexOf("."));

    const newFile = {
      id,
      name,
      type: "file",
      extension,
      content: boilerplateByExtension[extension] || ""
    };

    const updated = [...files, newFile];
    setFiles(updated);
    setActiveFile(newFile);
    saveToLocalStorage(languageMode, updated);
  };

  const handleDeleteFile = () => {
    if (!activeFile) return;
    const confirmed = window.confirm(`Delete "${activeFile.name}"?`);
    if (!confirmed) return;

    const updated = files.filter((f) => f.id !== activeFile.id);
    setFiles(updated);

    const fallback = updated.find((f) => f.type === "file") || null;
    setActiveFile(fallback);

    saveToLocalStorage(languageMode, updated);
  };



  const handleRun = async () => {
    if (languageMode !== "general" || !activeFile) return;

    const languageMap = {
      ".c": 50,
      ".cpp": 54,
      ".java": 62,
      ".py": 71,
    };

    const langId = languageMap[activeFile.extension];
    if (!langId) return alert("Unsupported language");

    setOutput("⏳ Running your code...");

    try {
      const response = await fetch("http://localhost:5000/api/auth/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language_id: langId,
          source_code: activeFile.content,
          stdin: userInput,
        }),
      });
      const result = await response.json();
      const {
        output,
        stderr,
        compile_output,
        message,
        status,
      } = result;

      let finalOutput = "";
      if (output) {
        finalOutput = output.trim();
      } else if (stderr) {
        finalOutput = stderr.trim();
      } else if (compile_output) {
        finalOutput = compile_output.trim();
      } else if (message) {
        finalOutput = message.trim();
      } else {
        finalOutput = "❌ Unknown error occurred while running your code.";
      }

      if (status && status !== "Accepted") {
        finalOutput = `🔴 ${status}\n\n${finalOutput}`;
      }

      setOutput(finalOutput);
    } catch (error) {
      console.error("Execution failed:", error);
      setOutput("❌ Failed to execute code.");
    }
  };

  if (!languageMode) return <div className="p-4">Loading Editor...</div>;

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-white border-b">
        <div className="flex gap-4 items-center">
          <button
            className="text-xl text-gray-700 hover:text-black"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
          >
            <FaBars />
          </button>

          <button
            className={`px-4 py-2 rounded ${
              languageMode === "general"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => switchMode("general")}
          >
            General Purpose
          </button>
          <button
            className={`px-4 py-2 rounded ${
              languageMode === "web"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => switchMode("web")}
          >
            Web Development
          </button>
        </div>

        {languageMode === "general" && (
          <div className="flex items-center gap-4">
            {/* Create and Delete Buttons */}
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              onClick={() => setShowCreateModal(true)}
            >
              + File
            </button>

            <button
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              onClick={handleDeleteFile}
              disabled={!activeFile}
            >
              Delete File
            </button>

            {/* User Input Textarea */}
            <textarea
              rows={2}
              placeholder="Enter input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="p-2 text-sm border border-gray-300 rounded resize-none w-64"
            />

            {/* Run Button */}
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={handleRun}
            >
              Run
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {isSidebarOpen && (
          <div className="w-64 border-r bg-white">
            <FileTree
              files={files}
              setFiles={setFiles}
              activeFile={activeFile}
              setActiveFile={setActiveFile}
              languageMode={languageMode}
            />
          </div>
        )}

        <Split className="flex flex-1" sizes={[50, 50]} minSize={200} gutterSize={10}>
          <div className="border-r h-full">
            <CodeEditor
              file={activeFile}
              onChange={(content) => {
                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === activeFile?.id ? { ...f, content } : f
                  )
                );
                setActiveFile(prev => ({ ...prev, content }));
              }}
            />
          </div>
          <div className="h-full">
            {languageMode === "general" ? (
              <Terminal output={output} />
            ) : (
              <LivePreview files={files} />
            )}
          </div>
        </Split>
        {showCreateModal && (
          <CreateFileModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateFile}
          />
        )}
      </div>
    </div>
  );
}