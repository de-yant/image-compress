# ImageCompress by HaryantoLabs

> Kompresi foto batch secara lokal di browser. Jaga kualitas, kurangi ukuran.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/de-yant/image-compress)

## Demo

🔗 **[Live Demo](https://image-compress.vercel.app)**

## Fitur

- **Batch Upload** — Pilih banyak foto sekaligus, atau upload seluruh folder
- **Target Ukuran** — Preset 100 KB, 250 KB, 500 KB, 750 KB, 1 MB, serta Custom
- **Kualitas Optimal** — Binary search otomatis menemukan kualitas tertinggi yang memenuhi target
- **Nama File Tetap** — Nama file hasil sama persis dengan file asli
- **Download ZIP** — Semua hasil dikemas dalam satu ZIP dengan struktur folder
- **Before/After Preview** — Slider perbandingan foto asli vs hasil kompresi
- **Dark & Light Mode** — Toggle tema, preferensi tersimpan di localStorage
- **100% Client-Side** — Tidak ada server, semua proses di browser Anda
- **Responsive** — Tampil optimal di HP maupun komputer

## Tech Stack

| Komponen | Teknologi |
|---|---|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Kompresi | Canvas API + Binary Search |
| Zip | [JSZip](https://github.com/stuk/jszip) |
| Download | [FileSaver.js](https://github.com/nickersoft/FileSaver.js) |
| Font | [Inter](https://fonts.google.com/specimen/Inter) |
| Deploy | Vercel |

## Struktur File

```
image-compress/
├── public/
│   ├── index.html          # Entry point
│   ├── css/
│   │   └── styles.css      # Modern dark/light UI
│   └── js/
│       └── app.js           # Compression logic + preview
├── vercel.json              # Vercel config
├── package.json             # Scripts
└── README.md
```

## Cara Pakai

### Local Development

```bash
# Clone repo
git clone https://github.com/de-yant/image-compress.git
cd image-compress

# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Buka **http://localhost:3000**

### Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Atau hubungkan repo GitHub di dashboard Vercel.

## Cara Kerja

1. **Upload** — Pilih foto atau folder via drag & drop / button
2. **Target** — Tentukan ukuran target (misal 500 KB)
3. **Kompresi** — Binary search mencari quality optimal per foto:
   - Canvas API untuk render gambar
   - `toDataURL()` dengan quality berbeda (1–100)
   - Bandingkan ukuran output dengan target
   - Kualitas tertinggi yang memenuhi target dipilih
4. **Hasil** — Preview Before/After dengan slider interaktif
5. **Download** — Semua hasil dikemas dalam ZIP

## Algoritma Kompresi

```
1. Baca ukuran, format, dimensi foto
2. Jika sudah < target → skip, gunakan asli
3. Binary search quality (1–100)
4. Untuk setiap mid quality:
   - Render ke Canvas
   - Export sebagai JPEG dengan quality = mid/100
   - Bandingkan ukuran dengan target
5. Kualitas tertinggi yang menghasilkan ukuran ≤ target → pemenang
6. Jika tidak ada yang memenuhi → gunakan quality terendah (5%)
```

## Browser Compatibility

| Browser | Status |
|---|---|
| Chrome 90+ | ✅ |
| Firefox 90+ | ✅ |
| Safari 14+ | ✅ |
| Edge 90+ | ✅ |

> **Note:** Fitur `webkitdirectory` (upload folder) tidak didukung di semua browser lama.

## License

MIT © 2026 HaryantoLabs
