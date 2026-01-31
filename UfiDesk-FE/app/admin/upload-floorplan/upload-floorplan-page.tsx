import { useFloorplanHistory } from "./hooks/useFloorplanHistory";
import { useFloorplanGrid } from "./hooks/useFloorplanGrid";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { usePaintMode } from "./hooks/usePaintMode";
import { FloorplanControls } from "./components/FloorplanControls";
import { DeskTemplates } from "./components/DeskTemplates";
import { FloorplanGrid } from "./components/FloorplanGrid";
import {
  exportFloorplanToCSV,
  importFloorplanFromCSV,
} from "./utils/floorplan-utils";
import {
  deskTemplates,
  deskTemplatesNoMonitor,
  standingDeskTemplates,
  standingDeskTemplatesNoMonitor,
} from "./constants/desk-templates";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function UploadFloorplanPage() {
  const [isUploading, setIsUploading] = useState(false);

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
    console.log("Saving floorplan:", grid);
    toast.success("Floorplan saved successfully!");
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

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Edit Office Floorplan
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-6">
            <FloorplanControls
              xLength={xLength}
              yLength={yLength}
              historyIndex={historyIndex}
              onXLengthChange={handleXLengthChange}
              onYLengthChange={handleYLengthChange}
              onUndo={handleUndoClick}
              onClearAll={handleClearAll}
            />

            <div className="w-px bg-gray-300" />

            <DeskTemplates
              deskTemplates={deskTemplates}
              deskTemplatesNoMonitor={deskTemplatesNoMonitor}
              standingDeskTemplates={standingDeskTemplates}
              standingDeskTemplatesNoMonitor={standingDeskTemplatesNoMonitor}
              onDragStart={handleDragStart}
              onSave={handleSave}
              onDownload={handleDownload}
              onUpload={handleUpload}
            />
          </div>
        </div>

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
