'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { getNotes, createNote, updateNote, deleteNote } from '@/lib/supabase/permits';
import type { PermitNote } from '@/types/permit';

interface NotesSectionProps {
  /** The permit whose notes are being managed. */
  permitId: string;
  /** Authenticated user's ID — used as `user_id` when creating notes. */
  userId: string;
  /** Display name / email that will be stored as `created_by`. */
  userDisplayName: string;
}

export function NotesSection({ permitId, userId, userDisplayName }: NotesSectionProps) {
  const [notes, setNotes] = useState<PermitNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── New note state ────────────────────────────────────────────
  const [newContent, setNewContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // ── Edit state ────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // ── Delete state ──────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  // ── Load notes ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoadingNotes(true);
    getNotes(permitId)
      .then((data) => { if (!cancelled) setNotes(data); })
      .catch((err) => { if (!cancelled) setFetchError(err.message ?? 'Failed to load notes.'); })
      .finally(() => { if (!cancelled) setLoadingNotes(false); });
    return () => { cancelled = true; };
  }, [permitId]);

  // Focus edit textarea when entering edit mode
  useEffect(() => {
    if (editingId) editRef.current?.focus();
  }, [editingId]);

  // ── Handlers ─────────────────────────────────────────────────
  async function handleAdd() {
    const content = newContent.trim();
    if (!content) return;
    setAddingNote(true);
    setAddError(null);
    try {
      const note = await createNote({ permit_id: permitId, user_id: userId, content, created_by: userDisplayName });
      setNotes((prev) => [...prev, note]);
      setNewContent('');
      textareaRef.current?.focus();
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Failed to add note.');
    } finally {
      setAddingNote(false);
    }
  }

  function startEdit(note: PermitNote) {
    setEditingId(note.id);
    setEditContent(note.content);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent('');
    setEditError(null);
  }

  async function handleSaveEdit(id: string) {
    const content = editContent.trim();
    if (!content) return;
    setSavingId(id);
    setEditError(null);
    try {
      const updated = await updateNote(id, content);
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setEditingId(null);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to update note.');
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this note? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // silently surface as inline state if desired
    } finally {
      setDeletingId(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-navy-600" />
        <h3 className="text-base font-semibold text-navy-900">
          Notes
          {!loadingNotes && (
            <span className="ml-1.5 text-sm font-normal text-slate-500">({notes.length})</span>
          )}
        </h3>
      </div>

      {/* Fetch error */}
      {fetchError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{fetchError}</p>
      )}

      {/* Loading skeleton */}
      {loadingNotes && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      )}

      {/* Notes list */}
      {!loadingNotes && notes.length === 0 && !fetchError && (
        <p className="text-sm text-slate-500">No notes yet. Add one below.</p>
      )}

      {!loadingNotes && notes.length > 0 && (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              {editingId === note.id ? (
                /* ── Edit mode ── */
                <div className="space-y-2">
                  <textarea
                    ref={editRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2
                      text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-500"
                  />
                  {editError && (
                    <p className="text-xs text-red-600">{editError}</p>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5
                        text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(note.id)}
                      disabled={!editContent.trim() || savingId === note.id}
                      className="flex items-center gap-1 rounded-lg bg-navy-700 px-3 py-1.5
                        text-xs font-medium text-white hover:bg-navy-800 disabled:opacity-60 transition-colors"
                    >
                      {savingId === note.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Check className="h-3.5 w-3.5" />}
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Read mode ── */
                <div>
                  <p className="whitespace-pre-wrap text-sm text-slate-800">{note.content}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {note.created_by} · {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                    {/* Action buttons — visible on hover */}
                    {note.user_id === userId && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(note)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-navy-700 transition-colors"
                          aria-label="Edit note"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          disabled={deletingId === note.id}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600
                            disabled:opacity-50 transition-colors"
                          aria-label="Delete note"
                        >
                          {deletingId === note.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* ── Add new note ── */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <textarea
          ref={textareaRef}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          onKeyDown={(e) => {
            // Cmd/Ctrl + Enter submits
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleAdd();
          }}
          placeholder="Add a note… (⌘ + Enter to save)"
          rows={3}
          className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2
            text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-500"
        />
        {addError && (
          <p className="mt-1 text-xs text-red-600">{addError}</p>
        )}
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleAdd}
            disabled={!newContent.trim() || addingNote}
            className="flex items-center gap-1.5 rounded-lg bg-navy-700 px-4 py-2 text-sm font-medium
              text-white hover:bg-navy-800 disabled:opacity-60 transition-colors"
          >
            {addingNote
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Plus className="h-4 w-4" />}
            {addingNote ? 'Adding…' : 'Add Note'}
          </button>
        </div>
      </div>
    </section>
  );
}
