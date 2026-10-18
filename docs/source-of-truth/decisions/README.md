# Catatan Keputusan Arsitektur (ADR)

Gunakan ADR untuk keputusan yang telah disetujui dan berdampak lintas fitur atau mengubah arsitektur, keamanan, skema data, integrasi, atau pola operasional. ADR menyimpan alasan dan konsekuensi keputusan; ADR bukan daftar usulan.

## Status

- **Proposed** — diajukan untuk ditinjau; belum mengikat.
- **Accepted** — disetujui eksplisit; menjadi keputusan yang berlaku.
- **Superseded** — digantikan keputusan lain; tautkan ke ADR pengganti.
- **Rejected** — dipertimbangkan dan ditolak; simpan alasan agar tidak dibuka ulang tanpa konteks baru.

Keputusan produk pengguna tetap dicatat di `docs/konteks-penggunaan.md`. ADR dapat merujuk butir produk itu, tetapi tidak boleh menyimpulkan persetujuan pengguna dari dokumen proposal atau perilaku kode lama.

## Membuat ADR

1. Gunakan nama berurutan, misalnya `0001-scope-laporan-perilaku.md`.
2. Awali sebagai **Proposed** bila belum disetujui. Jangan tandai **Accepted** tanpa persetujuan pemilik keputusan.
3. Tautkan GitHub Issue dan PR terkait. Jika keputusan berasal dari klarifikasi eksplisit, sebutkan tanggal/konteks tanpa menyimpan data sensitif yang tidak diperlukan.
4. Bila keputusan diganti, ubah status ADR lama menjadi **Superseded** dan tautkan ADR baru; jangan menulis ulang sejarahnya seolah keputusan lama tidak pernah ada.

## Template

```markdown
# ADR-NNNN: Judul keputusan

- Status: Proposed | Accepted | Superseded | Rejected
- Tanggal: YYYY-MM-DD
- Issue: #<number atau tautan>
- PR: #<number atau tautan, bila ada>

## Konteks
Masalah, batasan, dan sumber kebutuhan.

## Keputusan
Pilihan yang disetujui secara eksplisit. Jika masih usulan, biarkan status Proposed.

## Alternatif yang dipertimbangkan
- Alternatif dan alasan menerima/menolak.

## Konsekuensi
- Dampak positif, trade-off, risiko, dan pekerjaan lanjutan.

## Referensi
- Tautan ke keputusan produk, spesifikasi, kode/migration, Issue, dan PR terkait.
```

Jangan membuat ADR untuk setiap perubahan implementasi kecil. Pilih keputusan yang perlu dipahami ulang di masa depan atau keputusan yang jika berubah akan berdampak luas.
