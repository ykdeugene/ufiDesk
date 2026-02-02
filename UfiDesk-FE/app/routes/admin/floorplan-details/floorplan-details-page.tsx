import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useGetMainFloorplan,
  useGetDesksByFloorplan,
  useUpdateDeskDetails,
} from "~/api/hooks";
import { FloorplanGrid } from "~/components/FloorplanGrid";
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

  // Convert single desk to array for FloorplanGrid component
  const selectedDesks = selectedDesk ? [selectedDesk] : [];

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
      <FloorplanGrid
        mainFloorplan={mainFloorplan}
        selectedDesks={selectedDesks}
        onDeskClick={handleDeskClick}
        showIcons={showIcons}
        setShowIcons={setShowIcons}
      />

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
