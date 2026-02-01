import type { DeskInfo } from "../types/deskiunfo.types";
import { Direction, DeskType } from "../types/deskiunfo.types";

export function importFloorplanFromCSV(csvContent: string): {
  grid: (DeskInfo | null)[][];
  xLength: number;
  yLength: number;
} {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("Invalid CSV format");
  }

  // Parse headers to get xLength
  const headers = lines[0].split(",");
  const xLength = headers.length - 1; // Exclude first empty column

  // Parse rows
  const rows = lines.slice(1);
  const yLength = rows.length;

  // Create grid
  const grid: (DeskInfo | null)[][] = Array(yLength)
    .fill(null)
    .map(() => Array(xLength).fill(null));

  rows.forEach((row, yIndex) => {
    const cells = row.split(",");
    // Skip first cell (Y-index label)
    cells.slice(1).forEach((cell, xIndex) => {
      if (!cell.trim()) return;

      try {
        // Parse format: {S/R}-{U/D/L/R}-{M/NM}
        const parts = cell.trim().split("-");
        if (parts.length !== 3) return;

        const [typeCode, directionCode, monitorCode] = parts;

        // Parse type - only S or R allowed
        if (typeCode !== "S" && typeCode !== "R") return;
        const type = typeCode === "S" ? DeskType.Standing : DeskType.Regular;

        // Parse direction - only U/D/L/R allowed
        const directionMap: Record<string, Direction> = {
          U: Direction.Up,
          D: Direction.Down,
          L: Direction.Left,
          R: Direction.Right,
        };
        const direction = directionMap[directionCode];
        if (!direction) return;

        // Parse monitor - only M or NM allowed
        if (monitorCode !== "M" && monitorCode !== "NM") return;
        const hasMonitor = monitorCode === "M";

        // Create DeskInfo
        grid[yIndex][xIndex] = {
          id: `desk-${Date.now()}-${Math.random()}`,
          x: xIndex,
          y: yIndex,
          direction,
          hasMonitor,
          type,
          isAvailable: true,
        };
      } catch (error) {
        // Ignore any parsing errors and continue
        return;
      }
    });
  });

  return { grid, xLength, yLength };
}

export function exportFloorplanToCSV(grid: (DeskInfo | null)[][]) {
  // Create column headers (1, 2, 3, ...)
  const xLength = grid[0]?.length || 0;
  const headers = [
    "",
    ...Array.from({ length: xLength }, (_, i) => (i + 1).toString()),
  ];

  // Create rows with Y-index in first column
  const rows = grid.map((row, yIndex) => {
    const rowData = row.map((desk) => {
      if (!desk) return "";

      // Format: {S/R}-{U/D/L/R}-{M/NM}
      const type = desk.type === "standing" ? "S" : "R";
      const direction = desk.direction.charAt(0).toUpperCase(); // U/D/L/R
      const monitor = desk.hasMonitor ? "M" : "NM";

      return `${type}-${direction}-${monitor}`;
    });

    return [(yIndex + 1).toString(), ...rowData];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `floorplan-${Date.now()}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
