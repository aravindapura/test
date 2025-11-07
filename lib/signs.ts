export interface FootSign {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
}

export interface FootSignData {
  signs: FootSign[];
}

export interface LoadedSigns {
  signs: FootSign[];
  sourcePath: string;
}
