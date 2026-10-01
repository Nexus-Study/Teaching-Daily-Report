[ ] fix-02 : 
## Ubah mata pelajaran
Mata pelajaran dipilih berdasarkan dropdown. Pengisian pertama kali akan menjadi referensi. pengisian berikutnya di {hari} yang sama akan memasukkan nilai default yang telah diisi sebelumnya tapi masih dapat diubah.
## ubah `jam ke` dari isian ke dropdown
format: `{jam_mulai}`-`{jam_selesai}`
baik `{jam_mulai}` dan `{jam_selesai}` berupa dropdown. Pilihan dropdown mulai angka 1-8 (numerik). `{jam_selesai}` tidak boleh lebih rendah dari jam mulai. pengisian pertama kali dengan constrain {hari} dan {jam_mulai} akan menjadi referensi. setiap pengisian akan mengubah isian `{jam_mulai}`-`{jam_selesai}` menjadi `jam_mulai-jam_selesai` ke server supabase (tabel jurnal_mengajar)

## nilai default
pengisian berikutnya di {hari} yang sama secara default mengisikan nama mata pelajaran, {jam_mulai} dan {jam_selesai}, tapi masih bisa diubah secara manual. 

pertanyaan: 
1. Mata pelajaran berupa data statis berjumlah 15 mata pelajaran, tertulis dibawah. Apakah perlu dimasukkan ke supabase atau cukup hardcoded di front-end saja?
Al-Qur'an Hadis
Akidah Akhlak
Fikih
SKI
Pendidikan Pancasila
Bahasa Indonesia
Bahasa Arab
Bahasa Inggris
Matematika
IPA
IPA
PJOK
Informatika
Seni dan Prakarya
Mulok
Kokurikuler

2. Saya berasumsi dibutuhkan tabel baru di Supabase, berisi data guru. formatnya akan seperti ini:
    full_name | nip_nisn | mapel | hari | jam_mulai | jam_selesai
apakah asumsi ini tepat?

informasi pendukung:
1. sql_schema.md
2. struktur_folder.png
3. app/portal/jurnal/page.tsx
4. app/portal/jurnal/action.ts