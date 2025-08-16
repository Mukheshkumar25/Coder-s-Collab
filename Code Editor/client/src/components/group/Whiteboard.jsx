// src/components/group/Whiteboard.jsx
import React, { useRef, useEffect, useState } from "react";
import { useGroup } from "../../context/GroupContext";
import { X, Trash2, Download } from "lucide-react";

/* 🧠 Helper: download canvas to PNG */
const saveCanvasToPNG = (canvas) => {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `whiteboard-${Date.now()}.png`;
  link.click();
};

const Whiteboard = ({ onClose }) => {
  const { socket, room } = useGroup();

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeBuf, setStrokeBuf] = useState(null);

  /* 🖍️ Helper to create a stroke */
  const serialiseStroke = () => ({
    color,
    size: brushSize,
    points: [],
  });

  /* 🧠 Helper to draw an existing stroke */
  const drawStroke = (ctx, stroke) => {
    if (!stroke || stroke.points.length === 0) return;
    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.beginPath();
    const [first, ...rest] = stroke.points;
    ctx.moveTo(first[0], first[1]);
    rest.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.stroke();
    ctx.restore();
  };

  /* 🧱 Setup canvas on mount */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const setCanvasSize = () => {
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.putImageData(img, 0, 0);
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctxRef.current = ctx;

    // 🧠 Ask server for whiteboard history
    if (socket && room) {
      socket.emit("wb-request-history", { roomId: room.roomId });
    }

    return () => window.removeEventListener("resize", setCanvasSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 🔌 Socket listeners */
  useEffect(() => {
    if (!socket) return;

    const handleDraw = (stroke) => drawStroke(ctxRef.current, stroke);
    const handleHistory = (strokes) =>
      strokes.forEach((s) => drawStroke(ctxRef.current, s));
    const handleClear = () =>
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    socket.on("wb-draw", handleDraw);
    socket.once("wb-history", handleHistory);
    socket.on("wb-clear", handleClear);

    return () => {
      socket.off("wb-draw", handleDraw);
      socket.off("wb-clear", handleClear);
    };
  }, [socket, room?.roomId]);

  /* 🐭 Mouse interactions */
  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = ctxRef.current;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);

    const stroke = serialiseStroke();
    stroke.points.push([offsetX, offsetY]);
    setStrokeBuf(stroke);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();

    setStrokeBuf((prev) => {
      prev.points.push([offsetX, offsetY]);
      return prev;
    });
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    ctxRef.current.closePath();
    setIsDrawing(false);

    if (socket && room && strokeBuf) {
      socket.emit("wb-draw", { roomId: room.roomId, stroke: strokeBuf });
    }
    setStrokeBuf(null);
  };

  /* 🔴 Clear board for all users */
  const clearBoard = () => {
    ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    socket?.emit("wb-clear", { roomId: room.roomId });
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      {/* ───── Toolbar ───── */}
      <div className="flex items-center gap-4 p-3 bg-gray-100 border-b">
        <label className="flex items-center gap-2 text-sm">
          Color
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          Size
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(+e.target.value)}
          />
        </label>

        <button
          onClick={clearBoard}
          className="ml-auto flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          <Trash2 size={16} /> Clear
        </button>

        <button
          onClick={() => saveCanvasToPNG(canvasRef.current)}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Download size={16} /> Save
        </button>

        <button
          onClick={onClose}
          className="ml-2 px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-900"
        >
          <X size={16} />
        </button>
      </div>

      {/* ───── Canvas ───── */}
      <canvas
        ref={canvasRef}
        className="flex-1 cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

export default Whiteboard;