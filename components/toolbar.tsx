"use client";

import type { Tool } from "@/types";
import {
  FiMousePointer,
  FiMinus,
  FiSquare,
  FiCircle,
  FiArrowRight,
  FiType,
  FiEye,
  FiEyeOff,
  FiCopy,
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
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-3">
          Tools
        </label>
        <div className="grid grid-cols-4 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              title={tool.label}
              className={`w-12 h-12 rounded-md border flex items-center justify-center transition-colors ${
                selectedTool === tool.id
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <tool.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-3">
          Stroke Color
        </label>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onStrokeColorChange(color)}
              className={`w-8 h-8 rounded border-2 transition-colors ${
                strokeColor === color
                  ? "border-gray-400"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            Stroke Width
          </label>
          <span className="text-xs text-gray-500">{strokeWidth}px</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={strokeWidth}
          onChange={(e) => onStrokeWidthChange(Number.parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer simple-slider"
          title="Stroke Width"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-3">
          Fill Color
        </label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onFillColorChange("transparent")}
            className={`w-8 h-8 rounded border-2 bg-white transition-colors ${
              fillColor === "transparent"
                ? "border-gray-400"
                : "border-gray-200 hover:border-gray-300"
            }`}
            title="Transparent"
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-4 h-0.5 bg-red-400 rotate-45"></div>
            </div>
          </button>
          {colors.slice(0, 7).map((color) => (
            <button
              key={`fill-${color}`}
              onClick={() => onFillColorChange(color)}
              className={`w-8 h-8 rounded border-2 transition-colors ${
                fillColor === color
                  ? "border-gray-400"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-3">
          Actions
        </label>
        <div className="space-y-2">
          <button
            onClick={() => onToggleAnnotations(!showAnnotations)}
            className={`w-full px-3 py-2 rounded-md border text-sm flex items-center gap-2 transition-colors ${
              showAnnotations
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {showAnnotations ? (
              <FiEye className="w-4 h-4" />
            ) : (
              <FiEyeOff className="w-4 h-4" />
            )}
            {showAnnotations ? "Hide Annotations" : "Show Annotations"}
          </button>

          <button
            onClick={onDuplicate}
            disabled={!hasSelection}
            className={`w-full px-3 py-2 rounded-md border text-sm flex items-center gap-2 transition-colors ${
              hasSelection
                ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <FiCopy className="w-4 h-4" />
            Duplicate
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Instructions
        </label>
        <div className="text-xs text-gray-500 space-y-1 bg-gray-50 rounded-md p-3">
          {selectedTool === "hand" && (
            <>
              <p>• Drag to pan around canvas</p>
              <p>• Ctrl/Cmd + wheel to zoom</p>
              <p>• Ctrl/Cmd + 0 to reset view</p>
            </>
          )}
          {selectedTool === "text" && (
            <>
              <p>• Click canvas to add text</p>
              <p>• Double-click text to edit</p>
              <p>• Enter to save, Esc to cancel</p>
            </>
          )}
          {selectedTool === "select" && (
            <>
              <p>• Click shapes to select</p>
              <p>• Drag to move shapes</p>
              <p>• Delete key to remove</p>
            </>
          )}
          {selectedTool !== "text" &&
            selectedTool !== "select" &&
            selectedTool !== "hand" && (
              <>
                <p>• Click and drag to draw</p>
                <p>• Release to complete shape</p>
              </>
            )}
        </div>
      </div>
    </div>
  );
}
