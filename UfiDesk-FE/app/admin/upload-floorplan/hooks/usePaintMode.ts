import { useState, useEffect } from "react";
import type { DeskInfo } from "~/admin/upload-floorplan/types/deskiunfo.types";
import type { TemplateDesk } from "../types/floorplan.types";

export function usePaintMode(
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
  const [isPainting, setIsPainting] = useState(false);
  const [paintMode, setPaintMode] = useState<TemplateDesk | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  useEffect(() => {
    const handleMouseUp = () => {
      if (!isShiftPressed) {
        setIsPainting(false);
        setPaintMode(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift" && !e.repeat) {
        setIsShiftPressed(true);
        setIsPainting(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsShiftPressed(false);
        setIsPainting(false);
        setPaintMode(null);
      }
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isShiftPressed]);

  const handleCellMouseDown = (y: number, x: number, desk: DeskInfo | null) => {
    if (desk && isShiftPressed) {
      setPaintMode({
        direction: desk.direction,
        hasMonitor: desk.hasMonitor,
        type: desk.type,
        label: "",
      });
    }
  };

  const handleCellMouseEnter = (y: number, x: number) => {
    if (isPainting && paintMode && !grid[y][x]) {
      const newGrid = grid.map((row, rowIndex) =>
        row.map((cell, colIndex) =>
          rowIndex === y && colIndex === x
            ? {
                id: `desk-${Date.now()}-${Math.random()}`,
                x: colIndex,
                y: rowIndex,
                direction: paintMode.direction,
                hasMonitor: paintMode.hasMonitor,
                type: paintMode.type,
                isAvailable: true,
              }
            : cell,
        ),
      );
      saveToHistory(newGrid, xLength, yLength);
      setGrid(newGrid);
    }
  };

  const handleClearCell = (y: number, x: number, e: React.MouseEvent) => {
    if (!isPainting) {
      const newGrid = grid.map((row, rowIndex) =>
        row.map((cell, colIndex) =>
          rowIndex === y && colIndex === x ? null : cell,
        ),
      );
      saveToHistory(newGrid, xLength, yLength);
      setGrid(newGrid);
    }
  };

  return {
    isPainting,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleClearCell,
  };
}
