---
description: "Use for UI design, frontend styling, and component work. Consult the project's design references and avoid generic or AI-looking interfaces."
applyTo:
  - "app/**/*.tsx"
  - "app/**/*.css"
---

# Kualitas UI dan Rujukan Desain

Sebelum mengubah antarmuka, baca [katalog website rujukan](../../docs/daftar/daftar-website-rujukan.md), [daftar skill desain](../../docs/daftar/daftar-skill.md), dan [evaluasi UI proyek](../../docs/proyek-ui-slop-evaluasi.md). Periksa juga komponen, token, dan pola yang sudah digunakan di area terkait.

## Prosedur

1. Pahami tugas pengguna, data/konten yang benar-benar tersedia, kebutuhan responsif, dan pola proyek. Jangan mengubah perilaku atau menambahkan fitur hanya demi tampilan.
2. Pilih satu atau dua referensi yang relevan dari katalog. Jika akses web tersedia, tinjau contoh spesifik dan gunakan hanya prinsip yang cocok; jika tidak, jangan mengarang detail yang tidak terlihat.
3. Jika skill `anti-slop-design` atau `design-taste-frontend` tersedia di sesi, gunakan sebagai bantuan untuk pekerjaan yang sesuai. Jangan menganggap tautan skill berarti skill sudah terpasang, dan jangan mengklaim telah menggunakannya jika tidak tersedia.
4. Adaptasikan prinsip referensi ke kebutuhan aplikasi. Pertahankan identitas produk, pola komponen, token tema, ikonografi, dan fungsi yang ada kecuali permintaan atau kebutuhan yang disepakati mengharuskan perubahan.
5. Saat melaporkan pekerjaan, sebutkan prinsip atau referensi yang memengaruhi keputusan visual dan keterbatasan inspeksi yang relevan.

## Standar hasil

- Hindari komposisi cetakan yang terasa dapat dipertukarkan: hero, kartu, grid, label kecil, radius, bayangan, atau gradien yang dipakai tanpa alasan dari tugas.
- Pastikan setiap elemen visual memiliki fungsi dan prioritas yang jelas. Jangan menambah metrik vanity, klaim, gambar placeholder, dekorasi, atau konten yang tidak bersumber dari produk.
- Gunakan hierarki tipografi dan ruang yang mendukung pemindaian; jangan mengecilkan label atau teks penting demi memenuhi layout.
- Utamakan aksesibilitas keyboard, fokus terlihat, label kontrol yang jelas, kontras yang memadai, ukuran target sentuh yang nyaman, dan state loading, kosong, error, serta disabled yang sesuai.
- Uji atau tinjau layout pada viewport mobile dan desktop. Pertahankan navigasi dan alur kerja sesuai peran serta tugas pengguna; jangan mengubah navigasi fungsional menjadi pola pemasaran.
- Gunakan animasi hanya bila membantu pemahaman, dan hormati `prefers-reduced-motion` ketika menambah atau mengubah gerak.

Pola dalam evaluasi UI proyek adalah bahan pertimbangan kontekstual, bukan larangan otomatis. Pilih solusi berdasarkan fungsi dan pengguna, bukan sekadar menghindari checklist.
