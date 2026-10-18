# Instruksi Pengembangan untuk Copilot

Sebelum mengubah kode atau dokumentasi, baca [`docs/source-of-truth/README.md`](../docs/source-of-truth/README.md) dan sumber yang ditunjuk olehnya.

- Untuk kebutuhan produk, hanya butir berstatus **DIKONFIRMASI** atau keputusan ADR berstatus **Accepted** yang mengikat. Rancangan, rekomendasi, dan pertanyaan terbuka bukan persetujuan.
- Jika kebutuhan, keamanan, atau perilaku yang diminta ambigu atau bertentangan, jangan menebak kebijakan. Tanyakan klarifikasi sebelum mengubah perilaku tersebut.
- Untuk perilaku yang benar-benar berjalan, periksa kode, tes, dan migrasi database/RLS. Jangan menganggap pemeriksaan UI saja sebagai otorisasi server.
- Buat perubahan yang terarah; pertahankan perubahan pengguna yang sudah ada dan jangan mengubah area di luar permintaan.
- Ikuti tipe, pola, dan konvensi proyek. Hindari tipe longgar, kegagalan diam-diam, dan fallback yang tampak sukses.
- Jalankan pemeriksaan terkecil yang relevan setelah perubahan. Laporkan apa yang dijalankan dan keterbatasannya; jangan menyatakan verifikasi yang belum dilakukan.
- Gunakan GitHub Issue sebagai pelacak pekerjaan kanonis dan hubungkan PR ke Issue. Jangan membuat daftar backlog/status duplikat di dokumen.
- Perbarui dokumen keputusan hanya setelah keputusan dikonfirmasi. Catat keputusan stabil sebagai ADR dan tautkan Issue/PR terkait.
- Rujuk `docs/source-of-truth/active-work.md` untuk rencana kerja yang sedang dikerjakan; perbarui atau tutup rencana saat pekerjaan selesai.

Instruksi ini melengkapi, bukan menggantikan, permintaan pengguna dan kebijakan keselamatan yang berlaku.
