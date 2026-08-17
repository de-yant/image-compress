# IMAGECOMPRESS BY HARYANTOLABS

## Dokumen Spesifikasi & Rencana Pembuatan Aplikasi

**Tujuan:** Membuat aplikasi untuk mengecilkan ukuran banyak foto sekaligus dengan kualitas visual setinggi mungkin, mempertahankan nama file asli, dan menyediakan hasil dalam folder/ZIP dengan nama folder yang berbeda.

## 1. Ringkasan Aplikasi

**ImageCompress by HaryantoLabs** adalah aplikasi kompresi foto batch. Pengguna dapat memilih satu atau banyak foto, menentukan target ukuran seperti 500 KB, lalu aplikasi mencari tingkat kompresi terbaik agar ukuran file mendekati target dengan penurunan kualitas visual seminimal mungkin.

## 2. Prinsip Utama

| Kebutuhan | Ketentuan |
|---|---|
| Kompresi batch | Banyak foto dapat diproses sekaligus. |
| Target ukuran | Preset 100 KB, 250 KB, 500 KB, 750 KB, 1 MB, serta Custom. |
| Kualitas | Gunakan kualitas tertinggi yang masih memungkinkan target tercapai. |
| Nama file | WAJIB tetap sama persis dengan file asli. |
| Folder hasil | Nama folder hasil dibuat berbeda, misalnya `Foto Liburan_Compressed`. |
| Download | Semua hasil dapat dikemas dalam satu ZIP. |
| Foto asli | Tidak boleh ditimpa atau diubah. |
| Privasi | Versi web sebaiknya memproses foto secara lokal di browser. |

## 3. Alur Penggunaan

**Pilih Foto → Tentukan Target Ukuran → Mulai Kompresi → Tampilkan Progress → Preview/Informasi Hasil → Download ZIP**

## 4. Fitur Utama

- **Upload banyak foto:** Pilih 1, beberapa, puluhan, hingga ratusan foto sesuai kemampuan perangkat.
- **Target ukuran:** Target default dapat diset 500 KB, dengan pilihan preset dan Custom.
- **Kompresi otomatis:** Aplikasi mencari kualitas optimal per foto, bukan memakai satu quality level untuk semua foto.
- **Preview hasil:** Tampilkan ukuran awal, ukuran hasil, resolusi, dan penghematan.
- **Progress:** Tampilkan jumlah foto selesai dan progress keseluruhan.
- **Download ZIP:** Semua hasil dikemas dalam satu ZIP.
- **Penanganan file kecil:** Jika foto sudah lebih kecil dari target, tidak perlu dikompres agresif.
- **Error handling:** Jika satu foto gagal, foto lain tetap diproses dan kegagalan dilaporkan.

## 5. Aturan Nama File dan Folder

Nama setiap file hasil harus sama persis dengan nama file asli. Jangan menambahkan suffix seperti `_compressed`, `_small`, atau nomor tambahan.

**Contoh:**

Folder asli:

```text
Foto Liburan/
├── IMG_001.jpg
└── IMG_002.jpg
```

Folder hasil:

```text
Foto Liburan_Compressed/
├── IMG_001.jpg
└── IMG_002.jpg
```

## 6. Algoritma Kompresi

1. Baca ukuran, format, dimensi, dan metadata foto.
2. Tentukan target ukuran.
3. Pertahankan resolusi asli selama memungkinkan.
4. Kompres dengan quality tinggi.
5. Periksa ukuran hasil.
6. Jika terlalu besar, turunkan quality secara bertahap/efisien.
7. Gunakan binary search terhadap quality level agar pencarian lebih cepat.
8. Berhenti pada kualitas tertinggi yang memenuhi target atau hasil terbaik yang masih layak.

## 7. Resolusi dan Kualitas

Prioritas pertama adalah mempertahankan resolusi asli. Resize hanya dilakukan jika target ukuran tidak dapat dicapai tanpa menurunkan kualitas secara signifikan dan opsi resize diizinkan.

Aplikasi harus menghindari kompresi berlebihan.

## 8. Tampilan Hasil

| Foto | Ukuran Awal | Target | Hasil | Penghematan | Status |
|---|---:|---:|---:|---:|---|
| IMG_001.jpg | 1.02 MB | 500 KB | 498 KB | 51% | Selesai |
| IMG_002.jpg | 2.40 MB | 500 KB | 497 KB | 79% | Selesai |
| IMG_003.jpg | 850 KB | 500 KB | 492 KB | 42% | Selesai |

## 9. Ringkasan Batch

Contoh setelah 20 foto selesai:

```text
Ukuran awal  : 38.4 MB
Ukuran hasil : 9.7 MB
Penghematan  : 28.7 MB
Persentase   : 74.7%
```

## 10. Privasi dan Arsitektur

Untuk versi web, proses kompresi direkomendasikan berjalan langsung di perangkat pengguna/browser. Dengan demikian foto tidak perlu dikirim ke server.

Arsitektur dasar:

```text
Browser
   ↓
Pilih Foto
   ↓
Proses Kompresi Lokal
   ↓
Buat ZIP
   ↓
Download
```

## 11. Teknologi yang Disarankan

| Komponen | Rekomendasi |
|---|---|
| Frontend | HTML, CSS, JavaScript/TypeScript |
| Framework | React, Vue, atau Svelte (opsional) |
| Image processing | Canvas API / WebAssembly / library kompresi yang sesuai |
| Batch processing | Web Worker agar UI tetap responsif |
| ZIP | Library ZIP yang berjalan di browser |
| Deployment | Static web hosting; backend tidak wajib untuk MVP |

## 12. Acceptance Criteria

- [ ] Pengguna dapat memilih banyak foto sekaligus.
- [ ] Target ukuran dapat dipilih, termasuk 500 KB.
- [ ] Kompresi mencari kualitas terbaik untuk mencapai target.
- [ ] Nama file hasil sama persis dengan nama file asli.
- [ ] Tidak ada suffix tambahan pada nama file.
- [ ] Nama folder hasil berbeda dari folder asli.
- [ ] Semua hasil dapat di-download dalam satu ZIP.
- [ ] Foto asli tidak berubah.
- [ ] Progress dan status setiap foto ditampilkan.
- [ ] Ukuran awal, ukuran hasil, dan penghematan ditampilkan.
- [ ] Aplikasi responsif di HP dan komputer.
- [ ] Versi web dapat memproses foto secara lokal.

## 13. Prioritas MVP

Versi pertama difokuskan pada:

1. Upload banyak foto.
2. Target ukuran.
3. Kompresi otomatis dengan kualitas terbaik.
4. Nama file tetap.
5. Folder hasil berbeda.
6. ZIP download.
7. Progress.
8. Informasi ukuran.
9. Kompatibilitas HP dan komputer.
10. Pemrosesan lokal untuk menjaga privasi.

---

**Nama Produk:** ImageCompress by HaryantoLabs  
**Dokumen:** Spesifikasi Aplikasi v1.0  
**Tanggal:** 17 Agustus 2026
