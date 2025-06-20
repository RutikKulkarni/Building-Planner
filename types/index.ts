export type Tool =
  | "select"
  | "line"
  | "rectangle"
  | "circle"
  | "triangle"
  | "arrow"
  | "text"
  | "hand";

export interface Point {
  x: number;
  y: number;
}

export interface Shape {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  text?: string;
}

export interface DrawingData {
  _id?: string;
  name: string;
  shapes: Shape[];
  createdAt: string;
  updatedAt?: string;
}

export interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
}
