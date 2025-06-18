import { supabase } from "../../lib/supabase";
import { Room } from "../../types/room";
import { Document } from "../../types/document";

// ========== ROOMS ==========

export async function fetchRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching rooms:", error.message);
    return [];
  }

  return data || [];
}

export async function createRoom(name: string, location: string): Promise<Room> {
  const { data, error } = await supabase
    .from("rooms")
    .insert([{ name, location }])
    .select()
    .single();

  if (error || !data) {
    console.error("Error creating room:", error?.message);
    throw error || new Error("Room creation failed");
  }

  return data as Room;
}

export async function deleteRoom(id: string): Promise<void> {
  const { error } = await supabase.from("rooms").delete().eq("id", id);
  if (error) {
    console.error("Error deleting room:", error.message);
    throw error;
  }
}

// ========== DOCUMENTS ==========

export async function fetchDocumentsByRoomId(roomId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("room_id", roomId)
    .order("expiration_date", { ascending: true });

  if (error) {
    console.error("Error fetching documents:", error.message);
    return [];
  }

  return data || [];
}

export async function insertDocument(doc: Partial<Document>): Promise<void> {
  const { error } = await supabase.from("documents").insert([doc]);
  if (error) {
    console.error("Error inserting document:", error.message);
    throw error;
  }
}

export async function insertDocumentWithFile(
  roomId: string,
  title: string,
  effective_date: string,
  expiration_date: string,
  file: File
): Promise<void> {
  const filePath = `${roomId}/${Date.now()}-${file.name}`;

  // Upload file to Supabase Storage
  const { error: storageError } = await supabase.storage
    .from("room-documents")
    .upload(filePath, file);

  if (storageError) {
    console.error("File upload error:", storageError.message);
    throw storageError;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("room-documents").getPublicUrl(filePath);

  if (!publicUrl) {
    throw new Error("Failed to retrieve public URL for uploaded file.");
  }

  // Insert metadata into the documents table
  await insertDocument({
    room_id: roomId,
    title,
    effective_date,
    expiration_date,
    file_url: publicUrl,
  });
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) {
    console.error("Error deleting document:", error.message);
    throw error;
  }
}

// ========== SEARCH ==========

export async function searchDocumentsAcrossRooms(keyword: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .ilike("title", `%${keyword}%`)
    .order("expiration_date", { ascending: true });

  if (error) {
    console.error("Error searching documents:", error.message);
    return [];
  }

  return data || [];
}

// ========== STATUS ==========

export function getDocumentStatus(
  expiration: string,
  warnDays = 30
): "valid" | "expiring soon" | "expired" {
  const now = new Date();
  const exp = new Date(expiration);
  const diffInDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) return "expired";
  if (diffInDays <= warnDays) return "expiring soon";
  return "valid";
}

// Update room
export async function updateRoom(id: string, name: string, location?: string): Promise<void> {
  const { error } = await supabase
    .from("rooms")
    .update({ name, location })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

// Update document
export async function updateDocument(id: string, updates: Partial<Document>): Promise<void> {
  const { error } = await supabase
    .from("documents")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error updating document:", error.message);
    throw error;
  }
}