import type { DeskInfo, DeskType, Direction } from "./deskiunfo.types";

export type HistoryState = {
  grid: (DeskInfo | null)[][];
  xLength: number;
  yLength: number;
};

export type TemplateDesk = {
  direction: Direction;
  hasMonitor: boolean;
  type: DeskType;
  label: string;
};
