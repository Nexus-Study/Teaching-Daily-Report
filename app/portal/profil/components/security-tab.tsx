'use client';

import { useState, type FormEvent } from 'react';
import { KeyRound, LoaderCircle, Save } from 'lucide-react';

import { updateSecurityCredentials } from '../actions';

type SecurityTabProps = {
  currentEmail: string;
};

export default function SecurityTab({ currentEmail }: SecurityTabProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    if (newPassword && newPassword !== confirmPassword) {
      setNotice({ tone: 'error', message: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateSecurityCredentials(currentPassword, newEmail || undefined, newPassword || undefined);
      setNotice({ tone: result.success ? 'success' : 'error', message: result.message });
      if (result.success) {
        setCurrentPassword('');
        setNewEmail('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Kredensial gagal diperbarui.' });
    } finally {
      setIsSaving(false);
    }
  }

  const fieldClass = 'min-h-11 w-full rounded-md border border-border bg-card px-3 text-sm text-slate-900 transition placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-muted disabled:text-slate-600 disabled:opacity-100';

  return (
    <section aria-labelledby="security-heading" className="max-w-2xl space-y-5 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
      <div>
        <h2 id="security-heading" className="text-lg font-semibold text-slate-900">Email &amp; Password</h2>
        <p className="mt-1 break-all text-sm text-slate-600">Email saat ini: {currentEmail || 'Belum tersedia'}</p>
      </div>

      {notice && (
        <div role={notice.tone === 'error' ? 'alert' : 'status'} aria-live={notice.tone === 'error' ? 'assertive' : 'polite'} className={`rounded-md border px-4 py-3 text-sm ${notice.tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
          {notice.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Password Saat Ini <span className="text-rose-700">*</span></span>
          <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required autoComplete="current-password" disabled={isSaving} className={fieldClass} />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Email Baru <span className="text-xs font-normal text-slate-600">Opsional</span></span>
          <input type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} autoComplete="email" disabled={isSaving} placeholder="nama@contoh.id" className={fieldClass} />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Password Baru <span className="text-xs font-normal text-slate-600">Opsional</span></span>
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" disabled={isSaving} className={fieldClass} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Konfirmasi Password Baru</span>
            <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" disabled={isSaving} className={fieldClass} />
          </label>
        </div>

        <button type="submit" disabled={isSaving || !currentPassword} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-indigo-700 px-4 text-sm font-semibold text-white transition hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">
          {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan Kredensial
        </button>
      </form>

      <p className="flex items-start gap-2 border-t border-border pt-4 text-xs leading-5 text-slate-600">
        <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-indigo-700" aria-hidden="true" />
        Email baru mungkin memerlukan konfirmasi sebelum perubahan berlaku.
      </p>
    </section>
  );
}