import { Room } from "../../types/room";

export default function RoomCard({ room }: { room: Room }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow hover:shadow-md transition">
      <h3 className="text-lg font-semibold">{room.name}</h3>
      <p className="text-sm text-gray-500">{room.location}</p>
    </div>
  );
}
