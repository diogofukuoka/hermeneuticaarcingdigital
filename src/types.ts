export interface Point {
  x: number;
  y: number;
  pressure: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export interface SavedAnalysis {
  id: string;
  title: string;
  text?: string;
  strokes?: Stroke[];
  updatedAt: number;
}
