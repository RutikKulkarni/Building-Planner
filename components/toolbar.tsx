"use client";

import type { Tool } from "@/types";
import {
  FiArrowRight,
  FiCircle,
  FiMinus,
  FiMousePointer,
  FiSquare,
  FiType,
} from "react-icons/fi";
import { IoTriangleOutline } from "react-icons/io5";
import { PiHandFill } from "react-icons/pi";

interface ToolbarProps {
  selectedTool: Tool;
  onToolChange: (tool: Tool) => void;
  showAnnotations: boolean;
  onToggleAnnotations: (show: boolean) => void;
  strokeColor: string;
  onStrokeColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  fillColor: string;
  onFillColorChange: (color: string) => void;
  onDuplicate: () => void;
  hasSelection: boolean;
}

export default function Toolbar({
  selectedTool,
  onToolChange,
  showAnnotations,
  onToggleAnnotations,
  strokeColor,
  onStrokeColorChange,
  strokeWidth,
  onStrokeWidthChange,
  fillColor,
  onFillColorChange,
  onDuplicate,
  hasSelection,
}: ToolbarProps) {
  const tools = [
    { id: "select" as Tool, icon: FiMousePointer, label: "Select" },
    { id: "hand" as Tool, icon: PiHandFill, label: "Hand (Pan)" },
    { id: "line" as Tool, icon: FiMinus, label: "Line" },
    { id: "rectangle" as Tool, icon: FiSquare, label: "Rectangle" },
    { id: "circle" as Tool, icon: FiCircle, label: "Circle" },
    { id: "triangle" as Tool, icon: IoTriangleOutline, label: "Triangle" },
    { id: "arrow" as Tool, icon: FiArrowRight, label: "Arrow" },
    { id: "text" as Tool, icon: FiType, label: "Text" },
  ];

  const colors = [
    "#374151",
    "#ef4444",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#000000",
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium mb-2">Tools</div>
        <div className="grid grid-cols-4 gap-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              title={tool.label}
              className={`w-10 h-10 border text-sm ${
                selectedTool === tool.id
                  ? "bg-blue-100 border-blue-300"
                  : "bg-white border-gray-300 hover:bg-gray-50"
              }`}
            >
              <tool.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Stroke Color</div>
        <div className="grid grid-cols-4 gap-1">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onStrokeColorChange(color)}
              className={`w-6 h-6 border ${
                strokeColor === color ? "border-gray-600" : "border-gray-300"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">Width</div>
          <div className="text-xs text-gray-500">{strokeWidth}px</div>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={strokeWidth}
          onChange={(e) => onStrokeWidthChange(Number.parseInt(e.target.value))}
          className="w-full"
          title="Stroke Width"
        />
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Fill Color</div>
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => onFillColorChange("transparent")}
            className={`w-6 h-6 border bg-white ${
              fillColor === "transparent"
                ? "border-gray-600"
                : "border-gray-300"
            }`}
            title="None"
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-3 h-0.5 bg-red-400 rotate-45"></div>
            </div>
          </button>
          {colors.slice(0, 7).map((color) => (
            <button
              key={`fill-${color}`}
              onClick={() => onFillColorChange(color)}
              className={`w-6 h-6 border ${
                fillColor === color ? "border-gray-600" : "border-gray-300"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Actions</div>
        <div className="space-y-1">
          <button
            onClick={() => onToggleAnnotations(!showAnnotations)}
            className={`w-full px-2 py-1 border text-sm ${
              showAnnotations
                ? "bg-blue-100 border-blue-300"
                : "bg-white border-gray-300 hover:bg-gray-50"
            }`}
          >
            {showAnnotations ? "Hide Labels" : "Show Labels"}
          </button>

          <button
            onClick={onDuplicate}
            disabled={!hasSelection}
            className={`w-full px-2 py-1 border text-sm ${
              hasSelection
                ? "bg-white border-gray-300 hover:bg-gray-50"
                : "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
            }`}
          >
            Copy
          </button>
        </div>
      </div>

      <div>
        <div className="text-sm font-medium mb-1">Help</div>
        <div className="text-xs text-gray-500 bg-gray-50 p-2 space-y-1">
          {selectedTool === "hand" && (
            <>
              <div>• Drag to pan</div>
              <div>• Ctrl+wheel to zoom</div>
            </>
          )}
          {selectedTool === "text" && (
            <>
              <div>• Click to add text</div>
              <div>• Double-click to edit</div>
            </>
          )}
          {selectedTool === "select" && (
            <>
              <div>• Click to select</div>
              <div>• Drag to move</div>
              <div>• Delete key to remove</div>
            </>
          )}
          {selectedTool !== "text" &&
            selectedTool !== "select" &&
            selectedTool !== "hand" && (
              <>
                <div>• Click and drag</div>
                <div>• Release to finish</div>
              </>
            )}
        </div>
      </div>
    </div>
  );
}
