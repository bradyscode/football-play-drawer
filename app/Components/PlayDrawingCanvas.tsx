"use client";

import React, { useRef, useState, useEffect } from "react";

type PenColor = "black" | "blue" | "green" | "purple" | "red" | "orange";

const PlayDrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState<PenColor>("black");
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
    null
  );

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
    const leftHashX = fieldWidth / 3; // Move further in
    const rightHashX = (fieldWidth * 2) / 3; // Move further in

    // Vertical hash marks
    context.beginPath(); // Start a new path to prevent double drawing
    context.strokeStyle = "rgba(0, 0, 0, 0.3)"; // Slightly transparent
    context.setLineDash([10, 10]); // Dashed line

    // Left hash mark
    context.moveTo(leftHashX, 0);
    context.lineTo(leftHashX, fieldHeight);

    // Right hash mark
    context.moveTo(rightHashX, 0);
    context.lineTo(rightHashX, fieldHeight);

    context.stroke();
    context.setLineDash([]); // Reset to solid line
    context.strokeStyle = "rgba(0, 0, 0, 1)"; //reset to solid line
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
        drawO(context, x, y);
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
      drawO(context, x, y);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (canvas && context) {
      // Clear the canvas and redraw the field background
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawFieldBackground(context);
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
      drawO(context, centerX + i * horizontalOffset, centerY);
    }

    // Linebackers
    const linebackerOffset = 135;
    for (let i = -2; i <= 1; i++) {
      drawO(
        context,
        centerX + i * linebackerOffset + 65,
        centerY - verticalOffset
      );
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
        drawO(context, centerX + i * offset, linemanY);
      }
    }

    // Draw center as "X"
    drawX(context, centerX, linemanY - 10);
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.download = "football-play.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
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
    </div>
  );
};

export default PlayDrawingCanvas;
