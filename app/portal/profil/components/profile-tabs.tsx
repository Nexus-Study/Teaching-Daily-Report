'use client';

import { useState } from 'react';
import { KeyRound, UserRound } from 'lucide-react';

import type { Kelas, MataPelajaran, Profile } from '@/types/database';
import ProfileTab, { type ProfileSchedule } from './profile-tab';
import SecurityTab from './security-tab';

type ProfileTabsProps = {
  profile: Profile;
  mataPelajaranList: MataPelajaran[];
  kelasList: Kelas[];
  jadwalList: ProfileSchedule[];
  currentEmail: string;
};

type ActiveTab = 'profile' | 'security';

export default function ProfileTabs({ profile, mataPelajaranList, kelasList, jadwalList, currentEmail }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');

  const tabClass = (tab: ActiveTab) =>
    `inline-flex min-h-12 items-center justify-center gap-2 border-b-2 px-3 py-3 text-center text-sm font-semibold transition-colors sm:px-5 ${
      activeTab === tab
        ? 'border-cyan-400 text-cyan-300'
        : 'border-transparent text-slate-400 hover:text-white'
    }`;

  return (
    <div>
      <div role="tablist" aria-label="Pengaturan profil" className="grid grid-cols-1 border-b border-white/10 sm:grid-cols-2">
        <button
          type="button"
          role="tab"
          id="profile-tab"
          aria-selected={activeTab === 'profile'}
          aria-controls="profile-panel"
          onClick={() => setActiveTab('profile')}
          className={tabClass('profile')}
        >
          <UserRound className="h-4 w-4" aria-hidden="true" />
          <span>Profil &amp; Jadwal Mengajar</span>
        </button>
        <button
          type="button"
          role="tab"
          id="security-tab"
          aria-selected={activeTab === 'security'}
          aria-controls="security-panel"
          onClick={() => setActiveTab('security')}
          className={tabClass('security')}
        >
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          <span>Ubah Email &amp; Password</span>
        </button>
      </div>

      <section id="profile-panel" role="tabpanel" aria-labelledby="profile-tab" hidden={activeTab !== 'profile'} className="pt-5">
        <ProfileTab profile={profile} mataPelajaranList={mataPelajaranList} kelasList={kelasList} jadwalList={jadwalList} />
      </section>
      <section id="security-panel" role="tabpanel" aria-labelledby="security-tab" hidden={activeTab !== 'security'} className="pt-5">
        <SecurityTab currentEmail={currentEmail} />
      </section>
    </div>
  );
}