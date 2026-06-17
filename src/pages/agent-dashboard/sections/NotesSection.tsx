import {
  Calendar,
  ChevronDown,
  Mail,
  Pencil,
  Phone,
  StickyNote,
} from 'lucide-react';
import {useEffect, useMemo, useRef, useState} from 'react';
import {ClientAvatar, WillStatusBadge} from '../components/clientUi';
import type {AssignedUser, DashboardNote, NoteEntryType} from '../types';

const ACCENT = '#1D9E75';
const MAX_CHARS = 500;

type FilterKey = 'all' | NoteEntryType;

const NOTE_TYPES: {value: NoteEntryType; label: string}[] = [
  {value: 'call', label: 'Call'},
  {value: 'email', label: 'Email'},
  {value: 'meeting', label: 'Meeting'},
  {value: 'note', label: 'Note'},
];

const TYPE_META: Record<
  NoteEntryType,
  {label: string; dot: string; iconBg: string; iconFg: string; Icon: typeof Phone}
> = {
  call: {label: 'Call', dot: '#1D9E75', iconBg: 'rgba(29,158,117,0.12)', iconFg: '#1D9E75', Icon: Phone},
  email: {label: 'Email', dot: '#3B82F6', iconBg: 'rgba(59,130,246,0.12)', iconFg: '#2563EB', Icon: Mail},
  meeting: {label: 'Meeting', dot: '#D97706', iconBg: 'rgba(217,119,6,0.12)', iconFg: '#B45309', Icon: Calendar},
  note: {label: 'Note', dot: '#9CA3AF', iconBg: 'rgba(156,163,175,0.15)', iconFg: '#6B7280', Icon: StickyNote},
};

const FILTERS: {key: FilterKey; label: string}[] = [
  {key: 'all', label: 'All'},
  {key: 'call', label: 'Calls'},
  {key: 'email', label: 'Emails'},
  {key: 'meeting', label: 'Meetings'},
  {key: 'note', label: 'Notes'},
];

function formatTime(ts: string) {
  return new Date(ts).toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateDivider(ts: string) {
  return new Date(ts).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function groupByDate(notes: DashboardNote[]): {date: string; items: DashboardNote[]}[] {
  const sorted = [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const groups: {date: string; items: DashboardNote[]}[] = [];
  for (const note of sorted) {
    const date = formatDateDivider(note.createdAt);
    const last = groups[groups.length - 1];
    if (last?.date === date) {
      last.items.push(note);
    } else {
      groups.push({date, items: [note]});
    }
  }
  return groups;
}

function ClientSelector({
  users,
  selectedId,
  onSelect,
}: {
  users: AssignedUser[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = users.find((u) => u.id === selectedId) ?? users[0];

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (!selected) return null;

  return (
    <div className="relative max-w-lg" ref={ref}>
      <p className="notes-section-label mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B7C93]">
        Client
      </p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="notes-panel flex w-full items-center gap-3 px-4 py-3 text-left agent-dash-transition hover:border-[#1D9E75]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9E75]/30"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <ClientAvatar name={selected.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#1E2D3D]">{selected.name}</p>
          <div className="mt-1">
            <WillStatusBadge status={selected.willStatus} size="sm" />
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[#6B7C93] agent-dash-transition ${open ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      {open ? (
        <ul
          className="notes-panel absolute left-0 right-0 top-full z-30 mt-1.5 max-h-72 overflow-y-auto py-1 shadow-[0_8px_24px_rgba(30,45,61,0.1)]"
          role="listbox"
        >
          {users.map((u) => {
            const isSelected = u.id === selectedId;
            return (
              <li key={u.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(u.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left agent-dash-transition hover:bg-[#F4F6F8] ${
                    isSelected ? 'bg-[rgba(29,158,117,0.06)]' : ''
                  }`}
                >
                  <ClientAvatar name={u.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#1E2D3D]">{u.name}</p>
                    <div className="mt-1">
                      <WillStatusBadge status={u.willStatus} size="sm" />
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function TimelineEntry({
  note,
  isLast,
  editing,
  editBody,
  onStartEdit,
  onEditBody,
  onSaveEdit,
  onCancelEdit,
}: {
  note: DashboardNote;
  isLast: boolean;
  editing: boolean;
  editBody: string;
  onStartEdit: () => void;
  onEditBody: (v: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  const meta = TYPE_META[note.type];
  const Icon = meta.Icon;

  return (
    <li className="notes-timeline-entry group relative flex gap-4 pb-6 last:pb-0">
      {/* Dot + line */}
      <div className="relative flex shrink-0 flex-col items-center pt-1">
        <span
          className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-white"
          style={{backgroundColor: meta.iconBg, color: meta.iconFg}}
        >
          <Icon className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <span
          className={`absolute top-10 bottom-0 w-px bg-gradient-to-b from-[#E5E9EE] to-transparent ${isLast ? 'hidden' : ''}`}
          aria-hidden
        />
      </div>

      {/* Content card */}
      <div className="notes-panel min-w-0 flex-1 px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]"
              style={{backgroundColor: meta.iconBg, color: meta.iconFg}}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{backgroundColor: meta.dot}} />
              {meta.label}
            </span>
            {note.edited ? (
              <span className="text-[10px] italic text-[#6B7C93]">edited</span>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-[11px] tabular-nums text-[#6B7C93]">{formatTime(note.createdAt)}</span>
            {!editing ? (
              <button
                type="button"
                onClick={onStartEdit}
                className="rounded-lg p-1.5 text-[#6B7C93] opacity-0 agent-dash-transition hover:bg-[#F4F6F8] hover:text-[#1D9E75] group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9E75]/30"
                aria-label="Edit note"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            ) : null}
          </div>
        </div>

        {editing ? (
          <div className="mt-3">
            <textarea
              value={editBody}
              onChange={(e) => onEditBody(e.target.value)}
              rows={3}
              maxLength={MAX_CHARS}
              className="w-full resize-y rounded-xl border border-[#E5E9EE] bg-[#FAFBFC] px-3 py-2 text-sm text-[#1E2D3D] outline-none focus:ring-2 focus:ring-[#1D9E75]/30"
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={onSaveEdit}
                className="rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
                style={{backgroundColor: ACCENT}}
              >
                Save
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-xl border border-[#E5E9EE] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E2D3D] hover:bg-[#F4F6F8]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-[#1E2D3D]">{note.body}</p>
        )}
      </div>
    </li>
  );
}

type Props = {
  users: AssignedUser[];
  notes: DashboardNote[];
  onAddNote: (userId: string, body: string, type: NoteEntryType) => void;
  onEditNote: (id: string, body: string) => void;
};

export function NotesSection({users, notes, onAddNote, onEditNote}: Props) {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? '');
  const [draft, setDraft] = useState('');
  const [noteType, setNoteType] = useState<NoteEntryType>('note');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');

  const filtered = useMemo(() => {
    let list = notes.filter((n) => n.userId === selectedUserId);
    if (filter !== 'all') {
      list = list.filter((n) => n.type === filter);
    }
    return list;
  }, [notes, selectedUserId, filter]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const charCount = draft.length;

  function handleSave() {
    if (!draft.trim() || !selectedUserId) return;
    onAddNote(selectedUserId, draft.trim(), noteType);
    setDraft('');
  }

  return (
    <div className="notes-activity space-y-6">
      <div>
        <p className="notes-section-label text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B7C93]">
          Notes & activity
        </p>
        <p className="mt-1 text-sm text-[#6B7C93]">Client communication log — internal team use only</p>
      </div>

      <ClientSelector users={users} selectedId={selectedUserId} onSelect={setSelectedUserId} />

      {/* Add note card */}
      <div className="notes-panel p-5">
        <p className="notes-section-label mb-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B7C93]">
          Add entry
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {NOTE_TYPES.map(({value, label}) => {
            const active = noteType === value;
            const meta = TYPE_META[value];
            return (
              <button
                key={value}
                type="button"
                onClick={() => setNoteType(value)}
                className="rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] agent-dash-transition"
                style={
                  active
                    ? {
                        backgroundColor: meta.iconBg,
                        color: meta.iconFg,
                        boxShadow: `inset 0 0 0 1px ${meta.dot}55`,
                      }
                    : {
                        backgroundColor: '#F4F6F8',
                        color: '#6B7C93',
                        boxShadow: 'inset 0 0 0 0.5px #E5E9EE',
                      }
                }
              >
                {label}
              </button>
            );
          })}
        </div>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MAX_CHARS))}
          rows={4}
          placeholder="Write a concise note for your team…"
          className="w-full resize-y rounded-xl border border-[#E5E9EE] bg-[#FAFBFC] px-4 py-3 text-sm leading-relaxed text-[#1E2D3D] placeholder:text-[#6B7C93]/55 outline-none agent-dash-transition focus:border-[#1D9E75]/40 focus:ring-2 focus:ring-[#1D9E75]/20"
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <span
            className={`text-xs tabular-nums ${charCount >= MAX_CHARS ? 'font-semibold text-amber-700' : 'text-[#6B7C93]'}`}
          >
            {charCount}/{MAX_CHARS}
          </span>
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={handleSave}
            className="rounded-xl px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white agent-dash-transition disabled:opacity-40 hover:brightness-95"
            style={{backgroundColor: ACCENT}}
          >
            Save
          </button>
        </div>
      </div>

      {/* Feed */}
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="notes-section-label text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B7C93]">
            Chronological feed
          </p>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map(({key, label}) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] agent-dash-transition"
                  style={
                    active
                      ? {backgroundColor: ACCENT, color: '#fff'}
                      : {
                          backgroundColor: '#fff',
                          color: '#6B7C93',
                          boxShadow: 'inset 0 0 0 0.5px #E5E9EE',
                        }
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="notes-panel flex flex-col items-center justify-center px-6 py-14 text-center">
            <StickyNote className="mb-3 h-8 w-8 text-[#6B7C93]/40" strokeWidth={1.5} />
            <p className="text-sm font-medium text-[#6B7C93]">
              {filter === 'all' ? 'No entries for this client yet.' : `No ${FILTERS.find((f) => f.key === filter)?.label.toLowerCase()} to show.`}
            </p>
            <p className="mt-1 text-xs text-[#6B7C93]/70">Add an entry above or try a different filter.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(({date, items}) => (
              <div key={date}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="notes-section-label shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B7C93]">
                    {date}
                  </span>
                  <span className="h-px flex-1 bg-[#E5E9EE]" aria-hidden />
                </div>
                <ul className="notes-timeline pl-1">
                  {items.map((n, idx) => (
                    <TimelineEntry
                      key={n.id}
                      note={n}
                      isLast={idx === items.length - 1}
                      editing={editingId === n.id}
                      editBody={editBody}
                      onStartEdit={() => {
                        setEditingId(n.id);
                        setEditBody(n.body);
                      }}
                      onEditBody={setEditBody}
                      onSaveEdit={() => {
                        onEditNote(n.id, editBody.trim());
                        setEditingId(null);
                      }}
                      onCancelEdit={() => setEditingId(null)}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
