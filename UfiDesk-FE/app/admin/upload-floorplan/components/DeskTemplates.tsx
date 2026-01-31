import { RegularDeskIcon } from "./RegularDesk";
import { StandingDeskIcon } from "./StandingDesk";
import type { TemplateDesk } from "../types/floorplan.types";

interface DeskTemplatesProps {
  deskTemplates: TemplateDesk[];
  deskTemplatesNoMonitor: TemplateDesk[];
  standingDeskTemplates: TemplateDesk[];
  standingDeskTemplatesNoMonitor: TemplateDesk[];
  onDragStart: (template: TemplateDesk) => void;
  onSave: () => void;
  onDownload: () => void;
  onUpload: (file: File) => void;
}

export function DeskTemplates({
  deskTemplates,
  deskTemplatesNoMonitor,
  standingDeskTemplates,
  standingDeskTemplatesNoMonitor,
  onDragStart,
  onSave,
  onDownload,
  onUpload,
}: DeskTemplatesProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
      // Reset the input value to allow uploading the same file again
      event.target.value = "";
    }
  };
  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Regular Desks Row */}
      <div className="flex gap-6 w-full items-start justify-between">
        <div className="flex gap-6">
          {/* Regular - With Monitor */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
              Regular - With Monitor:
            </span>
            <div className="flex gap-2">
              {deskTemplates.map((template) => (
                <div
                  key={`${template.direction}-monitor`}
                  draggable
                  onDragStart={() => onDragStart(template)}
                  className="border-2 border-gray-300 rounded p-2 cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-1"
                  title={`Regular Desk with Monitor (${template.label})`}
                >
                  <RegularDeskIcon
                    size={40}
                    strokeColor="#374151"
                    bgColor="transparent"
                    direction={template.direction}
                    hasMonitor={true}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Regular - No Monitor */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
              Regular - No Monitor:
            </span>
            <div className="flex gap-2">
              {deskTemplatesNoMonitor.map((template) => (
                <div
                  key={`${template.direction}-no-monitor`}
                  draggable
                  onDragStart={() => onDragStart(template)}
                  className="border-2 border-gray-300 rounded p-2 cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-1"
                  title={`Regular Desk without Monitor (${template.label})`}
                >
                  <RegularDeskIcon
                    size={40}
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

        {/* Save and Download Buttons */}
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

      {/* Standing Desks Row */}
      <div className="flex gap-6 w-full">
        {/* Standing - With Monitor */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">
            Standing - With Monitor:
          </span>
          <div className="flex gap-2">
            {standingDeskTemplates.map((template) => (
              <div
                key={`${template.direction}-standing-monitor`}
                draggable
                onDragStart={() => onDragStart(template)}
                className="border-2 border-gray-300 rounded p-2 cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-1"
                title={`Standing Desk with Monitor (${template.label})`}
              >
                <StandingDeskIcon
                  size={40}
                  strokeColor="#374151"
                  bgColor="transparent"
                  direction={template.direction}
                  hasMonitor={true}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Standing - No Monitor */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">
            Standing - No Monitor:
          </span>
          <div className="flex gap-2">
            {standingDeskTemplatesNoMonitor.map((template) => (
              <div
                key={`${template.direction}-standing-no-monitor`}
                draggable
                onDragStart={() => onDragStart(template)}
                className="border-2 border-gray-300 rounded p-2 cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-1"
                title={`Standing Desk without Monitor (${template.label})`}
              >
                <StandingDeskIcon
                  size={40}
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
  );
}
