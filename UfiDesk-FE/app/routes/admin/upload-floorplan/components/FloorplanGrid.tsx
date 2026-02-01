import { RegularDeskIcon } from "./RegularDesk";
import { StandingDeskIcon } from "./StandingDesk";
import { DeskType, type DeskInfo } from "../types/deskiunfo.types";

interface FloorplanGridProps {
  grid: (DeskInfo | null)[][];
  xLength: number;
  isPainting: boolean;
  onCellDragStart: (y: number, x: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (y: number, x: number) => void;
  onCellMouseDown: (y: number, x: number, desk: DeskInfo | null) => void;
  onCellMouseEnter: (y: number, x: number) => void;
  onClearCell: (y: number, x: number, e: React.MouseEvent) => void;
}

export function FloorplanGrid({
  grid,
  xLength,
  isPainting,
  onCellDragStart,
  onDragOver,
  onDrop,
  onCellMouseDown,
  onCellMouseEnter,
  onClearCell,
}: FloorplanGridProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex justify-center">
      <div
        className="inline-grid gap-1 p-4 bg-gray-50 rounded"
        style={{
          gridTemplateColumns: `repeat(${xLength}, 58px)`,
        }}
      >
        {grid.map((row, y) =>
          row.map((desk, x) => (
            <div
              key={`${y}-${x}`}
              draggable={!!desk}
              onDragStart={(e) => {
                if (desk) {
                  onCellDragStart(y, x);
                } else {
                  e.preventDefault();
                }
              }}
              className={`w-[58px] h-[58px] border-2 border-gray-300 bg-white rounded flex items-center justify-center hover:border-blue-400 hover:bg-gray-50 transition-colors relative group ${
                desk ? "cursor-move" : "cursor-pointer"
              }`}
              onDragOver={onDragOver}
              onDrop={() => onDrop(y, x)}
              onMouseDown={() => onCellMouseDown(y, x, desk)}
              onMouseEnter={() => onCellMouseEnter(y, x)}
              onClick={(e) => desk && onClearCell(y, x, e)}
            >
              {desk && (
                <>
                  {desk.type === DeskType.Standing ? (
                    <StandingDeskIcon
                      size={48}
                      strokeColor="#374151"
                      bgColor="transparent"
                      direction={desk.direction}
                      hasMonitor={desk.hasMonitor}
                    />
                  ) : (
                    <RegularDeskIcon
                      size={48}
                      strokeColor="#374151"
                      bgColor="transparent"
                      direction={desk.direction}
                      hasMonitor={desk.hasMonitor}
                    />
                  )}
                  <div className="absolute inset-0 bg-gray-400 bg-opacity-0 group-hover:bg-opacity-30 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-xs text-gray-900 font-semibold">
                      {isPainting ? "Paint" : "Clear"}
                    </span>
                  </div>
                </>
              )}
            </div>
          )),
        )}
      </div>
    </div>
  );
}
