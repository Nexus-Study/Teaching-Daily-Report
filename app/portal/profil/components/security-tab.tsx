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

  const fieldClass = 'min-h-11 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <section aria-labelledby="security-heading" className="max-w-2xl space-y-5">
      <div>
        <h2 id="security-heading" className="text-lg font-semibold text-white">Email &amp; Password</h2>
        <p className="mt-1 break-all text-sm text-slate-400">Email saat ini: {currentEmail || 'Belum tersedia'}</p>
      </div>

      {notice && (
        <div role={notice.tone === 'error' ? 'alert' : 'status'} aria-live="polite" className={`rounded-md border px-4 py-3 text-sm ${notice.tone === 'success' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-rose-400/30 bg-rose-400/10 text-rose-200'}`}>
          {notice.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Password Saat Ini <span className="text-rose-300">*</span></span>
          <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required autoComplete="current-password" disabled={isSaving} className={fieldClass} />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Email Baru <span className="text-xs font-normal text-slate-500">Opsional</span></span>
          <input type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} autoComplete="email" disabled={isSaving} placeholder="nama@contoh.id" className={fieldClass} />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Password Baru <span className="text-xs font-normal text-slate-500">Opsional</span></span>
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" disabled={isSaving} className={fieldClass} />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Konfirmasi Password Baru</span>
            <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" disabled={isSaving} className={fieldClass} />
          </label>
        </div>

        <button type="submit" disabled={isSaving || !currentPassword} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">
          {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan Kredensial
        </button>
      </form>

      <p className="flex items-start gap-2 border-t border-white/10 pt-4 text-xs leading-5 text-slate-400">
        <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
        Email baru mungkin memerlukan konfirmasi sebelum perubahan berlaku.
      </p>
    </section>
  );
}