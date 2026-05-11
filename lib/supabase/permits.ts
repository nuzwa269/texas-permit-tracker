import { supabase } from './client';
import type { Permit, PermitNote } from '@/types/permit';

// ------------------------------------------------------------
// Permits
// ------------------------------------------------------------

export async function getPermits(): Promise<Permit[]> {
  const { data, error } = await supabase
    .from('permits')
    .select('*, notes(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Permit[];
}

export async function createPermit(
  payload: Omit<Permit, 'id' | 'created_at' | 'updated_at' | 'notes'>
): Promise<Permit> {
  const { data, error } = await supabase
    .from('permits')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as Permit;
}

export async function updatePermit(
  id: string,
  payload: Partial<Omit<Permit, 'id' | 'created_at' | 'updated_at' | 'notes'>>
): Promise<Permit> {
  const { data, error } = await supabase
    .from('permits')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Permit;
}

export async function deletePermit(id: string): Promise<void> {
  const { error } = await supabase.from('permits').delete().eq('id', id);
  if (error) throw error;
}

// ------------------------------------------------------------
// Notes
// ------------------------------------------------------------

export async function getNotes(permitId: string): Promise<PermitNote[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('permit_id', permitId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as PermitNote[];
}

export async function createNote(
  payload: Omit<PermitNote, 'id' | 'created_at'>
): Promise<PermitNote> {
  const { data, error } = await supabase
    .from('notes')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as PermitNote;
}

export async function updateNote(
  id: string,
  content: string
): Promise<PermitNote> {
  const { data, error } = await supabase
    .from('notes')
    .update({ content })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as PermitNote;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}
