import { RegularDeskIcon } from "./RegularDesk";
import { StandingDeskIcon } from "./StandingDesk";
import type { TemplateDesk } from "../../../../admin/upload-floorplan/types/floorplan.types";

interface FloorplanToolbarProps {
  xLength: number;
  yLength: number;
  historyIndex: number;
  deskTemplates: TemplateDesk[];
  deskTemplatesNoMonitor: TemplateDesk[];
  standingDeskTemplates: TemplateDesk[];
  standingDeskTemplatesNoMonitor: TemplateDesk[];
  onXLengthChange: (value: number) => void;
  onYLengthChange: (value: number) => void;
  onUndo: () => void;
  onClearAll: () => void;
  onDragStart: (template: TemplateDesk) => void;
  onSave: () => void;
  onDownload: () => void;
  onUpload: (file: File) => void;
}

export function FloorplanToolbar({
  xLength,
  yLength,
  historyIndex,
  deskTemplates,
  deskTemplatesNoMonitor,
  standingDeskTemplates,
  standingDeskTemplatesNoMonitor,
  onXLengthChange,
  onYLengthChange,
  onUndo,
  onClearAll,
  onDragStart,
  onSave,
  onDownload,
  onUpload,
}: FloorplanToolbarProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
      event.target.value = "";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-[auto_auto_auto] gap-8">
        {/* Column 1: Controls */}
        <div className="flex flex-col gap-6">
          {/* Row 1: Dimensions */}
          <div className="flex gap-4">
            <div className="flex items-center gap-3">
              <label
                htmlFor="xLength"
                className="text-sm font-medium text-gray-700 w-20"
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
                className="text-sm font-medium text-gray-700 w-20"
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

          {/* Row 2: Action Buttons */}
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

        {/* Column 2: Desk Templates */}
        <div className="flex flex-col gap-4">
          {/* Row 1: Regular Desks */}
          <div className="flex gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-gray-700">
                Regular - With Monitor
              </span>
              <div className="flex gap-2">
                {deskTemplates.map((template) => (
                  <div
                    key={`${template.direction}-monitor`}
                    draggable
                    onDragStart={() => onDragStart(template)}
                    className="border-2 border-gray-300 rounded p-2 cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
                    title={`Regular Desk with Monitor (${template.label})`}
                  >
                    <RegularDeskIcon
                      size={32}
                      strokeColor="#374151"
                      bgColor="transparent"
                      direction={template.direction}
                      hasMonitor={true}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-gray-700">
                Regular - No Monitor
              </span>
              <div className="flex gap-2">
                {deskTemplatesNoMonitor.map((template) => (
                  <div
                    key={`${template.direction}-no-monitor`}
                    draggable
                    onDragStart={() => onDragStart(template)}
                    className="border-2 border-gray-300 rounded p-2 cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
                    title={`Regular Desk without Monitor (${template.label})`}
                  >
                    <RegularDeskIcon
                      size={32}
                      strokeColor="#374151"
                      bgColor="transparent"
                      direction={template.direction}
                      hasMonitor={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Standing Desks */}
          <div className="flex gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-gray-700">
                Standing - With Monitor
              </span>
              <div className="flex gap-2">
                {standingDeskTemplates.map((template) => (
                  <div
                    key={`${template.direction}-standing-monitor`}
                    draggable
                    onDragStart={() => onDragStart(template)}
                    className="border-2 border-gray-300 rounded p-2 cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
                    title={`Standing Desk with Monitor (${template.label})`}
                  >
                    <StandingDeskIcon
                      size={32}
                      strokeColor="#374151"
                      bgColor="transparent"
                      direction={template.direction}
                      hasMonitor={true}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-gray-700">
                Standing - No Monitor
              </span>
              <div className="flex gap-2">
                {standingDeskTemplatesNoMonitor.map((template) => (
                  <div
                    key={`${template.direction}-standing-no-monitor`}
                    draggable
                    onDragStart={() => onDragStart(template)}
                    className="border-2 border-gray-300 rounded p-2 cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
                    title={`Standing Desk without Monitor (${template.label})`}
                  >
                    <StandingDeskIcon
                      size={32}
                      strokeColor="#374151"
                      bgColor="transparent"
                      direction={template.direction}
                      hasMonitor={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onSave}
            className="px-6 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21H5a2 2 0 0 1-2 2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save Floorplan
          </button>
          <button
            onClick={onDownload}
            className="px-6 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download CSV
          </button>
          <button
            onClick={() => document.getElementById("csv-upload")?.click()}
            className="px-6 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload CSV
          </button>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
