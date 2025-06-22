"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Shape, DrawingData } from "@/types";

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
  const [showLoad, setShowLoad] = useState(false);

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
      toast.error("Enter project name");
      return;
    }

    if (shapes.length === 0) {
      toast.error("Nothing to save");
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

      toast.success("Saved!");
      setDrawingName("");
      loadDrawings();
    } catch (error) {
      toast.error("Save failed");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDrawing = async (drawing: DrawingData) => {
    onLoadShapes(drawing.shapes);
    setDrawingName(drawing.name);
    setShowLoad(false);
    toast.success("Loaded");
  };

  const deleteDrawing = async (id: string) => {
    try {
      const response = await fetch(`/api/drawings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete drawing");

      toast.success("Deleted");
      loadDrawings();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  useEffect(() => {
    loadDrawings();
  }, []);

  return (
    <>
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Project name"
          value={drawingName}
          onChange={(e) => setDrawingName(e.target.value)}
          className="px-3 py-1 border rounded text-sm w-40"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              saveDrawing();
            }
          }}
        />

        <button
          onClick={saveDrawing}
          disabled={isLoading || !drawingName.trim() || shapes.length === 0}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:bg-gray-300"
        >
          Save
        </button>

        <button
          onClick={() => {
            loadDrawings();
            setShowLoad(true);
          }}
          className="px-3 py-1 border rounded text-sm"
        >
          Load
        </button>

        <button onClick={onUndo} className="px-2 py-1 border rounded text-sm">
          ↶
        </button>

        <button
          onClick={onClear}
          className="px-2 py-1 border rounded text-sm text-red-600"
        >
          Clear
        </button>
      </div>

      {showLoad && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded p-4 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Load Project</h3>
              <button
                onClick={() => setShowLoad(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : savedDrawings.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No projects found
              </div>
            ) : (
              <div className="space-y-2">
                {savedDrawings.map((drawing) => (
                  <div
                    key={drawing._id}
                    className="border rounded p-3 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">
                          {drawing.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {drawing.shapes.length} shapes
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadDrawing(drawing)}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteDrawing(drawing._id!)}
                          className="px-2 py-1 text-red-500 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
