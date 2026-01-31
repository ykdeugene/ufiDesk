import { useState } from "react";
import type { DeskInfo } from "~/admin/upload-floorplan/types/deskiunfo.types";

export function useFloorplanGrid(
  saveToHistory: (
    grid: (DeskInfo | null)[][],
    xLength: number,
    yLength: number,
  ) => void,
) {
  const [xLength, setXLength] = useState(10);
  const [yLength, setYLength] = useState(10);
  const [grid, setGrid] = useState<(DeskInfo | null)[][]>(
    Array(10)
      .fill(null)
      .map(() => Array(10).fill(null)),
  );

  const updateGridDimensions = (newX: number, newY: number) => {
    const newGrid: (DeskInfo | null)[][] = Array(newY)
      .fill(null)
      .map((_, y) =>
        Array(newX)
          .fill(null)
          .map((_, x) => {
            const existingDesk = grid[y]?.[x];
            if (existingDesk) {
              return { ...existingDesk, x, y };
            }
            return null;
          }),
      );
    saveToHistory(newGrid, newX, newY);
    setGrid(newGrid);
  };

  const handleXLengthChange = (value: number) => {
    const newX = Math.min(20, Math.max(1, value));
    setXLength(newX);
    updateGridDimensions(newX, yLength);
  };

  const handleYLengthChange = (value: number) => {
    const newY = Math.min(20, Math.max(1, value));
    setYLength(newY);
    updateGridDimensions(xLength, newY);
  };

  const handleClearAll = () => {
    const emptyGrid: (DeskInfo | null)[][] = Array(yLength)
      .fill(null)
      .map(() => Array(xLength).fill(null));
    saveToHistory(emptyGrid, xLength, yLength);
    setGrid(emptyGrid);
  };

  return {
    xLength,
    yLength,
    grid,
    setGrid,
    setXLength,
    setYLength,
    handleXLengthChange,
    handleYLengthChange,
    handleClearAll,
  };
}
