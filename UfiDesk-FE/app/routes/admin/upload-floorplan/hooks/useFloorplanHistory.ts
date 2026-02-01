import { useState, useEffect } from "react";
import type { HistoryState } from "../types/floorplan.types";
import type { DeskInfo } from "../types/deskiunfo.types";

export function useFloorplanHistory() {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = (
    newGrid: (DeskInfo | null)[][],
    newX: number,
    newY: number,
  ) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      grid: JSON.parse(JSON.stringify(newGrid)),
      xLength: newX,
      yLength: newY,
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      return history[historyIndex - 1];
    }
    return null;
  };

  const applyUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Handle keyboard shortcuts (Ctrl+Z for undo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        applyUndo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [historyIndex, history]);

  return {
    history,
    historyIndex,
    saveToHistory,
    handleUndo,
    applyUndo,
  };
}
