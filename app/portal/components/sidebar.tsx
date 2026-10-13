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
  const visibleMenus = portalMenus.filter((menu) => menu.roles.some((role) => userRoles?.includes(role)));

  async function handleLogout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return;
    }

    router.push('/login');
    router.refresh();
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
          title={isCollapsed ? 'Perlebar sidebar' : 'Kecilkan sidebar'}
          className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav aria-label="Navigasi portal" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
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
              className={`flex min-h-[44px] min-w-[44px] items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                isActive
                  ? 'bg-indigo-600 font-medium text-white'
                  : 'text-card-foreground hover:bg-slate-100'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-600'}`} aria-hidden="true" />
              {!isCollapsed && <span className="truncate">{menu.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
          title={isCollapsed ? 'Logout' : undefined}
          className={`flex min-h-[44px] min-w-[44px] w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
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
