import { supabase } from "../../lib/supabase";
import { Room } from "../../types/room";

export async function fetchRooms(): Promise<Room[]> {
  const { data, error } = await supabase.from("rooms").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Room[];
}

export async function createRoom(name: string, location: string) {
  const { data, error } = await supabase.from("rooms").insert([{ name, location }]).select().single();
  if (error) throw error;
  return data;
}
