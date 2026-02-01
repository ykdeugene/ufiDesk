import { useState } from "react";

import type { TemplateDesk } from "../types/floorplan.types";
import type { DeskInfo } from "../types/deskiunfo.types";

export function useDragAndDrop(
  grid: (DeskInfo | null)[][],
  setGrid: (grid: (DeskInfo | null)[][]) => void,
  xLength: number,
  yLength: number,
  saveToHistory: (
    grid: (DeskInfo | null)[][],
    xLength: number,
    yLength: number,
  ) => void,
) {
  const [draggedTemplate, setDraggedTemplate] = useState<TemplateDesk | null>(
    null,
  );
  const [draggedFromCell, setDraggedFromCell] = useState<{
    y: number;
    x: number;
  } | null>(null);

  const handleDragStart = (template: TemplateDesk) => {
    setDraggedTemplate(template);
    setDraggedFromCell(null);
  };

  const handleCellDragStart = (y: number, x: number) => {
    setDraggedFromCell({ y, x });
    setDraggedTemplate(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (y: number, x: number) => {
    if (draggedTemplate || draggedFromCell) {
      const newGrid = grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (
            draggedFromCell &&
            rowIndex === draggedFromCell.y &&
            colIndex === draggedFromCell.x
          ) {
            return null;
          }
          if (rowIndex === y && colIndex === x) {
            if (draggedTemplate) {
              return {
                id: `desk-${Date.now()}-${Math.random()}`,
                x: colIndex,
                y: rowIndex,
                direction: draggedTemplate.direction,
                hasMonitor: draggedTemplate.hasMonitor,
                type: draggedTemplate.type,
                isAvailable: true,
              };
            } else if (draggedFromCell) {
              const movedDesk = grid[draggedFromCell.y][draggedFromCell.x];
              if (movedDesk) {
                return { ...movedDesk, x: colIndex, y: rowIndex };
              }
            }
          }
          return cell;
        }),
      );
      saveToHistory(newGrid, xLength, yLength);
      setGrid(newGrid);

      setDraggedTemplate(null);
      setDraggedFromCell(null);
    }
  };

  return {
    draggedTemplate,
    draggedFromCell,
    handleDragStart,
    handleCellDragStart,
    handleDragOver,
    handleDrop,
  };
}
