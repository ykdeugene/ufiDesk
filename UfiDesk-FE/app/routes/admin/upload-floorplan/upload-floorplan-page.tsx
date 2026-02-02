import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useGetFloorplan,
  useUploadFloorplan,
  useSetMainFloorplan,
} from "~/api/hooks";
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
import type { DeskType, Direction } from "./types/deskiunfo.types";
import { FormProvider, useForm } from "react-hook-form";
import { Form } from "react-router";

type FloorplanFormData = {
  floorplanName: string;
  isMain: boolean;
};

export function UploadFloorplanPage() {
  const uploadFloorplan = useUploadFloorplan();
  const setMainFloorplan = useSetMainFloorplan();
  const {
    data: allFloorplans,
    isLoading: isLoadingFloorplans,
    refetch: refetchFloorplans,
  } = useGetFloorplan();

  const uploadFloorplanForm = useForm<FloorplanFormData>({
    mode: "onChange",
    defaultValues: {
      floorplanName: "",
      isMain: allFloorplans?.length === 0 ? true : false,
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedFloorplanId, setSelectedFloorplanId] = useState<string>("");

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

  // Track the selected floorplan object
  const selectedFloorplan =
    allFloorplans?.find((fp) => fp.id === selectedFloorplanId) || null;

  // Load floorplan when selection changes
  useEffect(() => {
    if (!selectedFloorplanId || !allFloorplans) return;

    const selectedFloorplan = allFloorplans.find(
      (fp) => fp.id === selectedFloorplanId,
    );

    if (!selectedFloorplan) return;

    // Update grid dimensions from selected floorplan
    setXLength(selectedFloorplan.xLength);
    setYLength(selectedFloorplan.yLength);

    // Create empty grid with the floorplan's dimensions
    const newGrid: typeof grid = Array.from(
      { length: selectedFloorplan.yLength },
      () => Array(selectedFloorplan.xLength).fill(null),
    );

    // Place desks in the grid at their coordinates
    selectedFloorplan.desks.forEach((desk) => {
      if (
        desk.y < selectedFloorplan.yLength &&
        desk.x < selectedFloorplan.xLength
      ) {
        newGrid[desk.y][desk.x] = {
          id: desk.id,
          x: desk.x,
          y: desk.y,
          hasMonitor: desk.hasMonitor,
          direction: desk.direction as Direction,
          type: desk.type as DeskType,
        };
      }
    });

    // Update grid state with new dimensions
    setGrid(newGrid);
    saveToHistory(
      newGrid,
      selectedFloorplan.xLength,
      selectedFloorplan.yLength,
    );
    toast.success(`Loaded floorplan: ${selectedFloorplan.name}`);
  }, [selectedFloorplanId, allFloorplans]);

  const handleSave = () => {
    // Check if floorplan is empty before opening modal
    const hasDesks = grid.some((row) => row.some((cell) => cell !== null));

    if (!hasDesks) {
      toast.error("Cannot save an empty floorplan");
      return;
    }

    setShowSaveModal(true);
  };

  const handleSaveConfirm = (data: FloorplanFormData) => {
    if (!data.floorplanName.trim()) {
      toast.error("Please enter a floor plan name");
      return;
    }

    console.log(data);

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
    const payload = {
      name: data.floorplanName,
      isMain: data.isMain,
      xLength: xLength,
      yLength: yLength,
      desks,
    };

    console.log("Payload for upload:", payload);

    // Upload the floorplan
    uploadFloorplan.mutate(payload, {
      onSuccess: () => {
        toast.success(`Floor plan "${data.floorplanName}" saved successfully!`);
        setShowSaveModal(false);
        uploadFloorplanForm.reset({
          floorplanName: "",
        });
        refetchFloorplans();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to save floorplan",
        );
      },
    });
  };

  const handleSaveCancel = () => {
    setShowSaveModal(false);
    uploadFloorplanForm.reset({ floorplanName: "" });
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

  const handleClearAllClick = () => {
    handleClearAll();
    setSelectedFloorplanId("");
  };

  const handleSetMainFloorplan = () => {
    if (!selectedFloorplan) {
      toast.error("Please select a floorplan first");
      return;
    }

    setMainFloorplan.mutate(selectedFloorplan.id, {
      onSuccess: () => {
        toast.success(
          `"${selectedFloorplan.name}" is now set as the main floorplan`,
        );
        refetchFloorplans();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to set main floorplan",
        );
      },
    });
  };

  return (
    <FormProvider {...uploadFloorplanForm}>
      <form onSubmit={uploadFloorplanForm.handleSubmit(handleSaveConfirm)}>
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
                    {...uploadFloorplanForm.register("floorplanName", {
                      required: true,
                    })}
                    placeholder="Enter floor plan name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleSaveCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                Edit Office Floorplan
              </h1>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="floorplan-select"
                  className="text-sm font-medium text-gray-700"
                >
                  Load Floorplan:
                </label>
                <select
                  id="floorplan-select"
                  value={selectedFloorplanId}
                  onChange={(e) => {
                    console.log(e.target.value);
                    setSelectedFloorplanId(e.target.value);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white min-w-[200px]"
                  disabled={isLoadingFloorplans}
                >
                  <option value="">Select a floorplan</option>
                  {allFloorplans?.map((floorplan) => (
                    <option key={floorplan.id} value={floorplan.id}>
                      {floorplan.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <FloorplanToolbar
              xLength={xLength}
              yLength={yLength}
              historyIndex={historyIndex}
              selectedFloorplan={selectedFloorplan}
              deskTemplates={deskTemplates}
              deskTemplatesNoMonitor={deskTemplatesNoMonitor}
              standingDeskTemplates={standingDeskTemplates}
              standingDeskTemplatesNoMonitor={standingDeskTemplatesNoMonitor}
              onXLengthChange={handleXLengthChange}
              onYLengthChange={handleYLengthChange}
              onUndo={handleUndoClick}
              onClearAll={handleClearAllClick}
              onDragStart={handleDragStart}
              onSave={handleSave}
              onDownload={handleDownload}
              onUpload={handleUpload}
              onSetMainFloorplan={handleSetMainFloorplan}
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
      </form>
    </FormProvider>
  );
}

export default UploadFloorplanPage;
