import { useEffect, useState } from "react";
import { Room } from "../../types/room";
import { Document } from "../../types/document";
import { fetchDocumentsByRoomId, getDocumentStatus, insertDocumentWithFile } from "./api";
import DocumentUploadModal from "./DocumentUploadModal";

interface Props {
  room: Room;
  onDelete?: (id: string) => void;
}

export default function RoomCard({ room, onDelete }: Props) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const refreshDocuments = async () => {
    const docs = await fetchDocumentsByRoomId(room.id);
    setDocuments(docs);
  };

  useEffect(() => {
    refreshDocuments();
  }, [room.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "expired":
        return "bg-red-600 text-white";
      case "expiring soon":
        return "bg-yellow-400 text-black";
      default:
        return "bg-green-500 text-white";
    }
  };

  const headerStatus = (() => {
    const hasExpired = documents.some((doc) => getDocumentStatus(doc.expiration_date) === "expired");
    const hasExpiring = documents.some((doc) => getDocumentStatus(doc.expiration_date) === "expiring soon");
    return hasExpired ? "expired" : hasExpiring ? "expiring soon" : "valid";
  })();

  return (
    <div className="rounded-lg overflow-hidden shadow hover:shadow-md border border-gray-200 flex flex-col h-full bg-white">
      {/* Header Bar */}
      <div className={`text-xs font-semibold uppercase px-4 py-2 ${getStatusColor(headerStatus)}`}>
        {headerStatus === "expired"
          ? "Expired"
          : headerStatus === "expiring soon"
          ? "Expiring Soon"
          : "Valid"}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        {/* Room Info */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-900 truncate">{room.name}</h2>
          {onDelete && (
            <button
              onClick={() => onDelete(room.id)}
              className="text-sm text-red-600 hover:underline"
              aria-label={`Delete room ${room.name}`}
            >
              Delete
            </button>
          )}
        </div>

        <div className="text-sm text-gray-600 mb-2">
          <p><strong>Room ID:</strong> {room.id}</p>
          <p><strong>Location:</strong> {room.location || "N/A"}</p>
          <p><strong>Created:</strong> {new Date(room.created_at).toLocaleString()}</p>
        </div>

        {/* Document Thumbnails */}
        {documents.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.file_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center text-center border rounded p-1 hover:shadow"
              >
                <img
                  src={doc.file_url || "/placeholder.png"}
                  alt={doc.title || "Document"}
                  className="h-16 w-full object-contain rounded mb-1"
                />
                <span className="text-xs truncate w-full">{doc.title || doc.name}</span>
              </a>
            ))}
          </div>
        )}

        {/* Document Details */}
        <h3 className="text-sm font-semibold mb-1">Document Details</h3>
        {documents.length > 0 ? (
          <ul className="space-y-2 text-sm mb-3">
            {documents.map((doc) => {
              const status = getDocumentStatus(doc.expiration_date);
              const color =
                status === "expired"
                  ? "text-red-600"
                  : status === "expiring soon"
                  ? "text-yellow-600"
                  : "text-green-600";
              return (
                <li key={doc.id} className="border-t pt-1">
                  <p className="font-medium truncate">{doc.title || doc.name}</p>
                  <p className="text-xs text-gray-500">
                    Status: <span className={color}>{status}</span><br />
                    Effective: {doc.effective_date} | Expires: {doc.expiration_date}<br />
                    Uploaded: {new Date(doc.created_at).toLocaleString()}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 italic mb-3">No documents found.</p>
        )}

        {/* Upload Button */}
        <div className="mt-auto text-right">
          <button
            onClick={() => setShowUploadModal(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            + Upload Document
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        roomId={room.id}
        onUploaded={refreshDocuments}
      />
    </div>
  );
}
