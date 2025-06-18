import { useEffect, useRef, useState } from "react";
import { insertDocumentWithFile } from "./api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  onUploaded: () => Promise<void>;
}

export default function DocumentUploadModal({
  isOpen,
  onClose,
  roomId,
  onUploaded,
}: Props) {
  const [title, setTitle] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setEffectiveDate("");
      setExpirationDate("");
      setFile(null);
      setError("");
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !effectiveDate || !expirationDate || !file) {
      setError("All fields including file are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await insertDocumentWithFile(
        roomId,
        title,
        effectiveDate,
        expirationDate,
        file
      );

      await onUploaded();
      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to upload document.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">Upload Document</h2>

        {error && (
          <div className="text-red-600 text-sm mb-3" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            ref={titleRef}
            type="text"
            placeholder="Document Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-3"
            required
          />

          <input
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-3"
            required
          />

          <input
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-3"
            required
          />

          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full mb-4 text-sm"
            required
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-sm text-white rounded hover:bg-blue-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
