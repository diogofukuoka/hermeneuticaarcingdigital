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

export interface ArcNode {
  type: 'proposition' | 'relation';
  id?: string;
  text?: string;
  relationId?: string;
  relationName?: string;
  mainIndex?: number;
  children?: ArcNode[];
}

export interface SavedAnalysis {
  id: string;
  title: string;
  text?: string;
  strokes?: Stroke[];
  updatedAt: number;
}
