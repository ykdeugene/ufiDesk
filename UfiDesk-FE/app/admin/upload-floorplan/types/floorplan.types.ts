import {
  Direction,
  type DeskInfo,
  DeskType,
} from "~/admin/upload-floorplan/types/deskiunfo.types";

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
