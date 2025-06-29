"use client";

import { useState } from "react";
import { Toaster } from "react-hot-toast";
import Canvas from "@/components/canvas";
import Toolbar from "@/components/toolbar";
import Panel from "@/components/panel";
import type { Shape, Tool } from "@/types";

export default function BuildingPlanner() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [strokeColor, setStrokeColor] = useState("#374151");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillColor, setFillColor] = useState("transparent");

  const handleClearCanvas = () => {
    setShapes([]);
    setSelectedShapeId(null);
  };

  const handleUndo = () => {
    if (shapes.length > 0) {
      setShapes(shapes.slice(0, -1));
    }
  };

  const handleDuplicate = () => {
    if (selectedShapeId) {
      const selectedShape = shapes.find((s) => s.id === selectedShapeId);
      if (selectedShape) {
        const newShape: Shape = {
          ...selectedShape,
          id: `${Date.now()}-${Math.random()}`,
          x: selectedShape.x + 20,
          y: selectedShape.y + 20,
        };
        setShapes([...shapes, newShape]);
        setSelectedShapeId(newShape.id);
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white border-b">
          <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-3">
            <h1 className="text-lg font-medium">Building Planner</h1>
            <Panel
              shapes={shapes}
              onLoadShapes={setShapes}
              onClear={handleClearCanvas}
              onUndo={handleUndo}
            />
          </div>
        </header>

        <div className="flex max-w-7xl mx-auto p-4 gap-4">
          <div className="w-60">
            <div className="bg-white border p-3">
              <Toolbar
                selectedTool={selectedTool}
                onToolChange={setSelectedTool}
                showAnnotations={showAnnotations}
                onToggleAnnotations={setShowAnnotations}
                strokeColor={strokeColor}
                onStrokeColorChange={setStrokeColor}
                strokeWidth={strokeWidth}
                onStrokeWidthChange={setStrokeWidth}
                fillColor={fillColor}
                onFillColorChange={setFillColor}
                onDuplicate={handleDuplicate}
                hasSelection={!!selectedShapeId}
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white border h-[calc(100vh-140px)]">
              <Canvas
                shapes={shapes}
                onShapesChange={setShapes}
                selectedTool={selectedTool}
                selectedShapeId={selectedShapeId}
                onSelectedShapeChange={setSelectedShapeId}
                showAnnotations={showAnnotations}
                strokeColor={strokeColor}
                strokeWidth={strokeWidth}
                fillColor={fillColor}
              />
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </>
  );
}
