import { useEffect, useState } from "react";
import { fetchRooms } from "../features/rooms/api";
import RoomCard from "../features/rooms/RoomCard";
import { Room } from "../types/room";
import AddRoomModal from "../features/rooms/AddRoomModal";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showModal, setShowModal] = useState(false);

  const loadRooms = () => {
    fetchRooms().then(setRooms).catch(console.error);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Room
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

      <AddRoomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onRoomCreated={loadRooms}
      />
    </div>
  );
}
