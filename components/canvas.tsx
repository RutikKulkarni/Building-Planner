"use client";

import type React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import type { Shape, Tool, Point, ViewState } from "@/types";
import { FiRotateCcw } from "react-icons/fi";

interface CanvasProps {
  shapes: Shape[];
  onShapesChange: (shapes: Shape[]) => void;
  selectedTool: Tool;
  selectedShapeId: string | null;
  onSelectedShapeChange: (id: string | null) => void;
  showAnnotations: boolean;
  strokeColor: string;
  strokeWidth: number;
  fillColor: string;
}

export default function Canvas({
  shapes,
  onShapesChange,
  selectedTool,
  selectedShapeId,
  onSelectedShapeChange,
  showAnnotations,
  strokeColor,
  strokeWidth,
  fillColor,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Drawing states
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [isEditingText, setIsEditingText] = useState(false);
  const [textInputPosition, setTextInputPosition] = useState<Point>({
    x: 0,
    y: 0,
  });
  const [textInputValue, setTextInputValue] = useState("");
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [viewState, setViewState] = useState<ViewState>({
    zoom: 1,
    panX: 0,
    panY: 0,
  });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });

  const screenToCanvas = useCallback(
    (screenPoint: Point): Point => {
      return {
        x: (screenPoint.x - viewState.panX) / viewState.zoom,
        y: (screenPoint.y - viewState.panY) / viewState.zoom,
      };
    },
    [viewState]
  );

  const canvasToScreen = useCallback(
    (canvasPoint: Point): Point => {
      return {
        x: canvasPoint.x * viewState.zoom + viewState.panX,
        y: canvasPoint.y * viewState.zoom + viewState.panY,
      };
    },
    [viewState]
  );

  const getMousePos = useCallback(
    (e: MouseEvent | React.MouseEvent): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const screenPoint = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };

      return screenToCanvas(screenPoint);
    },
    [screenToCanvas]
  );

  const getCanvasPosition = useCallback(
    (point: Point): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const screenPoint = canvasToScreen(point);
      const scaleX = rect.width / canvas.width;
      const scaleY = rect.height / canvas.height;

      return {
        x: screenPoint.x * scaleX,
        y: screenPoint.y * scaleY,
      };
    },
    [canvasToScreen]
  );

  const zoomIn = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.2, 5),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.2, 0.1),
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setViewState({
      zoom: 1,
      panX: 0,
      panY: 0,
    });
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
        const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(5, viewState.zoom * zoomFactor));
        const zoomRatio = newZoom / viewState.zoom;
        const newPanX = mouseX - (mouseX - viewState.panX) * zoomRatio;
        const newPanY = mouseY - (mouseY - viewState.panY) * zoomRatio;

        setViewState({
          zoom: newZoom,
          panX: newPanX,
          panY: newPanY,
        });
      }
    },
    [viewState]
  );

  const findShapeAtPoint = useCallback(
    (point: Point): Shape | null => {
      for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        if (isPointInShape(point, shape)) {
          return shape;
        }
      }
      return null;
    },
    [shapes]
  );

  const isPointInShape = (point: Point, shape: Shape): boolean => {
    switch (shape.type) {
      case "rectangle":
        return (
          point.x >= Math.min(shape.x, shape.x + shape.width) &&
          point.x <= Math.max(shape.x, shape.x + shape.width) &&
          point.y >= Math.min(shape.y, shape.y + shape.height) &&
          point.y <= Math.max(shape.y, shape.y + shape.height)
        );
      case "circle":
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        const radius = Math.abs(shape.width) / 2;
        const distance = Math.sqrt(
          Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
        );
        return distance <= radius;
      case "triangle":
        return (
          point.x >= Math.min(shape.x, shape.x + shape.width) &&
          point.x <= Math.max(shape.x, shape.x + shape.width) &&
          point.y >= Math.min(shape.y, shape.y + shape.height) &&
          point.y <= Math.max(shape.y, shape.y + shape.height)
        );
      case "line":
      case "arrow":
        const lineDistance = distanceToLine(
          point,
          { x: shape.x, y: shape.y },
          { x: shape.x + shape.width, y: shape.y + shape.height }
        );
        return lineDistance <= Math.max(5, shape.strokeWidth || 2);
      case "text":
        const textWidth = (shape.text?.length || 0) * 8 + 20;
        const textHeight = 25;
        return (
          point.x >= shape.x - 10 &&
          point.x <= shape.x + textWidth &&
          point.y >= shape.y - 20 &&
          point.y <= shape.y + textHeight
        );
      default:
        return false;
    }
  };

  const distanceToLine = (
    point: Point,
    lineStart: Point,
    lineEnd: Point
  ): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const startTextEditing = useCallback(
    (point: Point, existingShape?: Shape) => {
      const canvasPos = getCanvasPosition(point);
      setTextInputPosition(canvasPos);
      setTextInputValue(existingShape?.text || "");
      setEditingTextId(existingShape?.id || null);
      setIsEditingText(true);

      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
          textInputRef.current.select();
        }
      }, 10);
    },
    [getCanvasPosition]
  );

  const finishTextEditing = useCallback(() => {
    if (!textInputValue.trim()) {
      setIsEditingText(false);
      setEditingTextId(null);
      return;
    }

    const canvasPoint = {
      x:
        (textInputPosition.x /
          (canvasRef.current?.getBoundingClientRect().width || 1)) *
        (canvasRef.current?.width || 1),
      y:
        (textInputPosition.y /
          (canvasRef.current?.getBoundingClientRect().height || 1)) *
        (canvasRef.current?.height || 1),
    };

    const actualCanvasPoint = screenToCanvas(canvasPoint);

    if (editingTextId) {
      const updatedShapes = shapes.map((shape) => {
        if (shape.id === editingTextId) {
          return {
            ...shape,
            text: textInputValue,
            width: textInputValue.length * 8 + 20,
          };
        }
        return shape;
      });
      onShapesChange(updatedShapes);
    } else {
      const newShape: Shape = {
        id: `${Date.now()}-${Math.random()}`,
        type: "text",
        x: actualCanvasPoint.x,
        y: actualCanvasPoint.y,
        width: textInputValue.length * 8 + 20,
        height: 25,
        text: textInputValue,
        strokeColor,
        strokeWidth,
        fillColor,
      };
      onShapesChange([...shapes, newShape]);
    }

    setIsEditingText(false);
    setEditingTextId(null);
    setTextInputValue("");
  }, [
    textInputValue,
    textInputPosition,
    editingTextId,
    shapes,
    onShapesChange,
    strokeColor,
    strokeWidth,
    fillColor,
    screenToCanvas,
  ]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isEditingText) {
        finishTextEditing();
        return;
      }

      const point = getMousePos(e);

      if (selectedTool === "hand") {
        setIsPanning(true);
        setPanStart({
          x: e.clientX - viewState.panX,
          y: e.clientY - viewState.panY,
        });
        return;
      }

      if (selectedTool === "select") {
        const clickedShape = findShapeAtPoint(point);
        if (clickedShape) {
          onSelectedShapeChange(clickedShape.id);

          if (clickedShape.type === "text" && e.detail === 2) {
            startTextEditing(point, clickedShape);
            return;
          }

          setIsDragging(true);
          setDragOffset({
            x: point.x - clickedShape.x,
            y: point.y - clickedShape.y,
          });
        } else {
          onSelectedShapeChange(null);
        }
      } else if (selectedTool === "text") {
        startTextEditing(point);
      } else {
        setIsDrawing(true);
        setStartPoint(point);
        setCurrentPoint(point);
      }
    },
    [
      isEditingText,
      finishTextEditing,
      selectedTool,
      getMousePos,
      findShapeAtPoint,
      onSelectedShapeChange,
      startTextEditing,
      viewState.panX,
      viewState.panY,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setViewState((prev) => ({
          ...prev,
          panX: e.clientX - panStart.x,
          panY: e.clientY - panStart.y,
        }));
        return;
      }

      const point = getMousePos(e);
      setCurrentPoint(point);

      if (isDragging && selectedShapeId) {
        const updatedShapes = shapes.map((shape) => {
          if (shape.id === selectedShapeId) {
            return {
              ...shape,
              x: point.x - dragOffset.x,
              y: point.y - dragOffset.y,
            };
          }
          return shape;
        });
        onShapesChange(updatedShapes);
      }
    },
    [
      isPanning,
      panStart,
      isDragging,
      selectedShapeId,
      shapes,
      dragOffset,
      getMousePos,
      onShapesChange,
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (
      isDrawing &&
      startPoint &&
      currentPoint &&
      selectedTool !== "select" &&
      selectedTool !== "text" &&
      selectedTool !== "hand"
    ) {
      const width = currentPoint.x - startPoint.x;
      const height = currentPoint.y - startPoint.y;

      if (
        Math.abs(width) > 5 ||
        Math.abs(height) > 5 ||
        selectedTool === "line" ||
        selectedTool === "arrow"
      ) {
        const newShape: Shape = {
          id: `${Date.now()}-${Math.random()}`,
          type: selectedTool,
          x:
            selectedTool === "circle"
              ? startPoint.x
              : Math.min(startPoint.x, currentPoint.x),
          y:
            selectedTool === "circle"
              ? startPoint.y
              : Math.min(startPoint.y, currentPoint.y),
          width: selectedTool === "circle" ? Math.abs(width) : width,
          height: selectedTool === "circle" ? Math.abs(width) : height,
          strokeColor,
          strokeWidth,
          fillColor,
        };
        onShapesChange([...shapes, newShape]);
      }
    }

    setIsDrawing(false);
    setIsDragging(false);
    setStartPoint(null);
    setCurrentPoint(null);
  }, [
    isPanning,
    isDrawing,
    startPoint,
    currentPoint,
    selectedTool,
    shapes,
    onShapesChange,
    strokeColor,
    strokeWidth,
    fillColor,
  ]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isEditingText) {
        if (e.key === "Enter") {
          finishTextEditing();
        } else if (e.key === "Escape") {
          setIsEditingText(false);
          setEditingTextId(null);
          setTextInputValue("");
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        switch (e.key) {
          case "=":
          case "+":
            e.preventDefault();
            zoomIn();
            break;
          case "-":
            e.preventDefault();
            zoomOut();
            break;
          case "0":
            e.preventDefault();
            resetZoom();
            break;
        }
        return;
      }

      if (e.key === "Delete" && selectedShapeId) {
        const updatedShapes = shapes.filter(
          (shape) => shape.id !== selectedShapeId
        );
        onShapesChange(updatedShapes);
        onSelectedShapeChange(null);
      }
    },
    [
      isEditingText,
      finishTextEditing,
      selectedShapeId,
      shapes,
      onShapesChange,
      onSelectedShapeChange,
      zoomIn,
      zoomOut,
      resetZoom,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const drawShape = useCallback(
    (ctx: CanvasRenderingContext2D, shape: Shape, isSelected = false) => {
      ctx.strokeStyle = shape.strokeColor || "#374151";
      ctx.lineWidth = shape.strokeWidth || 2;
      ctx.fillStyle =
        shape.fillColor === "transparent"
          ? "rgba(0,0,0,0)"
          : shape.fillColor || "rgba(59, 130, 246, 0.1)";

      if (isSelected) {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = (shape.strokeWidth || 2) + 1;
      }

      switch (shape.type) {
        case "rectangle":
          ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          if (shape.fillColor !== "transparent") {
            ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
          }
          break;
        case "circle":
          const centerX = shape.x + shape.width / 2;
          const centerY = shape.y + shape.height / 2;
          const radius = Math.abs(shape.width) / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.stroke();
          if (shape.fillColor !== "transparent") {
            ctx.fill();
          }
          break;
        case "triangle":
          ctx.beginPath();
          ctx.moveTo(shape.x + shape.width / 2, shape.y);
          ctx.lineTo(shape.x, shape.y + shape.height);
          ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
          ctx.closePath();
          ctx.stroke();
          if (shape.fillColor !== "transparent") {
            ctx.fill();
          }
          break;
        case "line":
          ctx.beginPath();
          ctx.moveTo(shape.x, shape.y);
          ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
          ctx.stroke();
          break;
        case "arrow":
          ctx.beginPath();
          ctx.moveTo(shape.x, shape.y);
          ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
          ctx.stroke();

          const angle = Math.atan2(shape.height, shape.width);
          const arrowLength = 15;
          const arrowAngle = Math.PI / 6;

          ctx.beginPath();
          ctx.moveTo(shape.x + shape.width, shape.y + shape.height);
          ctx.lineTo(
            shape.x + shape.width - arrowLength * Math.cos(angle - arrowAngle),
            shape.y + shape.height - arrowLength * Math.sin(angle - arrowAngle)
          );
          ctx.moveTo(shape.x + shape.width, shape.y + shape.height);
          ctx.lineTo(
            shape.x + shape.width - arrowLength * Math.cos(angle + arrowAngle),
            shape.y + shape.height - arrowLength * Math.sin(angle + arrowAngle)
          );
          ctx.stroke();
          break;
        case "text":
          ctx.font = "16px Arial";
          ctx.fillStyle = shape.strokeColor || "#374151";

          if (isSelected) {
            ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
            const textWidth = (shape.text?.length || 0) * 8 + 20;
            ctx.fillRect(shape.x - 10, shape.y - 20, textWidth, 25);
          }

          ctx.fillStyle = shape.strokeColor || "#374151";
          ctx.fillText(shape.text || "", shape.x, shape.y);
          break;
      }

      if (isSelected && shape.type !== "text") {
        const handleSize = 6 / viewState.zoom;
        ctx.fillStyle = "#3b82f6";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1 / viewState.zoom;

        const handles = [
          { x: shape.x - handleSize / 2, y: shape.y - handleSize / 2 },
          {
            x: shape.x + shape.width - handleSize / 2,
            y: shape.y - handleSize / 2,
          },
          {
            x: shape.x + shape.width - handleSize / 2,
            y: shape.y + shape.height - handleSize / 2,
          },
          {
            x: shape.x - handleSize / 2,
            y: shape.y + shape.height - handleSize / 2,
          },
        ];

        handles.forEach((handle) => {
          ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
          ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
        });
      }

      if (isSelected && shape.type === "text") {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2 / viewState.zoom;
        ctx.setLineDash([5 / viewState.zoom, 5 / viewState.zoom]);
        const textWidth = (shape.text?.length || 0) * 8 + 20;
        ctx.strokeRect(shape.x - 10, shape.y - 20, textWidth, 25);
        ctx.setLineDash([]);
      }
    },
    [viewState.zoom]
  );

  const drawAnnotations = useCallback(
    (ctx: CanvasRenderingContext2D, shape: Shape) => {
      if (!showAnnotations || shape.type === "text") return;

      ctx.fillStyle = "#374151";
      ctx.font = `${12 / viewState.zoom}px Arial`;
      ctx.textAlign = "center";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3 / viewState.zoom;

      const width = Math.abs(shape.width);
      const height = Math.abs(shape.height);

      switch (shape.type) {
        case "rectangle":
          const widthText = `${Math.round(width)}px`;
          ctx.strokeText(
            widthText,
            shape.x + shape.width / 2,
            shape.y - 10 / viewState.zoom
          );
          ctx.fillText(
            widthText,
            shape.x + shape.width / 2,
            shape.y - 10 / viewState.zoom
          );

          ctx.save();
          ctx.translate(
            shape.x - 15 / viewState.zoom,
            shape.y + shape.height / 2
          );
          ctx.rotate(-Math.PI / 2);
          const heightText = `${Math.round(height)}px`;
          ctx.strokeText(heightText, 0, 0);
          ctx.fillText(heightText, 0, 0);
          ctx.restore();
          break;
        case "circle":
          const radius = Math.round(width / 2);
          const radiusText = `r: ${radius}px`;
          ctx.strokeText(
            radiusText,
            shape.x + shape.width / 2,
            shape.y + shape.height / 2 - 5 / viewState.zoom
          );
          ctx.fillText(
            radiusText,
            shape.x + shape.width / 2,
            shape.y + shape.height / 2 - 5 / viewState.zoom
          );
          break;
        case "triangle":
          const baseText = `${Math.round(width)}px`;
          ctx.strokeText(
            baseText,
            shape.x + shape.width / 2,
            shape.y + shape.height + 15 / viewState.zoom
          );
          ctx.fillText(
            baseText,
            shape.x + shape.width / 2,
            shape.y + shape.height + 15 / viewState.zoom
          );
          break;
        case "line":
        case "arrow":
          const length = Math.round(
            Math.sqrt(shape.width * shape.width + shape.height * shape.height)
          );
          const midX = shape.x + shape.width / 2;
          const midY = shape.y + shape.height / 2;
          const lengthText = `${length}px`;
          ctx.strokeText(lengthText, midX, midY - 10 / viewState.zoom);
          ctx.fillText(lengthText, midX, midY - 10 / viewState.zoom);
          break;
      }
    },
    [showAnnotations, viewState.zoom]
  );

  const drawPreview = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (
        !isDrawing ||
        !startPoint ||
        !currentPoint ||
        selectedTool === "select" ||
        selectedTool === "text" ||
        selectedTool === "hand"
      )
        return;

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.fillStyle = fillColor === "transparent" ? "rgba(0,0,0,0)" : fillColor;
      ctx.setLineDash([5 / viewState.zoom, 5 / viewState.zoom]);

      const width = currentPoint.x - startPoint.x;
      const height = currentPoint.y - startPoint.y;

      switch (selectedTool) {
        case "rectangle":
          ctx.strokeRect(startPoint.x, startPoint.y, width, height);
          break;
        case "circle":
          const centerX = startPoint.x + width / 2;
          const centerY = startPoint.y + height / 2;
          const radius = Math.abs(width) / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case "triangle":
          ctx.beginPath();
          ctx.moveTo(startPoint.x + width / 2, startPoint.y);
          ctx.lineTo(startPoint.x, startPoint.y + height);
          ctx.lineTo(startPoint.x + width, startPoint.y + height);
          ctx.closePath();
          ctx.stroke();
          break;
        case "line":
          ctx.beginPath();
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(currentPoint.x, currentPoint.y);
          ctx.stroke();
          break;
        case "arrow":
          ctx.beginPath();
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(currentPoint.x, currentPoint.y);
          ctx.stroke();

          const angle = Math.atan2(height, width);
          const arrowLength = 15;
          const arrowAngle = Math.PI / 6;

          ctx.beginPath();
          ctx.moveTo(currentPoint.x, currentPoint.y);
          ctx.lineTo(
            currentPoint.x - arrowLength * Math.cos(angle - arrowAngle),
            currentPoint.y - arrowLength * Math.sin(angle - arrowAngle)
          );
          ctx.moveTo(currentPoint.x, currentPoint.y);
          ctx.lineTo(
            currentPoint.x - arrowLength * Math.cos(angle + arrowAngle),
            currentPoint.y - arrowLength * Math.sin(angle + arrowAngle)
          );
          ctx.stroke();
          break;
      }

      ctx.setLineDash([]);
    },
    [
      isDrawing,
      startPoint,
      currentPoint,
      selectedTool,
      strokeColor,
      strokeWidth,
      fillColor,
      viewState.zoom,
    ]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(viewState.panX, viewState.panY);
    ctx.scale(viewState.zoom, viewState.zoom);
    ctx.strokeStyle = "#f3f4f6";
    ctx.lineWidth = 0.5 / viewState.zoom;
    const gridSize = 20;
    const startX =
      Math.floor(-viewState.panX / viewState.zoom / gridSize) * gridSize;
    const startY =
      Math.floor(-viewState.panY / viewState.zoom / gridSize) * gridSize;
    const endX = startX + canvas.width / viewState.zoom + gridSize;
    const endY = startY + canvas.height / viewState.zoom + gridSize;

    for (let x = startX; x < endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    for (let y = startY; y < endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
    shapes.forEach((shape) => {
      const isSelected = shape.id === selectedShapeId;
      drawShape(ctx, shape, isSelected);
      drawAnnotations(ctx, shape);
    });

    drawPreview(ctx);

    ctx.restore();
  }, [
    shapes,
    selectedShapeId,
    drawShape,
    drawAnnotations,
    drawPreview,
    viewState,
  ]);

  const getCursor = () => {
    if (selectedTool === "hand") return "grab";
    if (isPanning) return "grabbing";
    if (selectedTool === "select") return "default";
    if (selectedTool === "text") return "text";
    return "crosshair";
  };

  return (
    <div className="w-full h-full border border-gray-300 bg-white relative">
      <div className="absolute top-2 right-2 bg-white border border-gray-300 text-xs">
        <button
          onClick={zoomIn}
          className="px-2 py-1 border-b border-gray-300 hover:bg-gray-100"
        >
          +
        </button>
        <div className="px-2 py-1 text-center border-b border-gray-300">
          {Math.round(viewState.zoom * 100)}%
        </div>
        <button
          onClick={zoomOut}
          className="px-2 py-1 border-b border-gray-300 hover:bg-gray-100"
        >
          -
        </button>
        <button
          onClick={resetZoom}
          className="px-2 py-1 hover:bg-gray-100"
          title="Reset zoom"
          aria-label="Reset zoom"
        >
          <FiRotateCcw />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          cursor: getCursor(),
          touchAction: "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />

      {isEditingText && (
        <input
          ref={textInputRef}
          type="text"
          value={textInputValue}
          onChange={(e) => setTextInputValue(e.target.value)}
          onBlur={finishTextEditing}
          className="absolute bg-white border-2 border-blue-500 px-2 py-1 text-sm"
          style={{
            left: textInputPosition.x,
            top: textInputPosition.y - 25,
            minWidth: "100px",
          }}
          placeholder="Enter text..."
        />
      )}
    </div>
  );
}
