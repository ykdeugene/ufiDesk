import { RegularDeskIcon } from "~/routes/admin/upload-floorplan/components/RegularDesk";
import { StandingDeskIcon } from "~/routes/admin/upload-floorplan/components/StandingDesk";
import { Direction } from "~/routes/admin/upload-floorplan/types/deskiunfo.types";
import type { Desk } from "~/api/hooks/useFloorplan";
import { useState } from "react";

interface FloorplanGridProps {
  mainFloorplan: {
    name: string;
    xLength: number;
    yLength: number;
    desks: Desk[];
  };
  selectedDesks: Desk[];
  onDeskClick: (desk: Desk, event: React.MouseEvent) => void;
  showIcons: boolean;
  setShowIcons: (show: boolean) => void;
}

export function FloorplanGrid({
  mainFloorplan,
  selectedDesks,
  onDeskClick,
  showIcons,
  setShowIcons,
}: FloorplanGridProps) {
  const [zoom, setZoom] = useState(1);
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

  return (
    <div className="w-1/2 flex flex-col items-center p-8 border-r border-gray-300">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {mainFloorplan.name}
        </h2>
        <p className="text-sm text-gray-600">
          Dimensions: {mainFloorplan.xLength} x {mainFloorplan.yLength}
        </p>
      </div>

      {/* Scrollable Container */}
      <div className="overflow-auto max-h-[600px] max-w-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Zoom Wrapper */}
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center",
            width: `${gridWidth}px`,
            height: `${gridHeight}px`,
          }}
        >
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
                  selectedDesks.some((d) => d.id === desk.id)
                    ? "ring-4 ring-blue-500 scale-90"
                    : "hover:ring-2 hover:ring-blue-300"
                }`}
                style={{
                  left: `${desk.x * cellSize}px`,
                  top: `${desk.y * cellSize}px`,
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                }}
                onClick={(e) => onDeskClick(desk, e)}
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
        </div>
      </div>

      {/* Controls - Bottom */}
      <div className="mt-4 flex items-center justify-between w-full gap-6">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Zoom:</span>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            disabled={zoom <= 0.5}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 disabled:text-gray-300 disabled:border-gray-200 disabled:cursor-not-allowed transition-colors"
            title="Zoom out"
          >
            -
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            disabled={zoom >= 1.5}
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 disabled:text-gray-300 disabled:border-gray-200 disabled:cursor-not-allowed transition-colors"
            title="Zoom in"
          >
            +
          </button>
        </div>

        {/* Toggle Button */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Desk IDs</span>
          <button
            onClick={() => setShowIcons(!showIcons)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
              showIcons ? "bg-gray-600" : "bg-gray-300"
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
    </div>
  );
}
