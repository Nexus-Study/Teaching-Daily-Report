import Link from 'next/link';

const tabs = [
  { href: '/portal/perilaku/input', label: 'Input Catatan' },
  { href: '/portal/perilaku/rekap', label: 'Rekap & Eskalasi' },
];

export default function BehaviorTabs({ activeHref }: { activeHref: string }) {
  return (
    <nav aria-label="Navigasi modul perilaku" className="grid grid-cols-2 rounded-2xl border border-border bg-card p-1 shadow-sm">
      {tabs.map((tab) => {
        const isActive = tab.href === activeHref;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex min-h-[44px] items-center justify-center rounded-xl px-3 text-center text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
              isActive ? 'bg-rose-700 text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
