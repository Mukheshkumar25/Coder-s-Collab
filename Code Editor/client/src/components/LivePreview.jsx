import React, { useEffect, useRef } from "react";

export default function LivePreview({ files }) {
  const iframeRef = useRef();

  useEffect(() => {
    if (!iframeRef.current || !Array.isArray(files)) return;

    const html = files.find((f) => f.extension === ".html")?.content || "";
    const css = files.find((f) => f.extension === ".css")?.content || "";
    const js = files.find((f) => f.extension === ".js")?.content || "";

    const documentContents = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}<\/script>
        </body>
      </html>
    `;

    // Accessing iframe safely
    const doc = iframeRef.current.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(documentContents);
    doc.close();
  }, [files]);

  return (
    <iframe
      ref={iframeRef}
      title="Live Preview"
      className="w-full h-full bg-white"
      // ❌ DO NOT USE `sandbox` unless needed
      // sandbox="allow-scripts"  <-- REMOVE this line to avoid SecurityError
    />
  );
}