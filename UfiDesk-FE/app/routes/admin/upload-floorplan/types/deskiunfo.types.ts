export enum Direction {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
}

export enum DeskType {
  Regular = "regular",
  Standing = "standing",
}

export interface DeskInfo {
  id: string;
  x: number;
  y: number;
  direction: Direction;
  hasMonitor: boolean;
  type: DeskType;
  isAvailable: boolean;
}
