import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <section className="w-full max-w-lg border-l-2 border-primary pl-6">
        <p className="text-sm font-medium text-muted-foreground">Portal Madrasah</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Alamat yang dibuka tidak tersedia atau sudah dipindahkan.
        </p>
        <Link
          href="/portal"
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Kembali ke portal
        </Link>
      </section>
    </main>
  );
}
