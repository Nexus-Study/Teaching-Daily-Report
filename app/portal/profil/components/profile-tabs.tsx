'use client';

import { useState, type KeyboardEvent } from 'react';
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
    `inline-flex min-h-[44px] items-center justify-center gap-2 border-b-2 bg-card px-4 py-2.5 text-center text-sm font-semibold transition-colors focus-visible:outline-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 ${
      activeTab === tab
        ? 'border-indigo-600 text-slate-900'
        : 'border-transparent text-slate-500 hover:text-slate-700'
    }`;

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const currentIndex = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (currentIndex < 0 || tabs.length === 0) return;

    event.preventDefault();
    const nextIndex = (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  };

  return (
    <div>
      <div role="tablist" aria-label="Pengaturan profil" onKeyDown={handleTabKeyDown} className="grid grid-cols-1 border-b border-slate-200 bg-card sm:grid-cols-2">
        <button
          type="button"
          role="tab"
          id="tab-profile"
          aria-selected={activeTab === 'profile'}
          aria-controls="panel-profile"
          tabIndex={activeTab === 'profile' ? 0 : -1}
          onClick={() => setActiveTab('profile')}
          className={tabClass('profile')}
        >
          <UserRound className="h-4 w-4" aria-hidden="true" />
          <span>Profil &amp; Jadwal Mengajar</span>
        </button>
        <button
          type="button"
          role="tab"
          id="tab-security"
          aria-selected={activeTab === 'security'}
          aria-controls="panel-security"
          tabIndex={activeTab === 'security' ? 0 : -1}
          onClick={() => setActiveTab('security')}
          className={tabClass('security')}
        >
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          <span>Ubah Email &amp; Password</span>
        </button>
      </div>

      <section id="panel-profile" role="tabpanel" aria-labelledby="tab-profile" tabIndex={0} hidden={activeTab !== 'profile'} className="pt-5">
        <ProfileTab profile={profile} mataPelajaranList={mataPelajaranList} kelasList={kelasList} jadwalList={jadwalList} />
      </section>
      <section id="panel-security" role="tabpanel" aria-labelledby="tab-security" tabIndex={0} hidden={activeTab !== 'security'} className="pt-5">
        <SecurityTab currentEmail={currentEmail} />
      </section>
    </div>
  );
}