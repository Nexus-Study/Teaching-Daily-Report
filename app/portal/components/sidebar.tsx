'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useState } from 'react';

import { portalMenus } from '@/app/portal/config/menu';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types/database';

type SidebarProps = {
  userRoles?: UserRole[] | null;
};

export default function Sidebar({ userRoles }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const visibleMenus = portalMenus.filter((menu) => menu.roles.some((role) => userRoles?.includes(role)));

  async function handleLogout() {
    setLogoutError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        setLogoutError(error.message);
        return;
      }

      router.push('/login');
      router.refresh();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Gagal keluar dari akun.');
    }
  }

  return (
    <aside
      className={`hidden h-screen shrink-0 flex-col border-r border-border bg-card text-card-foreground transition-[width] duration-300 ease-in-out lg:flex ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className={`flex h-16 items-center border-b border-border ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        {!isCollapsed && <span className="truncate text-sm font-semibold">Portal Madrasah</span>}
        <button
          type="button"
          onClick={() => setIsCollapsed((collapsed) => !collapsed)}
          aria-label={isCollapsed ? 'Perlebar sidebar' : 'Kecilkan sidebar'}
          aria-expanded={!isCollapsed}
          aria-controls="portal-sidebar-navigation"
          title={isCollapsed ? 'Perlebar sidebar' : 'Kecilkan sidebar'}
          className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav id="portal-sidebar-navigation" aria-label="Navigasi portal" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleMenus.map((menu) => {
          const Icon = menu.icon;
          const menuPath = menu.href.replace(/\/$/, '');
          const isActive = pathname === menuPath || pathname.startsWith(`${menuPath}/`);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              aria-current={isActive ? 'page' : undefined}
              aria-label={isCollapsed ? menu.title : undefined}
              title={isCollapsed ? menu.title : undefined}
              className={`flex min-h-[44px] min-w-[44px] items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                isActive
                  ? 'bg-primary font-medium text-primary-foreground'
                  : 'text-card-foreground hover:bg-muted'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} aria-hidden="true" />
              {!isCollapsed && <span className="truncate">{menu.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        {logoutError ? <p role="alert" className="mb-2 rounded-md bg-muted p-3 text-sm text-card-foreground">{logoutError}</p> : null}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
          title={isCollapsed ? 'Logout' : undefined}
          className={`flex min-h-[44px] min-w-[44px] w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
