import {Pencil} from 'lucide-react';
import {useEffect, useState} from 'react';
import {doc, getDoc, updateDoc} from 'firebase/firestore';
import {useAuth} from '../../../auth/AuthContext';
import {
  MOCK_DB_USERS_KEY,
  MOCK_EMAIL_STORAGE_KEY,
  MOCK_REGISTERED_USERS_KEY,
  findMockDbUserByEmail,
  findMockRegisteredAccount,
  getMockSession,
  notifyMockAuthChanged,
} from '../../../auth/mockAuth';
import {ADMIN_ACCESS_TABLE} from '../../../data/adminMockData';
import {getPortalFirebaseDb, isFirebaseConfigured} from '../../../firebase/client';

type Props = {
  adminName: string;
  adminEmail: string;
  onSignOut: () => void;
};

type EditableFieldKey = 'name' | 'email' | 'phone';

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

function EditableProfileField({
  label,
  value,
  editing,
  onEdit,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  editing: boolean;
  onEdit: () => void;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        {editing ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            autoFocus
            placeholder={placeholder}
            className="w-full rounded-2xl border border-[#5097A4]/60 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm outline-none transition focus:border-[#5097A4] focus:ring-4 focus:ring-[#5097A4]/10"
          />
        ) : (
          <>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#1E2D3D]">
              {value || <span className="text-[#6B7C93]">Not set</span>}
            </span>
            <button
              type="button"
              onClick={onEdit}
              className="agent-dash-transition shrink-0 rounded-full p-2 text-[#5097A4] hover:bg-[rgba(80,151,164,0.08)]"
              aria-label={`Edit ${label.toLowerCase()}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={2} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function AdminSettingsSection({adminName, adminEmail, onSignOut}: Props) {
  const {profile, applyProfile} = useAuth();
  const [fullName, setFullName] = useState(adminName);
  const [email, setEmail] = useState(adminEmail);
  const [phone, setPhone] = useState('');
  const [editingField, setEditingField] = useState<EditableFieldKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setFullName(adminName);
    setEmail(adminEmail);
  }, [adminName, adminEmail]);

  useEffect(() => {
    let cancelled = false;

    async function loadPhone() {
      if (!profile?.uid) {
        return;
      }

      if (isFirebaseConfigured) {
        const db = getPortalFirebaseDb();
        if (!db) return;

        try {
          const snap = await getDoc(doc(db, 'users', profile.uid));
          if (!cancelled && snap.exists()) {
            const data = snap.data();
            setPhone(String(data.phone ?? data.phoneNumber ?? ''));
          }
        } catch {
          // Keep empty phone when Firestore read fails.
        }
        return;
      }

      const registered = findMockRegisteredAccount(profile.email);
      if (!cancelled) {
        setPhone(registered?.phone ?? '');
      }
    }

    void loadPhone();

    return () => {
      cancelled = true;
    };
  }, [profile?.uid, profile?.email]);

  function updateMockProfile(nextName: string, nextEmail: string, nextPhone: string) {
    const session = getMockSession();
    if (!session || !profile) {
      throw new Error('No active mock session.');
    }

    const {firstName, lastName} = splitFullName(nextName);
    const dbUsersRaw = localStorage.getItem(MOCK_DB_USERS_KEY);
    const dbUsers = dbUsersRaw ? (JSON.parse(dbUsersRaw) as Array<Record<string, unknown>>) : [];
    const emailKey = session.email.trim().toLowerCase();
    const existingDbUser = findMockDbUserByEmail(session.email);

    const updatedDbUser = {
      uid: existingDbUser?.uid ?? profile.uid,
      email: nextEmail.trim(),
      firstName,
      lastName,
      role: profile.role,
      isActive: true,
      createdAt: existingDbUser?.createdAt ?? profile.createdAt ?? new Date(),
    };

    const nextDbUsers = [
      updatedDbUser,
      ...dbUsers.filter((user) => String(user.email ?? '').trim().toLowerCase() !== emailKey),
    ];
    localStorage.setItem(MOCK_DB_USERS_KEY, JSON.stringify(nextDbUsers));

    const registeredRaw = localStorage.getItem(MOCK_REGISTERED_USERS_KEY);
    const registeredUsers = registeredRaw ? (JSON.parse(registeredRaw) as Array<Record<string, unknown>>) : [];
    const nextRegistered = registeredUsers.map((user) => {
      if (String(user.email ?? '').trim().toLowerCase() !== emailKey) {
        return user;
      }
      return {
        ...user,
        firstName,
        lastName,
        email: nextEmail.trim(),
        phone: nextPhone.trim() || null,
      };
    });
    localStorage.setItem(MOCK_REGISTERED_USERS_KEY, JSON.stringify(nextRegistered));

    if (nextEmail.trim().toLowerCase() !== emailKey) {
      localStorage.setItem(MOCK_EMAIL_STORAGE_KEY, nextEmail.trim());
    }

    applyProfile({
      ...profile,
      email: nextEmail.trim(),
      firstName,
      lastName,
    });
    notifyMockAuthChanged();
  }

  async function handleSave() {
    setSuccessMessage('');
    setErrorMessage('');

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      setErrorMessage('Could not save changes. Try again.');
      return;
    }

    if (!profile?.uid) {
      setErrorMessage('Could not save changes. Try again.');
      return;
    }

    const {firstName, lastName} = splitFullName(trimmedName);

    setSaving(true);

    try {
      if (isFirebaseConfigured) {
        const db = getPortalFirebaseDb();
        if (!db) {
          throw new Error('Firebase is not configured.');
        }

        await updateDoc(doc(db, 'users', profile.uid), {
          firstName,
          lastName,
          email: trimmedEmail,
          phone: phone.trim(),
        });

        applyProfile({
          ...profile,
          firstName,
          lastName,
          email: trimmedEmail,
        });
      } else {
        updateMockProfile(trimmedName, trimmedEmail, phone);
      }

      setEditingField(null);
      setSuccessMessage('Profile updated successfully');
      window.setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setErrorMessage('Could not save changes. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="agent-overview-panel p-6 md:p-7">
        <p className="mw-section-label mb-5 text-[11px] text-[#6B7C93]">Admin profile</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <EditableProfileField
            label="Full name"
            value={fullName}
            editing={editingField === 'name'}
            onEdit={() => setEditingField('name')}
            onChange={setFullName}
            onBlur={() => setEditingField(null)}
          />
          <EditableProfileField
            label="Email"
            value={email}
            editing={editingField === 'email'}
            onEdit={() => setEditingField('email')}
            onChange={setEmail}
            onBlur={() => setEditingField(null)}
            type="email"
          />
          <EditableProfileField
            label="Phone number"
            value={phone}
            editing={editingField === 'phone'}
            onEdit={() => setEditingField('phone')}
            onChange={setPhone}
            onBlur={() => setEditingField(null)}
            placeholder="+27 …"
          />
          <div className="flex items-end">
            <span
              className="inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ring-1"
              style={{
                backgroundColor: 'rgba(80,151,164,0.16)',
                color: '#3E8491',
                boxShadow: 'inset 0 0 0 1px rgba(80,151,164,0.4)',
              }}
            >
              Admin
            </span>
          </div>
        </div>
        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="w-full rounded-2xl bg-[#5097A4] px-5 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#458A97] disabled:opacity-60"
          >
            Save changes
          </button>
          {successMessage ? (
            <p className="text-center text-xs font-semibold text-emerald-700">{successMessage}</p>
          ) : null}
          {errorMessage ? (
            <p className="text-center text-xs font-semibold text-rose-700">{errorMessage}</p>
          ) : null}
        </div>
      </div>

      <div className="agent-overview-panel p-6 md:p-7">
        <p className="mw-section-label mb-5 text-[11px] text-[#6B7C93]">Portal access info</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5E9EE] text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B7C93]">
                <th className="pb-3 pr-4">Page</th>
                <th className="pb-3 pr-4">Admin</th>
                <th className="pb-3">Agent</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_ACCESS_TABLE.map((row) => (
                <tr key={row.page} className="border-b border-[#EEF1F4] last:border-0">
                  <td className="py-3 pr-4 font-medium text-[#1E2D3D]">{row.page}</td>
                  <td className="py-3 pr-4 text-[#5097A4]">{row.admin ? 'Yes' : 'No'}</td>
                  <td className="py-3 text-[#6B7C93]">{row.agent ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="agent-overview-panel p-6 md:p-7">
        <p className="mw-section-label mb-3 text-[11px] text-[#6B7C93]">Session</p>
        <p className="mb-4 text-sm text-[#6B7C93]">Sign out of the admin dashboard and return to the login page.</p>
        <button
          type="button"
          onClick={onSignOut}
          className="rounded-2xl bg-[#5097A4] px-5 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#458A97]"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
