"use client";

import React, { useRef, useState, useEffect } from "react";

type PenColor = "black" | "blue" | "green" | "purple" | "red" | "orange";
type DrawingElement = {
  type: "line" | "o" | "x";
  points: { x: number; y: number }[];
  color: PenColor;
  id: string;
};

const PlayDrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState<PenColor>("black");
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [drawings, setDrawings] = useState<DrawingElement[]>([]);
  const [selectedDrawing, setSelectedDrawing] = useState<string | null>(null);
  const [playDetails, setPlayDetails] = useState({
    name: "",
    formation: "",
    type: "run" as "run" | "pass",
    notes: "",
  });
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (context) {
      context.strokeStyle = penColor;
      context.lineWidth = 2;
      context.lineCap = "round";
    }
  }, [penColor]);

  // Initial mount effect to draw the field background
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (context) {
      drawFieldBackground(context);
    }
  }, []);

  const drawFieldBackground = (context: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Field dimensions
    const fieldWidth = canvas.width;
    const fieldHeight = canvas.height;

    // Line of Scrimmage (LOS)
    context.beginPath();
    context.strokeStyle = "rgba(0, 0, 0, 0.2)"; // Black with 20% opacity
    context.lineWidth = 3;
    const losY = fieldHeight / 2 + 50 - 10;
    context.moveTo(0, losY);
    context.lineTo(fieldWidth, losY);
    context.stroke();

    // Calculate hash positions (adjust inward)
    const leftHashX = fieldWidth / 3;
    const rightHashX = (fieldWidth * 2) / 3;

    // Vertical hash marks
    context.beginPath();
    context.strokeStyle = "rgba(0, 0, 0, 0.3)";
    context.setLineDash([10, 10]);

    // Left hash mark
    context.moveTo(leftHashX, 0);
    context.lineTo(leftHashX, fieldHeight);

    // Right hash mark
    context.moveTo(rightHashX, 0);
    context.lineTo(rightHashX, fieldHeight);

    context.stroke();
    context.setLineDash([]);
    context.strokeStyle = "rgba(0, 0, 0, 1)";
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const context = canvas.getContext("2d");
    if (context) {
      if (e.button === 0) {
        // Left click
        setIsDrawing(true);
        context.beginPath();
        context.moveTo(x, y);
        setLastPoint({ x, y });
      } else if (e.button === 2) {
        // Right click
        const newDrawing: DrawingElement = {
          type: "o",
          points: [{ x, y }],
          color: penColor,
          id: `o-${Date.now()}`,
        };
        drawO(context, x, y);
        setDrawings((prev) => [...prev, newDrawing]);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const context = canvas.getContext("2d");
    if (context && lastPoint) {
      context.lineTo(x, y);
      context.stroke();
      setLastPoint({ x, y });
    }
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (isDrawing && context && lastPoint) {
      const newDrawing: DrawingElement = {
        type: "line",
        points: [lastPoint],
        color: penColor,
        id: `line-${Date.now()}`,
      };
      setDrawings((prev) => [...prev, newDrawing]);
    }

    setIsDrawing(false);
    setLastPoint(null);
  };

  const drawX = (context: CanvasRenderingContext2D, x: number, y: number) => {
    const size = 20;
    context.beginPath();
    context.moveTo(x - size, y - size);
    context.lineTo(x + size, y + size);
    context.moveTo(x + size, y - size);
    context.lineTo(x - size, y + size);
    context.stroke();
  };

  const drawO = (context: CanvasRenderingContext2D, x: number, y: number) => {
    const size = 20;
    context.beginPath();
    context.arc(x, y, size, 0, 2 * Math.PI);
    context.stroke();
  };

  const handleRightClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const context = canvas.getContext("2d");
    if (context) {
      const newDrawing: DrawingElement = {
        type: "o",
        points: [{ x, y }],
        color: penColor,
        id: `o-${Date.now()}`,
      };
      drawO(context, x, y);
      setDrawings((prev) => [...prev, newDrawing]);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (canvas && context) {
      // Clear the canvas and redraw the field background
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawFieldBackground(context);
      setDrawings([]); // Clear all drawings
    }
  };

  const drawThreeFourDefense = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const horizontalOffset = 150;
    const verticalOffset = 70;

    // Defensive Linemen
    for (let i = -1; i <= 1; i++) {
      const x = centerX + i * horizontalOffset;
      const y = centerY;
      drawO(context, x, y);
      const newDrawing: DrawingElement = {
        type: "o",
        points: [{ x, y }],
        color: penColor,
        id: `o-${Date.now()}`,
      };
      setDrawings((prev) => [...prev, newDrawing]);
    }

    // Linebackers
    const linebackerOffset = 135;
    for (let i = -2; i <= 1; i++) {
      const x = centerX + i * linebackerOffset + 65;
      const y = centerY - verticalOffset;
      drawO(context, x, y);
      const newDrawing: DrawingElement = {
        type: "o",
        points: [{ x, y }],
        color: penColor,
        id: `o-${Date.now()}`,
      };
      setDrawings((prev) => [...prev, newDrawing]);
    }
  };

  const drawOffensiveFormation = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    const centerX = canvas.width / 2;
    const linemanY = canvas.height / 2 + 50;
    const offset = 50;

    // Draw linemen as "O"
    for (let i = -2; i <= 2; i++) {
      if (i !== 0) {
        const x = centerX + i * offset;
        const y = linemanY;
        drawO(context, x, y);
        const newDrawing: DrawingElement = {
          type: "o",
          points: [{ x, y }],
          color: penColor,
          id: `o-${Date.now()}`,
        };
        setDrawings((prev) => [...prev, newDrawing]);
      }
    }

    // Draw center as "X"
    const centerXPos = centerX;
    const centerYPos = linemanY - 10;
    drawX(context, centerXPos, centerYPos);
    const newDrawing: DrawingElement = {
      type: "x",
      points: [{ x: centerXPos, y: centerYPos }],
      color: penColor,
      id: `x-${Date.now()}`,
    };
    setDrawings((prev) => [...prev, newDrawing]);
  };

  const saveCanvas = () => {
    setShowSaveModal(true);
  };

  const handleSavePlay = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        // Create a new canvas with extra space for play details
        const detailsHeight = 150;
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height + detailsHeight;
        const tempContext = tempCanvas.getContext("2d");

        if (tempContext) {
          // Fill the entire canvas with white background
          tempContext.fillStyle = "white";
          tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

          // Draw original canvas content
          tempContext.drawImage(canvas, 0, 0);

          // Add play details section
          tempContext.fillStyle = "rgba(240, 240, 240, 1)";
          tempContext.fillRect(0, canvas.height, canvas.width, detailsHeight);

          // Set text style
          tempContext.fillStyle = "black";
          tempContext.font = "16px Arial";

          // Write play details
          const details = [
            `Play Name: ${playDetails.name || "N/A"}`,
            `Formation: ${playDetails.formation || "N/A"}`,
            `Play Type: ${playDetails.type}`,
            `Notes: ${playDetails.notes || "N/A"}`,
          ];

          details.forEach((line, index) => {
            tempContext.fillText(line, 20, canvas.height + 30 + index * 30);
          });

          // Create download link with modified canvas
          const link = document.createElement("a");
          link.download = `${playDetails.name || "football-play"}.png`;
          link.href = tempCanvas.toDataURL();
          link.click();
        }
      }
      setShowSaveModal(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-black">
              Save Play Details
            </h2>
            <div className="mb-4">
              <label className="block mb-2 text-black">Play Name</label>
              <input
                type="text"
                value={playDetails.name}
                onChange={(e) =>
                  setPlayDetails((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full border rounded p-2 text-black"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-black">Formation</label>
              <input
                type="text"
                value={playDetails.formation}
                onChange={(e) =>
                  setPlayDetails((prev) => ({
                    ...prev,
                    formation: e.target.value,
                  }))
                }
                className="w-full border rounded p-2 text-black"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-black">Play Type</label>
              <select
                value={playDetails.type}
                onChange={(e) =>
                  setPlayDetails((prev) => ({
                    ...prev,
                    type: e.target.value as "run" | "pass",
                  }))
                }
                className="w-full border rounded p-2 text-black"
              >
                <option value="run">Run</option>
                <option value="pass">Pass</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-black">Notes</label>
              <textarea
                value={playDetails.notes}
                onChange={(e) =>
                  setPlayDetails((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="w-full border rounded p-2 text-black"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlay}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-2 mb-4">
        {(
          ["black", "blue", "green", "purple", "red", "orange"] as PenColor[]
        ).map((color) => (
          <button
            key={color}
            onClick={() => setPenColor(color)}
            className={`w-8 h-8 rounded-full ${
              penColor === color ? "ring-2 ring-gray-500" : ""
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={drawOffensiveFormation}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Offensive Formation
        </button>
        <button
          onClick={drawThreeFourDefense}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          3-4 Defense
        </button>
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Clear
        </button>
        <button
          onClick={saveCanvas}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Save
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onContextMenu={handleRightClick}
        className="border-2 bg-white border-gray-300"
      />

      {/* Play Details Section
      {playDetails.name && (
        <div className="mt-4 w-full max-w-[1200px] border p-4 text-black bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Play Name:</strong> {playDetails.name}
            </div>
            <div>
              <strong>Formation:</strong> {playDetails.formation}
            </div>
            <div>
              <strong>Play Type:</strong> {playDetails.type}
            </div>
          </div>
          {playDetails.notes && (
            <div className="mt-2">
              <strong>Notes:</strong> {playDetails.notes}
            </div>
          )}
        </div>
      )} */}
    </div>
  );
};
export default PlayDrawingCanvas;
