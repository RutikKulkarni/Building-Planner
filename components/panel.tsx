"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Shape, DrawingData } from "@/types";
import { FiSave, FiFolder, FiTrash2, FiRotateCcw, FiX } from "react-icons/fi";
import { BiUndo } from "react-icons/bi";

interface PanelProps {
  shapes: Shape[];
  onLoadShapes: (shapes: Shape[]) => void;
  onClear: () => void;
  onUndo: () => void;
}

export default function Panel({
  shapes,
  onLoadShapes,
  onClear,
  onUndo,
}: PanelProps) {
  const [drawingName, setDrawingName] = useState("");
  const [savedDrawings, setSavedDrawings] = useState<DrawingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);

  const loadDrawings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/drawings");
      if (!response.ok) throw new Error("Failed to load drawings");
      const drawings = await response.json();
      setSavedDrawings(drawings);
    } catch (error) {
      toast.error("Failed to load drawings");
    } finally {
      setIsLoading(false);
    }
  };

  const saveDrawing = async () => {
    if (!drawingName.trim()) {
      toast.error("Please enter a drawing name");
      return;
    }

    if (shapes.length === 0) {
      toast.error("Cannot save empty drawing");
      return;
    }

    try {
      setIsLoading(true);
      const drawingData: DrawingData = {
        name: drawingName,
        shapes: shapes,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch("/api/drawings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(drawingData),
      });

      if (!response.ok) throw new Error("Failed to save drawing");

      toast.success("Drawing saved successfully!");
      setDrawingName("");
      loadDrawings();
    } catch (error) {
      toast.error("Failed to save drawing");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDrawing = async (drawing: DrawingData) => {
    onLoadShapes(drawing.shapes);
    setDrawingName(drawing.name);
    setIsLoadDialogOpen(false);
    toast.success(`Loaded drawing: ${drawing.name}`);
  };

  const deleteDrawing = async (id: string) => {
    try {
      const response = await fetch(`/api/drawings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete drawing");

      toast.success("Drawing deleted successfully");
      loadDrawings();
    } catch (error) {
      toast.error("Failed to delete drawing");
    }
  };

  useEffect(() => {
    loadDrawings();
  }, []);

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Project name..."
            value={drawingName}
            onChange={(e) => setDrawingName(e.target.value)}
            className="w-48 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                saveDrawing();
              }
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={saveDrawing}
            disabled={isLoading || !drawingName.trim() || shapes.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <FiSave className="w-4 h-4" />
            Save
          </button>

          <button
            onClick={() => {
              loadDrawings();
              setIsLoadDialogOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-sm"
          >
            <FiFolder className="w-4 h-4" />
            Load
          </button>

          <button
            title="Undo"
            onClick={onUndo}
            className="flex items-center gap-2 px-3 py-2 bg-white text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-sm"
          >
            <BiUndo className="w-4 h-4" />
          </button>

          <button
            title="Clear"
            onClick={onClear}
            className="flex items-center gap-2 px-3 py-2 bg-white text-red-600 border border-gray-200 rounded-md hover:bg-red-50 transition-colors text-sm"
          >
            <FiRotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoadDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Load Drawing
              </h2>
              <button
                title="Close"
                onClick={() => setIsLoadDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-gray-500">Loading drawings...</div>
                </div>
              ) : savedDrawings.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-gray-500">No saved drawings found</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedDrawings.map((drawing) => (
                    <div
                      key={drawing._id}
                      className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {drawing.name}
                          </h3>
                          <div className="text-sm text-gray-500 mt-1">
                            {drawing.shapes.length} shapes •{" "}
                            {new Date(drawing.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => loadDrawing(drawing)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Load
                          </button>
                          <button
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDrawing(drawing._id!);
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
