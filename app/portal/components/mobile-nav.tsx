'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LogOut, Menu, X, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
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

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    closeButtonRef.current?.focus();

    return () => {
      if (dialog.open) dialog.close();
      if (triggerRef.current?.isConnected) triggerRef.current.focus();
      triggerRef.current = null;
    };
  }, [isOpen]);

  function handleDialogCancel(event: React.SyntheticEvent<HTMLDialogElement, Event>) {
    event.preventDefault();
    if (!isLoggingOut) setIsOpen(false);
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        setLogoutError(error.message);
        return;
      }

      setIsOpen(false);
      router.push('/login');
      router.refresh();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Gagal keluar dari akun.');
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 text-card-foreground backdrop-blur lg:hidden">
        <h1 className="truncate pr-3 text-sm font-semibold text-foreground">{headerTitle}</h1>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? 'Tutup navigasi' : 'Buka navigasi'}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation-drawer"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-card-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <nav
        aria-label="Navigasi utama"
        className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-card/95 px-2 backdrop-blur lg:hidden"
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
              className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-md px-2 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                isActive ? 'font-semibold text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <dialog
        ref={dialogRef}
        id="mobile-navigation-drawer"
        aria-label="Navigasi portal"
        aria-modal="true"
        onCancel={handleDialogCancel}
        onClick={(event) => {
          if (event.target === event.currentTarget && !isLoggingOut) setIsOpen(false);
        }}
        className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-hidden border-0 bg-transparent p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <aside
          className="absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col border-l border-border bg-card text-card-foreground shadow-2xl"
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
            <span className="text-sm font-semibold text-card-foreground">Navigasi</span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup navigasi"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setIsOpen(false)}
                  className={`flex min-h-12 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary font-medium text-primary-foreground'
                      : 'text-card-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} aria-hidden="true" />
                  <span>{menu.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="shrink-0 border-t border-border p-3">
            {logoutError ? <p role="alert" className="mb-2 rounded-md bg-muted p-3 text-sm text-card-foreground">{logoutError}</p> : null}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex min-h-12 w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-wait disabled:opacity-60"
            >
              <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{isLoggingOut ? 'Keluar...' : 'Logout'}</span>
            </button>
          </div>
        </aside>
      </dialog>
    </>
  );
}
