import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import MobileNav from '@/app/portal/components/mobile-nav';
import Sidebar from '@/app/portal/components/sidebar';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/database';

type PortalLayoutProps = {
  children: ReactNode;
};

export default async function PortalLayout({ children }: PortalLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, nip_nisn, roles, avatar_url, phone_number, created_at, updated_at')
    .eq('id', user.id)
    .single<Profile>();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="lg:hidden">
        <MobileNav userRoles={profile?.roles ?? null} />
      </div>
      <div className="hidden lg:flex">
        <Sidebar userRoles={profile?.roles ?? null} />
      </div>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
