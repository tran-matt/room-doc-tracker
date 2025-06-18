import { useEffect, useState, useCallback } from "react";
import RoomCard from "../features/rooms/RoomCard";
import AddRoomModal from "../features/rooms/AddRoomModal";
import {
  fetchRooms,
  deleteRoom,
  getDocumentStatus,
  fetchDocumentsByRoomId
} from "../features/rooms/api";
import { Room } from "../types/room";

// Define expiration filter types
type ExpirationFilter = "all" | "expired" | "expiring" | "valid";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ExpirationFilter>("all");
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);

  const loadRooms = useCallback(async () => {
    try {
      const result = await fetchRooms();
      if (Array.isArray(result)) {
        setRooms(result);
      } else {
        console.error("Failed to fetch rooms");
      }
    } catch (err) {
      console.error("Error loading rooms:", err);
    }
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this room?");
    if (!confirmed) return;
    try {
      await deleteRoom(id);
      setRooms((prev) => prev.filter((room) => room.id !== id));
    } catch (err) {
      console.error("Failed to delete room:", err);
      alert("Error deleting room. Please try again.");
    }
  };

  const handleRoomCreated = (newRoom: Room) => {
    setRooms((prev) => [newRoom, ...prev]);
    setShowModal(false);
  };

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    const applyFilters = async () => {
      let result = [...rooms];

      if (search.trim()) {
        result = result.filter((room) =>
          room.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (filter !== "all") {
        const filtered: Room[] = [];
        for (const room of result) {
          const docs = await fetchDocumentsByRoomId(room.id);
          const hasStatus = docs.some((doc) => {
            const status = getDocumentStatus(doc.expiration_date);
            return (
              (filter === "expired" && status === "expired") ||
              (filter === "expiring" && status === "expiring soon") ||
              (filter === "valid" && status === "valid")
            );
          });
          if (hasStatus) filtered.push(room);
        }
        result = filtered;
      }

      setFilteredRooms(result);
    };

    applyFilters();
  }, [rooms, search, filter]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-1">Room Tracker</h1>
            <p className="text-sm text-gray-500">
              Manage rooms and associated document expirations
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 shadow"
          >
            + Add Room
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search by room name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ExpirationFilter)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="expired">Expired</option>
            <option value="expiring">Expiring Soon</option>
            <option value="valid">Valid</option>
          </select>
        </div>

        {/* Room Cards */}
        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="text-center mt-20 text-gray-500">
            <p className="text-lg font-semibold">No rooms found</p>
            <p className="text-sm">Try adjusting your filters or add a new room above.</p>
          </div>
        )}

        {/* Modal */}
        <AddRoomModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onRoomCreated={handleRoomCreated}
        />
      </div>
    </div>
  );
}
