'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '../../lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <main style={styles.page}>
      <section style={styles.shell}>
        <div style={styles.hero}>
          <p style={styles.kicker}>PWA Madrasah Terpadu</p>
          <h1 style={styles.title}>Masuk ke portal guru dan staf dengan Supabase Auth.</h1>
          <p style={styles.copy}>
            Gunakan email dan kata sandi akun Supabase untuk mengakses portal berbasis role.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.card}>
          <label style={styles.label}>
            Email
            <input
              style={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@madrasah.sch.id"
              required
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              style={styles.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan password"
              required
            />
          </label>

          {error ? <p style={styles.error}>{error}</p> : null}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          min-height: 100%;
        }
      `}</style>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
    background:
      'radial-gradient(circle at top left, rgba(56, 189, 248, 0.24), transparent 32%), radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.18), transparent 28%), linear-gradient(180deg, #081120 0%, #0f172a 100%)',
    color: '#e2e8f0',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  shell: {
    width: 'min(960px, 100%)',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    alignItems: 'stretch',
  },
  hero: {
    padding: '32px',
    borderRadius: '24px',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    backdropFilter: 'blur(18px)',
    boxShadow: '0 24px 80px rgba(2, 6, 23, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  kicker: {
    margin: '0 0 14px',
    color: '#7dd3fc',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    fontSize: '12px',
    fontWeight: 700,
  },
  title: {
    margin: 0,
    fontSize: 'clamp(2rem, 4vw, 3.4rem)',
    lineHeight: 1.05,
    color: '#f8fafc',
  },
  copy: {
    margin: '16px 0 0',
    maxWidth: '52ch',
    fontSize: '16px',
    lineHeight: 1.7,
    color: '#cbd5e1',
  },
  card: {
    padding: '28px',
    borderRadius: '24px',
    background: 'rgba(15, 23, 42, 0.85)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    backdropFilter: 'blur(18px)',
    boxShadow: '0 24px 80px rgba(2, 6, 23, 0.45)',
    display: 'grid',
    gap: '18px',
    alignContent: 'start',
  },
  label: {
    display: 'grid',
    gap: '8px',
    fontSize: '14px',
    color: '#cbd5e1',
  },
  input: {
    width: '100%',
    borderRadius: '14px',
    border: '1px solid rgba(148, 163, 184, 0.24)',
    background: 'rgba(15, 23, 42, 0.92)',
    color: '#f8fafc',
    padding: '14px 16px',
    fontSize: '15px',
    outline: 'none',
  },
  button: {
    marginTop: '4px',
    border: 'none',
    borderRadius: '14px',
    padding: '14px 18px',
    background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
    color: '#eff6ff',
    fontWeight: 700,
    fontSize: '15px',
    cursor: 'pointer',
  },
  error: {
    margin: 0,
    color: '#fca5a5',
    fontSize: '14px',
  },
};