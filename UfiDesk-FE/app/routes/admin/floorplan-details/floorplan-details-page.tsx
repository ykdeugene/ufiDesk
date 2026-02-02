import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useGetMainFloorplan,
  useGetDesksByFloorplan,
  useUpdateDeskDetails,
} from "~/api/hooks";
import { RegularDeskIcon } from "../upload-floorplan/components/RegularDesk";
import { StandingDeskIcon } from "../upload-floorplan/components/StandingDesk";
import { Direction } from "../upload-floorplan/types/deskiunfo.types";
import type { Desk } from "~/api/hooks/useFloorplan";

interface DeskDetailsFormData {
  deskId: string;
  blockStart: string;
  blockEnd: string;
  description: string;
}

export function FloorplanDetails() {
  const { data: mainFloorplan, isLoading, error } = useGetMainFloorplan();
  const { data: desksData, refetch: refetchDesks } = useGetDesksByFloorplan();
  const updateDeskDetails = useUpdateDeskDetails();
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [showIcons, setShowIcons] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DeskDetailsFormData>({
    defaultValues: {
      deskId: "",
      blockStart: "",
      blockEnd: "",
      description: "",
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading main floorplan...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">
          Error loading floorplan:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  if (!mainFloorplan) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">No main floorplan set</div>
      </div>
    );
  }

  const cellSize = 60;
  const gridWidth = mainFloorplan.xLength * cellSize;
  const gridHeight = mainFloorplan.yLength * cellSize;

  // Convert direction string to Direction enum
  const getDirectionEnum = (direction: string): Direction => {
    switch (direction.toLowerCase()) {
      case "up":
        return Direction.Up;
      case "down":
        return Direction.Down;
      case "left":
        return Direction.Left;
      case "right":
        return Direction.Right;
      default:
        return Direction.Up;
    }
  };

  const handleDeskClick = (desk: Desk) => {
    setSelectedDesk(desk);

    // Find matching desk data
    const deskData = desksData?.find((d) => d.deskId === desk.id);

    if (deskData) {
      setValue("deskId", desk.id);
      setValue("blockStart", deskData.blockStart || "");
      setValue("blockEnd", deskData.blockEnd || "");
      setValue("description", deskData.description || "");
    } else {
      // Clear fields if no data found
      setValue("deskId", desk.id);
      setValue("blockStart", "");
      setValue("blockEnd", "");
      setValue("description", "");
    }
  };

  const onSubmit = async (data: DeskDetailsFormData) => {
    try {
      await updateDeskDetails.mutateAsync({
        deskId: data.deskId,
        description: data.description,
        blockStart: data.blockStart || null,
        blockEnd: data.blockEnd || null,
      });
      toast.success("Desk details updated successfully");
      refetchDesks();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update desk details",
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Half - Floorplan Display */}
      <div className="w-1/2 flex flex-col items-center p-8 border-r border-gray-300">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {mainFloorplan.name}
          </h2>
          <p className="text-sm text-gray-600">
            Dimensions: {mainFloorplan.xLength} x {mainFloorplan.yLength}
          </p>
        </div>

        {/* Grid Container */}
        <div
          className="relative bg-white border-2 border-gray-400 shadow-lg"
          style={{
            width: `${gridWidth}px`,
            height: `${gridHeight}px`,
          }}
        >
          {/* Grid Lines */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: gridWidth, height: gridHeight }}
          >
            {/* Vertical lines */}
            {Array.from({ length: mainFloorplan.xLength + 1 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * cellSize}
                y1={0}
                x2={i * cellSize}
                y2={gridHeight}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            {/* Horizontal lines */}
            {Array.from({ length: mainFloorplan.yLength + 1 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={i * cellSize}
                x2={gridWidth}
                y2={i * cellSize}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
          </svg>

          {/* Desks */}
          {mainFloorplan.desks.map((desk) => (
            <div
              key={desk.id}
              className={`absolute cursor-pointer transition-all ${
                selectedDesk?.id === desk.id
                  ? "ring-4 ring-blue-500 scale-105"
                  : "hover:ring-2 hover:ring-blue-300"
              }`}
              style={{
                left: `${desk.x * cellSize}px`,
                top: `${desk.y * cellSize}px`,
                width: `${cellSize}px`,
                height: `${cellSize}px`,
              }}
              onClick={() => handleDeskClick(desk)}
            >
              {showIcons ? (
                // Show desk icons
                desk.type === "regular" ? (
                  <RegularDeskIcon
                    size={cellSize}
                    hasMonitor={desk.hasMonitor}
                    direction={getDirectionEnum(desk.direction)}
                  />
                ) : (
                  <StandingDeskIcon
                    size={cellSize}
                    hasMonitor={desk.hasMonitor}
                    direction={getDirectionEnum(desk.direction)}
                  />
                )
              ) : (
                // Show desk IDs
                <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-800">
                  {desk.id}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Toggle Button - Bottom Right */}
        <div className="mt-4 flex items-center justify-end gap-3">
          <span className="text-sm font-medium text-gray-700">Desk IDs</span>
          <button
            onClick={() => setShowIcons(!showIcons)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              showIcons ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                showIcons ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-gray-700">Desk Icons</span>
        </div>
      </div>

      {/* Right Half - Desk Details */}
      <div className="w-1/2 flex flex-col p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Desk Details</h2>

        {selectedDesk ? (
          // Desk Details Card
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedDesk.id}
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Type:</span>
                <span className="text-gray-800 capitalize bg-gray-100 px-3 py-1 rounded">
                  {selectedDesk.type === "regular"
                    ? "Regular Desk"
                    : "Standing Desk"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Has Monitor:</span>
                <span
                  className={`px-3 py-1 rounded font-medium ${
                    selectedDesk.hasMonitor
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedDesk.hasMonitor ? "Yes" : "No"}
                </span>
              </div>

              {/* Block Start and Block End */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-gray-600 font-medium mb-1 text-sm">
                    Block Start:
                  </label>
                  <input
                    type="date"
                    {...register("blockStart")}
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    style={{
                      colorScheme: "light",
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-600 font-medium mb-1 text-sm">
                    Block End:
                  </label>
                  <input
                    type="date"
                    {...register("blockEnd")}
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    style={{
                      colorScheme: "light",
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="text-gray-600 font-medium mb-1 text-sm">
                  Description:
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-black"
                  placeholder="Enter desk description..."
                />
              </div>

              {/* Hidden field for deskId */}
              <input type="hidden" {...register("deskId")} />

              {/* Save Button */}
              <div className="pt-2">
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={updateDeskDetails.isPending}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {updateDeskDetails.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 text-lg">
              Click on a desk to view its details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FloorplanDetails;
