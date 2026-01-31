interface FloorplanControlsProps {
  xLength: number;
  yLength: number;
  historyIndex: number;
  onXLengthChange: (value: number) => void;
  onYLengthChange: (value: number) => void;
  onUndo: () => void;
  onClearAll: () => void;
}

export function FloorplanControls({
  xLength,
  yLength,
  historyIndex,
  onXLengthChange,
  onYLengthChange,
  onUndo,
  onClearAll,
}: FloorplanControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Dimensions */}
      <div className="flex gap-6">
        <div className="flex items-center gap-3">
          <label
            htmlFor="xLength"
            className="text-sm font-medium text-gray-700"
          >
            X-Length:
          </label>
          <input
            type="number"
            id="xLength"
            min="1"
            max="20"
            value={xLength}
            onChange={(e) => onXLengthChange(parseInt(e.target.value) || 1)}
            className="w-20 px-3 py-2 text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <label
            htmlFor="yLength"
            className="text-sm font-medium text-gray-700"
          >
            Y-Length:
          </label>
          <input
            type="number"
            id="yLength"
            min="1"
            max="20"
            value={yLength}
            onChange={(e) => onYLengthChange(parseInt(e.target.value) || 1)}
            className="w-20 px-3 py-2 text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onUndo}
          disabled={historyIndex <= 0}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          Undo
        </button>
        <button
          onClick={onClearAll}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
