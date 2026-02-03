import { useState, useMemo, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useGetMainFloorplan, useGetDesksByFloorplan } from "~/api/hooks";
import { ProtectedRoute } from "~/components/ProtectedRoute";
import { FloorplanGrid } from "~/components/FloorplanGrid";
import type { Desk } from "~/api/hooks/useFloorplan";
import {
  useCreateBooking,
  useGetAllActiveBookings,
  useDeleteBooking,
  Period,
} from "~/api/hooks/useBooking";
import { useSessionStatus } from "~/api/hooks/useAuth";
import { toast } from "react-toastify";

export function DeskBooking() {
  return (
    <ProtectedRoute>
      <DeskBookingContent />
    </ProtectedRoute>
  );
}

function DeskBookingContent() {
  const { data: mainFloorplan, isLoading, error } = useGetMainFloorplan();
  const { data: desksData } = useGetDesksByFloorplan();
  const { data: bookingsData } = useGetAllActiveBookings();
  const { data: sessionData } = useSessionStatus();
  const createBooking = useCreateBooking();
  const deleteBooking = useDeleteBooking();
  const [selectedDesks, setSelectedDesks] = useState<Desk[]>([]);
  const [showIcons, setShowIcons] = useState(true);
  const [eventDescription, setEventDescription] = useState<{
    type: "blocked" | "booking";
    description: string;
    userEmail?: string;
    startDate?: string;
    endDate?: string;
    startPeriod?: string;
    endPeriod?: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    desks: Desk[];
    startDate: string;
    endDate: string;
  } | null>(null);
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("PM");
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    bookingId: string;
    userEmail: string;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, reset, setValue } = useForm<{
    startDate: string;
    endDate: string;
    description: string;
  }>();

  // Reset form when modal opens
  useEffect(() => {
    if (isModalOpen && modalData) {
      setValue("startDate", modalData.startDate);
      setValue("endDate", modalData.endDate);
      setValue("description", "");
      setStartPeriod("AM");
      setEndPeriod("PM");
    }
  }, [isModalOpen, modalData, setValue]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu(null);
      }
    };

    if (contextMenu?.visible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [contextMenu]);

  const handleDeleteBooking = async () => {
    if (!contextMenu?.bookingId) return;

    try {
      await deleteBooking.mutateAsync(contextMenu.bookingId);
      toast.success("Booking deleted successfully!");
      setContextMenu(null);
      setEventDescription(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete booking",
      );
    }
  };

  const onSubmit = async (data: {
    startDate: string;
    endDate: string;
    description: string;
  }) => {
    if (!modalData) return;

    try {
      const deskIds = modalData.desks.map((desk) => desk.id);

      await createBooking.mutateAsync({
        description: data.description,
        deskIds,
        startDate: data.startDate,
        startPeriod: startPeriod as Period,
        endDate: data.endDate,
        endPeriod: endPeriod as Period,
      });

      toast.success("Booking created successfully!");
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create booking",
      );
    }
  };

  const handleDeskClick = (desk: Desk, event: React.MouseEvent) => {
    if (desk === selectedDesks[0]) return; // No action if clicking the already selected desk

    setEventDescription(null); // Clear description when switching desks

    if (event.shiftKey) {
      // Shift key is pressed - toggle desk in selection
      setSelectedDesks((prev) => {
        const isAlreadySelected = prev.some((d) => d.id === desk.id);
        if (isAlreadySelected) {
          return prev.filter((d) => d.id !== desk.id);
        } else {
          return [...prev, desk];
        }
      });
    } else {
      // No shift key - replace selection with single desk
      setSelectedDesks([desk]);
    }
  };

  // Check if any selected desk is blocked during the date range
  const isDateRangeBlocked = (startDate: string, endDate: string): boolean => {
    if (!desksData || selectedDesks.length === 0) return false;

    return selectedDesks.some((desk) => {
      const deskData = desksData.find((d) => d.deskId === desk.id);
      if (!deskData || !deskData.blockStart || !deskData.blockEnd) return false;

      // Check if the selected date range overlaps with the blocked period
      const blockStart = new Date(deskData.blockStart);
      const blockEnd = new Date(deskData.blockEnd);
      const selectStart = new Date(startDate);
      const selectEnd = new Date(endDate);

      // Dates overlap if: start1 <= end2 && start2 <= end1
      return selectStart <= blockEnd && blockStart <= selectEnd;
    });
  };

  // Handle date selection from calendar
  const handleDateSelect = (selectInfo: any) => {
    const startDate = selectInfo.startStr;
    // FullCalendar end is exclusive, so subtract 1 day to get the actual last selected date
    const endDate = new Date(new Date(selectInfo.endStr).getTime() - 1)
      .toISOString()
      .split("T")[0];

    // Check if any desk is blocked
    if (isDateRangeBlocked(startDate, endDate)) {
      // Ignore click if blocked
      selectInfo.view.calendar.unselect();
      return;
    }

    // Open modal with selected desks and dates
    setModalData({
      desks: selectedDesks,
      startDate,
      endDate,
    });
    setIsModalOpen(true);
    selectInfo.view.calendar.unselect();
  };

  // Get calendar events for all selected desks
  const calendarEvents = useMemo(() => {
    if (selectedDesks.length === 0) return [];

    const events: any[] = [];

    // Add blocked desk events
    if (desksData) {
      selectedDesks.forEach((desk) => {
        const deskData = desksData.find((d) => d.deskId === desk.id);
        if (!deskData || !deskData.blockStart || !deskData.blockEnd) return;

        // FullCalendar end dates are exclusive, so we always need to add 1 day
        // to the end date to include the last day in the blocked range
        const endDate = new Date(
          new Date(deskData.blockEnd).getTime() + 24 * 60 * 60 * 1000,
        )
          .toISOString()
          .split("T")[0];

        events.push({
          title: `${desk.id}: Blocked`,
          start: deskData.blockStart,
          end: endDate,
          backgroundColor: "#ef4444",
          borderColor: "#ef4444",
          textColor: "#000000",
          extendedProps: {
            description: deskData.description || "No description provided",
            deskId: desk.id,
            type: "blocked",
          },
        });
      });
    }

    // Add booking events for selected desks
    if (bookingsData) {
      const selectedDeskIds = selectedDesks.map((d) => d.id);
      const relevantBookings = bookingsData.filter((booking) =>
        selectedDeskIds.includes(booking.deskId),
      );

      relevantBookings.forEach((booking) => {
        // FullCalendar end dates are exclusive, so add 1 day to include the last day
        const endDate = new Date(
          new Date(booking.endDate).getTime() + 24 * 60 * 60 * 1000,
        )
          .toISOString()
          .split("T")[0];

        const periodInfo =
          booking.startPeriod === booking.endPeriod
            ? ` (${booking.startPeriod})`
            : ` (${booking.startPeriod}-${booking.endPeriod})`;

        events.push({
          title: `${booking.deskId}: Booked${periodInfo}`,
          start: booking.startDate,
          end: endDate,
          backgroundColor: "#3b82f6",
          borderColor: "#3b82f6",
          textColor: "#ffffff",
          extendedProps: {
            description: booking.description || "No description provided",
            deskId: booking.deskId,
            userEmail: booking.userEmail,
            type: "booking",
            startPeriod: booking.startPeriod,
            endPeriod: booking.endPeriod,
            bookingId: booking.id,
          },
        });
      });
    }

    return events;
  }, [selectedDesks, desksData, bookingsData]);

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

  return (
    <div className="flex h-screen bg-gray-50">
      <FloorplanGrid
        mainFloorplan={mainFloorplan}
        selectedDesks={selectedDesks}
        onDeskClick={handleDeskClick}
        showIcons={showIcons}
        setShowIcons={setShowIcons}
      />

      {/* Right Half - Calendar */}
      <div className="w-1/2 flex flex-col p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {selectedDesks.length > 0
            ? `Bookings for ${selectedDesks.map((d) => d.id).join(", ")}`
            : "Select a Desk"}
        </h2>

        {selectedDesks.length > 0 ? (
          <>
            <div
              className="bg-white rounded-lg shadow-md p-6 [&_.fc]:text-black [&_.fc-toolbar-title]:text-black [&_.fc-col-header-cell-cushion]:text-black [&_.fc-daygrid-day-number]:text-black [&_.fc-button]:text-white"
              style={{ height: `${gridHeight}px` }}
            >
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next",
                  center: "title",
                  right: "",
                }}
                events={calendarEvents}
                eventDidMount={(info) => {
                  const { type, userEmail, bookingId } =
                    info.event.extendedProps;

                  // Add right-click handler for all bookings
                  if (type === "booking" && bookingId) {
                    info.el.addEventListener("contextmenu", (e) => {
                      e.preventDefault();
                      setContextMenu({
                        visible: true,
                        x: e.pageX,
                        y: e.pageY,
                        bookingId,
                        userEmail: userEmail || "",
                      });
                    });
                  }
                }}
                eventClick={(info) => {
                  const {
                    description,
                    type,
                    userEmail,
                    startPeriod,
                    endPeriod,
                  } = info.event.extendedProps;

                  // Format dates to YYYY-MM-DD
                  const startDate = info.event.start
                    ? info.event.start.toISOString().split("T")[0]
                    : undefined;
                  const endDate = info.event.end
                    ? new Date(info.event.end.getTime() - 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0]
                    : undefined;

                  setEventDescription({
                    type: type as "blocked" | "booking",
                    description: description || "No description provided",
                    userEmail,
                    startDate,
                    endDate,
                    startPeriod,
                    endPeriod,
                  });
                }}
                select={handleDateSelect}
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                height="100%"
                fixedWeekCount={false}
                showNonCurrentDates={false}
              />
            </div>

            {/* Event Description Detail */}
            {eventDescription && (
              <div
                className={`border rounded-lg p-4 mt-4 ${
                  eventDescription.type === "blocked"
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">
                      {eventDescription.type === "blocked"
                        ? "Block Details"
                        : "Booking Details"}
                    </h3>

                    {(eventDescription.startDate ||
                      eventDescription.endDate) && (
                      <div className="flex gap-4 mb-2">
                        {eventDescription.startDate && (
                          <div>
                            <span className="text-xs font-medium text-gray-600">
                              Start Date:{" "}
                            </span>
                            <span className="text-sm text-gray-700">
                              {new Date(
                                eventDescription.startDate,
                              ).toLocaleDateString()}
                              {eventDescription.startPeriod &&
                                ` (${eventDescription.startPeriod})`}
                            </span>
                          </div>
                        )}

                        {eventDescription.endDate && (
                          <div>
                            <span className="text-xs font-medium text-gray-600">
                              End Date:{" "}
                            </span>
                            <span className="text-sm text-gray-700">
                              {new Date(
                                eventDescription.endDate,
                              ).toLocaleDateString()}
                              {eventDescription.endPeriod &&
                                ` (${eventDescription.endPeriod})`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mb-2">
                      <span className="text-xs font-medium text-gray-600">
                        Description:{" "}
                      </span>
                      <p className="text-sm text-gray-700 mt-1">
                        {eventDescription.description}
                      </p>
                    </div>

                    {eventDescription.type === "booking" &&
                      eventDescription.userEmail && (
                        <div>
                          <span className="text-xs font-medium text-gray-600">
                            Booked by:{" "}
                          </span>
                          <span className="text-xs text-gray-700">
                            {eventDescription.userEmail}
                          </span>
                        </div>
                      )}
                  </div>
                  <button
                    onClick={() => setEventDescription(null)}
                    className="text-gray-500 hover:text-gray-700 ml-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            className="flex items-center justify-center bg-white rounded-lg shadow-md"
            style={{ height: `${gridHeight}px` }}
          >
            <p className="text-gray-500 text-lg">
              Click on a desk to view its bookings
            </p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isModalOpen && modalData && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Book Desk(s)
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Selected Desk(s):
                </label>
                <p className="text-gray-800">
                  {modalData.desks.map((d) => d.id).join(", ")}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  Booking Start Date:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    {...register("startDate")}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    style={{ colorScheme: "light" }}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStartPeriod("AM")}
                      className={`px-3 py-2 rounded transition-colors ${
                        startPeriod === "AM"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setStartPeriod("PM")}
                      className={`px-3 py-2 rounded transition-colors ${
                        startPeriod === "PM"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  Booking End Date:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    {...register("endDate")}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    style={{ colorScheme: "light" }}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEndPeriod("AM")}
                      className={`px-3 py-2 rounded transition-colors ${
                        endPeriod === "AM"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setEndPeriod("PM")}
                      className={`px-3 py-2 rounded transition-colors ${
                        endPeriod === "PM"
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">
                  Description:
                </label>
                <textarea
                  {...register("description")}
                  placeholder="Enter booking description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black resize-none"
                />
              </div>
            </form>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  reset();
                }}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={createBooking.isPending}
                className="px-4 py-2 border border-gray-800 text-gray-800 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createBooking.isPending ? "Creating..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu for Deleting Bookings */}
      {contextMenu?.visible && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            onClick={handleDeleteBooking}
            disabled={
              deleteBooking.isPending ||
              contextMenu.userEmail !== sessionData?.email
            }
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {deleteBooking.isPending ? "Deleting..." : "Delete Booking"}
          </button>
        </div>
      )}
    </div>
  );
}

export default DeskBooking;
