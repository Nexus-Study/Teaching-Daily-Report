'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LogOut, Menu, X, type LucideIcon } from 'lucide-react';
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

type BottomNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  activePaths: string[];
};

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
  const findMenu = (href: string) => visibleMenus.find((menu) => normalizePath(menu.href) === href);
  const journalMenu = findMenu('/portal/jurnal');
  const behaviorMenu = visibleMenus.find((menu) => normalizePath(menu.href).startsWith('/portal/perilaku'));
  const reportsMenu = findMenu('/portal/laporan');
  const attendanceMenu = findMenu('/portal/rekap-kehadiran');
  const profileMenu = findMenu('/portal/profil');
  const summaryMenu = reportsMenu ?? attendanceMenu;
  const bottomNavItems: BottomNavItem[] = [
    { href: '/portal', label: 'Home', icon: Home, activePaths: ['/portal'] },
    ...(journalMenu ? [{ href: '/portal/jurnal', label: 'Jurnal', icon: journalMenu.icon, activePaths: ['/portal/jurnal'] }] : []),
    ...(behaviorMenu ? [{ href: '/portal/perilaku/input', label: 'Perilaku', icon: behaviorMenu.icon, activePaths: ['/portal/perilaku'] }] : []),
    ...(summaryMenu
      ? [{
          href: normalizePath(summaryMenu.href),
          label: 'Rekap',
          icon: summaryMenu.icon,
          activePaths: ['/portal/laporan', '/portal/rekap-kehadiran'],
        }]
      : []),
    ...(profileMenu ? [{ href: '/portal/profil', label: 'Profil', icon: profileMenu.icon, activePaths: ['/portal/profil'] }] : []),
  ];

  async function handleLogout() {
    setIsOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <h1 className="truncate pr-3 text-sm font-semibold text-slate-900">{headerTitle}</h1>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? 'Tutup navigasi' : 'Buka navigasi'}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation-drawer"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <nav
        aria-label="Navigasi utama"
        className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur lg:hidden"
      >
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.activePaths.some(
            (path) => currentPath === path || (path !== '/portal' && currentPath.startsWith(`${path}/`)),
          );

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-md px-2 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                isActive ? 'font-semibold text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

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
          className={`absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4">
            <span className="text-sm font-semibold text-slate-900">Navigasi</span>
            <button
              type="button"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => setIsOpen(false)}
              aria-label="Tutup navigasi"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100"
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
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-indigo-600'}`} aria-hidden="true" />
                  <span>{menu.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="shrink-0 border-t border-slate-200 p-3">
            <button
              type="button"
              tabIndex={isOpen ? 0 : -1}
              onClick={handleLogout}
              className="flex min-h-12 w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
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
