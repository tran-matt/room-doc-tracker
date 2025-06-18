// --- src/types/document.ts ---
export interface Document {
  id: string;
  room_id: string;
  name: string;
  title: string;
  status: string;
  effective_date: string;
  expiration_date: string;
  file_url?: string;
  created_at: string;
}
