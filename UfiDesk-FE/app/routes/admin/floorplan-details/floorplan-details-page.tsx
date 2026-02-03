import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useGetMainFloorplan,
  useGetDesksByFloorplan,
  useUpdateDeskDetails,
  useCheckForClash,
} from "~/api/hooks";
import { FloorplanGrid } from "~/components/FloorplanGrid";
import type { Desk } from "~/api/hooks/useFloorplan";
import type { Booking } from "~/api/hooks/useBooking";

interface DeskDetailsFormData {
  deskId: string;
  blockStart: string;
  blockEnd: string;
  description: string;
}

type ModalType = "create" | "edit" | "delete" | "clash-confirmation" | null;

export function FloorplanDetails() {
  const { data: mainFloorplan, isLoading, error } = useGetMainFloorplan();
  const { data: desksData, refetch: refetchDesks } = useGetDesksByFloorplan();
  const updateDeskDetails = useUpdateDeskDetails();
  const checkForClash = useCheckForClash();
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null);
  const [showIcons, setShowIcons] = useState(true);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [clashingBookings, setClashingBookings] = useState<Booking[]>([]);
  const [pendingBlockingData, setPendingBlockingData] =
    useState<DeskDetailsFormData | null>(null);

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
      if (modalType === "create") {
        // Check for clashes when creating
        const clashes = await checkForClash.mutateAsync({
          deskId: data.deskId,
          description: data.description,
          blockStart: data.blockStart || null,
          blockEnd: data.blockEnd || null,
        });

        if (clashes && clashes.length > 0) {
          // Store the data and show clash confirmation modal
          setPendingBlockingData(data);
          setClashingBookings(clashes);
          setModalType("clash-confirmation");
        } else {
          // No clashes, backend already created the blocking
          toast.success("Blocking created successfully");
          setModalType(null);
          refetchDesks();
        }
      } else {
        // Edit mode - directly update
        await updateDeskDetails.mutateAsync({
          deskId: data.deskId,
          description: data.description,
          blockStart: data.blockStart || null,
          blockEnd: data.blockEnd || null,
        });
        toast.success("Blocking updated successfully");
        setModalType(null);
        refetchDesks();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update desk details",
      );
    }
  };

  const handleConfirmOverwrite = async () => {
    if (!pendingBlockingData) return;

    try {
      await updateDeskDetails.mutateAsync({
        deskId: pendingBlockingData.deskId,
        description: pendingBlockingData.description,
        blockStart: pendingBlockingData.blockStart || null,
        blockEnd: pendingBlockingData.blockEnd || null,
      });
      toast.success("Blocking created and existing bookings overwritten");
      setModalType(null);
      setPendingBlockingData(null);
      setClashingBookings([]);
      refetchDesks();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create blocking",
      );
    }
  };

  const handleDeleteBlocking = async () => {
    if (!selectedDesk) return;

    try {
      await updateDeskDetails.mutateAsync({
        deskId: selectedDesk.id,
        description:
          desksData?.find((d) => d.deskId === selectedDesk.id)?.description ||
          "",
        blockStart: null,
        blockEnd: null,
      });
      setValue("blockStart", "");
      setValue("blockEnd", "");
      toast.success("Blocking deleted successfully");
      setModalType(null);
      refetchDesks();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete blocking",
      );
    }
  };

  const openModal = (type: ModalType) => {
    if (type === "create") {
      // Reset form for creating new blocking
      setValue("blockStart", "");
      setValue("blockEnd", "");
      setValue("description", "");
    } else if (type === "edit") {
      // Populate form with existing blocking data
      const deskData = desksData?.find((d) => d.deskId === selectedDesk?.id);
      if (deskData) {
        setValue("blockStart", deskData.blockStart || "");
        setValue("blockEnd", deskData.blockEnd || "");
        setValue("description", deskData.description || "");
      }
    }
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
    setPendingBlockingData(null);
    setClashingBookings([]);
    // Reset form when closing modal
    reset();
  };

  // Get current desk data
  const currentDeskData = selectedDesk
    ? desksData?.find((d) => d.deskId === selectedDesk.id)
    : null;

  const hasBlocking = currentDeskData?.blockStart && currentDeskData?.blockEnd;

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
      <div className="w-1/2 flex flex-col p-8 overflow-y-auto">
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

              {/* Blocking Information */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Blocking Information
                  </h4>
                  {hasBlocking && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal("edit")}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openModal("delete")}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {hasBlocking && currentDeskData ? (
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">
                        Block Start:
                      </span>
                      <span className="text-gray-800">
                        {new Date(
                          currentDeskData.blockStart!,
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">
                        Block End:
                      </span>
                      <span className="text-gray-800">
                        {new Date(currentDeskData.blockEnd!).toLocaleDateString(
                          "en-GB",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </span>
                    </div>
                    {currentDeskData.description && (
                      <div>
                        <span className="text-gray-600 font-medium block mb-1">
                          Description:
                        </span>
                        <p className="text-gray-800 bg-white p-2 rounded">
                          {currentDeskData.description}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">
                      This desk has no blocking
                    </p>
                    <button
                      onClick={() => openModal("create")}
                      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
                    >
                      Create Blocking
                    </button>
                  </div>
                )}
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

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className={`bg-white rounded-lg shadow-xl p-6 w-full ${
              modalType === "clash-confirmation" ? "max-w-4xl" : "max-w-md"
            }`}
          >
            {modalType === "delete" ? (
              // Delete Confirmation Modal
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Delete Blocking
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete the blocking for{" "}
                  {selectedDesk?.id}? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteBlocking}
                    disabled={updateDeskDetails.isPending}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:bg-red-400"
                  >
                    {updateDeskDetails.isPending ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </>
            ) : modalType === "clash-confirmation" ? (
              // Clash Confirmation Modal
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Booking Conflicts Detected
                </h3>
                <p className="text-gray-600 mb-4">
                  The following bookings will be affected by this blocking:
                </p>
                <div className="max-h-64 overflow-y-auto mb-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-700 font-medium">
                          Booking ID
                        </th>
                        <th className="px-3 py-2 text-left text-gray-700 font-medium">
                          Email
                        </th>
                        <th className="px-3 py-2 text-left text-gray-700 font-medium">
                          Start Date
                        </th>
                        <th className="px-3 py-2 text-left text-gray-700 font-medium">
                          End Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {clashingBookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="border-b border-gray-200"
                        >
                          <td className="px-3 py-2 text-gray-800">
                            {booking.id}
                          </td>
                          <td className="px-3 py-2 text-gray-800">
                            {booking.userEmail}
                          </td>
                          <td className="px-3 py-2 text-gray-800">
                            {new Date(booking.startDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-3 py-2 text-gray-800">
                            {new Date(booking.endDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-gray-600 mb-6 font-medium">
                  Are you sure you want to overwrite these existing bookings?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmOverwrite}
                    disabled={updateDeskDetails.isPending}
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:bg-orange-400"
                  >
                    {updateDeskDetails.isPending
                      ? "Confirming..."
                      : "Confirm Overwrite"}
                  </button>
                </div>
              </>
            ) : (
              // Create/Edit Modal
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {modalType === "create" ? "Create" : "Edit"} Blocking
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Block Start
                    </label>
                    <input
                      type="date"
                      {...register("blockStart", { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      style={{ colorScheme: "light" }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Block End
                    </label>
                    <input
                      type="date"
                      {...register("blockEnd", { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      style={{ colorScheme: "light" }}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      {...register("description")}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-black"
                      placeholder="Enter blocking description..."
                    />
                  </div>
                  <input type="hidden" {...register("deskId")} />
                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        updateDeskDetails.isPending || checkForClash.isPending
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                    >
                      {updateDeskDetails.isPending || checkForClash.isPending
                        ? "Saving..."
                        : modalType === "create"
                          ? "Create"
                          : "Update"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FloorplanDetails;
