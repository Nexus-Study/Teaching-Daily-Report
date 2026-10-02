'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

import { portalMenus } from '@/app/portal/config/menu';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types/database';

type MobileNavProps = {
  userRoles?: UserRole[] | null;
};

function normalizePath(path: string) {
  return path.replace(/\/+$/, '') || '/';
}

export default function MobileNav({ userRoles }: MobileNavProps) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const currentPath = normalizePath(pathname);
  const visibleMenus = portalMenus.filter((menu) => menu.roles.some((role) => userRoles?.includes(role)));
  const activeMenu = visibleMenus.find((menu) => {
    const menuPath = normalizePath(menu.href);
    return currentPath === menuPath || currentPath.startsWith(`${menuPath}/`);
  });
  const headerTitle = currentPath === '/portal' ? 'Portal Madrasah' : activeMenu?.title ?? 'Portal Madrasah';

  async function handleLogout() {
    setIsOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/95">
        <h1 className="truncate pr-3 text-sm font-semibold text-slate-900 dark:text-white">{headerTitle}</h1>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? 'Tutup navigasi' : 'Buka navigasi'}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation-drawer"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <div
        className={`pointer-events-none fixed inset-0 z-50 lg:hidden ${isOpen ? 'pointer-events-auto' : ''}`}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Tutup navigasi"
          onClick={() => setIsOpen(false)}
          className={`absolute inset-0 h-full w-full bg-black/60 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal={isOpen}
          aria-label="Navigasi portal"
          className={`absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Navigasi</span>
            <button
              type="button"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => setIsOpen(false)}
              aria-label="Tutup navigasi"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Menu portal" className="flex-1 space-y-1 overflow-y-auto p-3">
            {visibleMenus.map((menu) => {
              const Icon = menu.icon;
              const menuPath = normalizePath(menu.href);
              const isActive = currentPath === menuPath || currentPath.startsWith(`${menuPath}/`);

              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  tabIndex={isOpen ? 0 : -1}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setIsOpen(false)}
                  className={`flex min-h-12 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-600 font-medium text-white'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : menu.iconClass}`} aria-hidden="true" />
                  <span>{menu.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
            <button
              type="button"
              tabIndex={isOpen ? 0 : -1}
              onClick={handleLogout}
              className="flex min-h-12 w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
