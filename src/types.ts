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

export interface ArcNodeData {
  id: string;
  type: 'leaf' | 'group';
  proposition?: any; // We'll use Proposition from parser
  children?: ArcNodeData[];
  relation?: string;
}

export interface SavedAnalysis {
  id: string;
  title: string;
  text?: string;
  propositions?: any[];
  strokes?: Stroke[];
  arcNodes?: ArcNodeData[];
  updatedAt: number;
}
