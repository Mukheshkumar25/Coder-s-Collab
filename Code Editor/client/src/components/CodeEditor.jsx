// src/components/CodeEditor.jsx
import React, { useContext, useEffect, useState } from "react";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import GroupContext from "../context/GroupContext";

export default function CodeEditor({ file: propFile, onChange: propOnChange }) {
  const group = useContext(GroupContext);
  const file = propFile ?? group?.activeFile;

  const saveFn = propOnChange ?? ((val) => {
    if (group?.activeFile) group.updateCode(group.activeFile.id, val);
  });

  const getLanguage = (filename = "") => {
    const ext = filename.startsWith(".")
      ? filename
      : filename.slice(filename.lastIndexOf("."));
    switch (ext) {
      case ".js": return "javascript";
      case ".py": return "python";
      case ".java": return "java";
      case ".c": return "c";
      case ".cpp": return "cpp";
      case ".html": return "html";
      case ".css": return "css";
      default: return "plaintext";
    }
  };

  // 🟡 FIX: use local state to handle editor content and keep it in sync
  const [editorValue, setEditorValue] = useState("");

  // 🧠 Sync editor value whenever the file changes (e.g., on refresh)
  useEffect(() => {
    setEditorValue(file?.content || "");
  }, [file?.id]); // trigger ONLY when a new file becomes active

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select or create a file…
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <MonacoEditor
        key={file.id} // 🔁 ensures editor re-renders on file switch or content update
        height="100%"
        language={getLanguage(file.extension ?? file.name)}
        theme="vs-dark"
        value={file.content}
        onChange={saveFn}
        options={{
          tabSize: 4,
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          autoClosingTags: true,
          fontSize: 14,
          formatOnType: true,
      }}
    />
    </div>
  );
}
