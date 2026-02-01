import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUploadFloorplan } from "~/api/hooks";
import { FloorplanGrid } from "./components/FloorplanGrid";
import { FloorplanToolbar } from "./components/FloorplanToolbar";
import {
  deskTemplates,
  deskTemplatesNoMonitor,
  standingDeskTemplates,
  standingDeskTemplatesNoMonitor,
} from "./constants/desk-templates";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useFloorplanGrid } from "./hooks/useFloorplanGrid";
import { useFloorplanHistory } from "./hooks/useFloorplanHistory";
import { usePaintMode } from "./hooks/usePaintMode";
import {
  exportFloorplanToCSV,
  importFloorplanFromCSV,
} from "./utils/floorplan-utils";

export function UploadFloorplanPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [floorplanName, setFloorplanName] = useState("");

  const uploadFloorplan = useUploadFloorplan();

  const { historyIndex, saveToHistory, handleUndo, applyUndo } =
    useFloorplanHistory();

  const {
    xLength,
    yLength,
    grid,
    setGrid,
    setXLength,
    setYLength,
    handleXLengthChange,
    handleYLengthChange,
    handleClearAll,
  } = useFloorplanGrid(saveToHistory);

  const { handleDragStart, handleCellDragStart, handleDragOver, handleDrop } =
    useDragAndDrop(grid, setGrid, xLength, yLength, saveToHistory);

  const {
    isPainting,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleClearCell,
  } = usePaintMode(grid, setGrid, xLength, yLength, saveToHistory);

  const handleSave = () => {
    // Check if floorplan is empty before opening modal
    const hasDesks = grid.some((row) => row.some((cell) => cell !== null));

    if (!hasDesks) {
      toast.error("Cannot save an empty floorplan");
      return;
    }

    setShowSaveModal(true);
  };

  const handleSaveConfirm = () => {
    if (!floorplanName.trim()) {
      toast.error("Please enter a floor plan name");
      return;
    }

    // Collect all desks from the grid (top to bottom, left to right)
    const desks: Array<{
      id: string;
      x: number;
      y: number;
      hasMonitor: boolean;
      direction: "up" | "down" | "left" | "right";
      type: "regular" | "standing";
    }> = [];
    let counter = 1;

    for (let y = 0; y < yLength; y++) {
      for (let x = 0; x < xLength; x++) {
        const cell = grid[y][x];
        if (cell !== null) {
          // Determine prefix based on type and monitor
          let prefix = "";
          if (cell.type === "regular") {
            prefix = cell.hasMonitor ? "RT-" : "RS-";
          } else if (cell.type === "standing") {
            prefix = cell.hasMonitor ? "ST-" : "SS-";
          }

          desks.push({
            id: `${prefix}${counter}`,
            x: cell.x,
            y: cell.y,
            hasMonitor: cell.hasMonitor,
            direction: cell.direction,
            type: cell.type,
          });

          counter++;
        }
      }
    }

    // Check if floorplan is empty
    if (desks.length === 0) {
      toast.error("Cannot save an empty floorplan");
      return;
    }

    // Upload the floorplan
    uploadFloorplan.mutate(
      {
        name: floorplanName,
        xLength,
        yLength,
        desks,
      },
      {
        onSuccess: () => {
          toast.success(`Floor plan "${floorplanName}" saved successfully!`);
          setShowSaveModal(false);
          setFloorplanName("");
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "Failed to save floorplan",
          );
        },
      },
    );
  };

  const handleSaveCancel = () => {
    setShowSaveModal(false);
    setFloorplanName("");
  };

  const handleDownload = () => {
    exportFloorplanToCSV(grid);
  };

  const handleUpload = (file: File) => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const {
          grid: newGrid,
          xLength: newX,
          yLength: newY,
        } = importFloorplanFromCSV(csvContent);

        setXLength(newX);
        setYLength(newY);
        setGrid(newGrid);
        saveToHistory(newGrid, newX, newY);
        toast.success("Floorplan uploaded successfully!");
      } catch (error) {
        toast.error("Failed to upload floorplan. Please check the CSV format.");
        console.error("Upload error:", error);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleUndoClick = () => {
    const previousState = handleUndo();
    if (previousState) {
      setGrid(JSON.parse(JSON.stringify(previousState.grid)));
      setXLength(previousState.xLength);
      setYLength(previousState.yLength);
      applyUndo();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {isUploading && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-700">Uploading...</p>
          </div>
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Save Floor Plan
            </h2>
            <div className="mb-6">
              <label
                htmlFor="floorplan-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Floor Plan Name
              </label>
              <input
                id="floorplan-name"
                type="text"
                value={floorplanName}
                onChange={(e) => setFloorplanName(e.target.value)}
                placeholder="Enter floor plan name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleSaveCancel}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Edit Office Floorplan
        </h1>

        <FloorplanToolbar
          xLength={xLength}
          yLength={yLength}
          historyIndex={historyIndex}
          deskTemplates={deskTemplates}
          deskTemplatesNoMonitor={deskTemplatesNoMonitor}
          standingDeskTemplates={standingDeskTemplates}
          standingDeskTemplatesNoMonitor={standingDeskTemplatesNoMonitor}
          onXLengthChange={handleXLengthChange}
          onYLengthChange={handleYLengthChange}
          onUndo={handleUndoClick}
          onClearAll={handleClearAll}
          onDragStart={handleDragStart}
          onSave={handleSave}
          onDownload={handleDownload}
          onUpload={handleUpload}
        />

        <FloorplanGrid
          grid={grid}
          xLength={xLength}
          isPainting={isPainting}
          onCellDragStart={handleCellDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseEnter={handleCellMouseEnter}
          onClearCell={handleClearCell}
        />
      </div>
    </div>
  );
}

export default UploadFloorplanPage;
