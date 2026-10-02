file app/portal/profil/component/profile-tab.tsx
```js
const dayOptions: HariName[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const hourOptions = Array.from({ length: 8 }, (_, index) => index + 1);
const roleOptions: Array<{ value: UserRole; label: string }> = [
  { value: 'guru_mapel', label: 'Guru Mapel' },
  { value: 'wali_kelas', label: 'Wali Kelas' },
  // { value: 'guru_piket', label: 'Guru Piket' },
  { value: 'guru_bk', label: 'Guru BK' },
  // { value: 'pembina_ekskul', label: 'Pembina Ekskul' },
  { value: 'waka_kesiswaan', label: 'Waka Kesiswaan' },
  { value: 'waka_kurikulum', label: 'Waka Kurikulum' },
  { value: 'guru_tahfidz', label: 'Guru Tahfidz' },
];
```
Guru piket dan pembina ekskul di jadikan komentar dulu karena di aplikasi menghasilkan `invalid input value for enum user_role: "guru_piket"`
