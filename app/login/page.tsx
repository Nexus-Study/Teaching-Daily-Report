'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, School } from 'lucide-react';

import { createClient } from '../../lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.replace('/portal');
      }
    };

    void checkSession();
  }, [router, supabase]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.replace('/portal');
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-[max(1.5rem,env(safe-area-inset-top))] text-foreground">
      <section className="mx-auto grid w-full max-w-5xl gap-4 md:grid-cols-[1fr_0.9fr]">
        <div className="flex flex-col justify-center rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8 md:p-10">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <School className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            PWA Madrasah Terpadu
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Masuk ke portal guru dan staf.
          </h1>
          <p className="mt-3 max-w-prose text-sm leading-6 text-muted-foreground">
            Gunakan email dan kata sandi akun Supabase untuk mengakses portal berbasis role.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-busy={loading}
          className="grid content-center gap-5 rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8"
        >
          <div>
            <h2 className="text-lg font-semibold">Masuk</h2>
            <p className="mt-1 text-sm text-muted-foreground">Masukkan kredensial akun Anda.</p>
          </div>

          <label htmlFor="login-email" className="grid gap-2 text-sm font-medium">
            Email
            <input
              id="login-email"
              className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@madrasah.sch.id"
              required
            />
          </label>

          <label htmlFor="login-password" className="grid gap-2 text-sm font-medium">
            Password
            <span className="relative block">
              <input
                id="login-password"
                className="min-h-12 w-full rounded-xl border border-input bg-background px-4 pr-12 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                aria-controls="login-password"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-1 inline-flex w-10 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {showPassword
                  ? <EyeOff className="h-4 w-4" aria-hidden="true" />
                  : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </span>
          </label>

          {error ? (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {error}
            </p>
          ) : null}

          <button
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Memproses…' : 'Masuk'}
          </button>
        </form>
      </section>
    </main>
  );
}